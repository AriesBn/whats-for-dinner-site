import { getFamily, requireHost, requireMember } from "../lib/families.js";
import { HttpError } from "../lib/errors.js";
import { buildDinnerImagePrompt } from "../lib/prompt.js";
import { generateRecipeImage, getImageAttemptLimit, storeDinnerImage } from "../lib/images.js";
import { json, ok, readJson, withErrorHandling } from "../lib/http.js";
import { dinnerImageAttemptKey, dinnerPlanKey, dinnerRsvpKey } from "../lib/keys.js";
import { kvGetJson, kvPutJson } from "../lib/store.js";
import {
  requireObject,
  validateCookTime,
  validateDate,
  validateDishes,
  validateDisplayName,
  validateMemberId,
  validateOptionalComment,
  validateRsvpStatus,
  validateShoppingItems,
  validateShoppingNeeded,
  validateTitle,
} from "../lib/validation.js";

function matchFamilyPath(pathname) {
  return pathname.match(/^\/api\/families\/([^/]+)\/(dinner|rsvp|dinner\/image)$/);
}

async function handleDinner(request, env, url) {
  const match = matchFamilyPath(url.pathname);
  if (!match) {
    return null;
  }

  const familyId = match[1];
  const resource = match[2];

  if (resource === "dinner" && request.method === "GET") {
    return getDinner(env, familyId, url);
  }

  if (resource === "dinner" && request.method === "PUT") {
    return updateDinner(request, env, familyId);
  }

  if (resource === "dinner/image" && request.method === "POST") {
    return generateDinnerImage(request, env, familyId);
  }

  if (resource === "rsvp" && request.method === "POST") {
    return upsertRsvp(request, env, familyId);
  }

  return json(
    {
      error: {
        code: "method_not_allowed",
        message: "Method not allowed for this route.",
      },
    },
    { status: 405 },
  );
}

async function getDinner(env, familyId, url) {
  const date = validateDate(url.searchParams.get("date") || "");
  const [family, plan, rsvps] = await Promise.all([
    getFamily(env, familyId),
    kvGetJson(env, dinnerPlanKey(familyId, date)),
    kvGetJson(env, dinnerRsvpKey(familyId, date), []),
  ]);

  return ok({
    family: {
      id: family.id,
      name: family.name,
    },
    plan,
    rsvps,
  });
}

async function updateDinner(request, env, familyId) {
  const body = requireObject(await readJson(request));
  const memberId = validateMemberId(body.memberId);
  const date = validateDate(body.date);
  await requireHost(env, familyId, memberId);
  const existingPlan = await kvGetJson(env, dinnerPlanKey(familyId, date));

  const plan = {
    familyId,
    date,
    title: validateTitle(body.title),
    dishes: validateDishes(body.dishes),
    cookTime: validateCookTime(body.cookTime),
    shoppingNeeded: validateShoppingNeeded(body.shoppingNeeded),
    shoppingItems: validateShoppingItems(body.shoppingItems ?? []),
    imageStatus: "pending",
    imagePrompt: existingPlan?.imagePrompt ?? "",
    imageUrl: existingPlan?.imageUrl ?? "",
    imageError: "",
    updatedBy: memberId,
    updatedAt: new Date().toISOString(),
  };

  await kvPutJson(env, dinnerPlanKey(familyId, date), plan);

  return ok({
    ok: true,
    plan: {
      familyId: plan.familyId,
      date: plan.date,
      imageStatus: plan.imageStatus,
    },
  });
}

async function generateDinnerImage(request, env, familyId) {
  const body = requireObject(await readJson(request));
  const memberId = validateMemberId(body.memberId);
  const date = validateDate(body.date);
  await requireHost(env, familyId, memberId);

  const key = dinnerPlanKey(familyId, date);
  const plan = await kvGetJson(env, key);
  if (!plan) {
    throw new HttpError(404, "dinner_plan_not_found", "Dinner plan not found for this date.", {
      familyId,
      date,
    });
  }

  const attemptsKey = dinnerImageAttemptKey(familyId, date);
  const attemptState = (await kvGetJson(env, attemptsKey, { count: 0 })) ?? { count: 0 };
  if (attemptState.count >= getImageAttemptLimit()) {
    throw new HttpError(
      429,
      "image_generation_limit_reached",
      `Image generation is limited to ${getImageAttemptLimit()} times per family per day.`,
      { familyId, date, limit: getImageAttemptLimit() },
    );
  }

  const prompt = buildDinnerImagePrompt(plan);
  const timestamp = Math.floor(Date.now() / 1000);
  const nextAttemptState = { count: attemptState.count + 1, updatedAt: new Date().toISOString() };
  await kvPutJson(env, attemptsKey, nextAttemptState);

  try {
    const imageBytes = await generateRecipeImage(env, prompt);
    const stored = await storeDinnerImage(env, familyId, date, imageBytes, timestamp);
    const updatedPlan = {
      ...plan,
      imagePrompt: prompt,
      imageStatus: "ready",
      imageUrl: stored.imageUrl,
      imageObjectKey: stored.objectKey,
      imageError: "",
      updatedBy: memberId,
      updatedAt: new Date().toISOString(),
    };
    await kvPutJson(env, key, updatedPlan);

    return ok({
      ok: true,
      imageUrl: updatedPlan.imageUrl,
      imageStatus: updatedPlan.imageStatus,
    });
  } catch (error) {
    const normalizedError = error instanceof HttpError
      ? error
      : new HttpError(502, "image_generation_failed", "Image generation failed, please retry later.");
    const updatedPlan = {
      ...plan,
      imagePrompt: prompt,
      imageStatus: "failed",
      imageError: normalizedError.message,
      updatedBy: memberId,
      updatedAt: new Date().toISOString(),
    };
    await kvPutJson(env, key, updatedPlan);

    return json(
      {
        ok: false,
        recoverable: true,
        plan: {
          familyId: plan.familyId,
          date: plan.date,
          imageStatus: updatedPlan.imageStatus,
        },
        error: {
          code: normalizedError.code,
          message: normalizedError.message,
        },
      },
      { status: normalizedError.status },
    );
  }
}

async function upsertRsvp(request, env, familyId) {
  const body = requireObject(await readJson(request));
  const memberId = validateMemberId(body.memberId);
  const date = validateDate(body.date);
  const { member } = await requireMember(env, familyId, memberId);
  const displayName = body.displayName
    ? validateDisplayName(body.displayName)
    : member.displayName;
  const rsvp = {
    memberId,
    displayName,
    status: validateRsvpStatus(body.status),
    comment: validateOptionalComment(body.comment),
    updatedAt: new Date().toISOString(),
  };

  const key = dinnerRsvpKey(familyId, date);
  const current = await kvGetJson(env, key, []);
  const next = current.filter((item) => item.memberId !== memberId);
  next.push(rsvp);
  await kvPutJson(env, key, next);

  return ok({
    ok: true,
    rsvp: {
      memberId: rsvp.memberId,
      status: rsvp.status,
      comment: rsvp.comment,
    },
  });
}

export const handleDinnerRoutes = withErrorHandling(handleDinner);
