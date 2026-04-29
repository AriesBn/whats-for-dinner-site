import { createFamily, joinFamily } from "../lib/families.js";
import { ok, readJson, withErrorHandling } from "../lib/http.js";
import {
  requireObject,
  validateDisplayName,
  validateFamilyName,
  validateInviteCode,
} from "../lib/validation.js";

async function handleFamilies(request, env, url) {
  if (url.pathname === "/api/families" && request.method === "POST") {
    const body = requireObject(await readJson(request));
    const nowIso = new Date().toISOString();
    const { family, hostMember } = await createFamily(
      env,
      validateFamilyName(body.familyName),
      validateDisplayName(body.hostName, "hostName"),
      nowIso,
    );

    return ok(
      {
        family: {
          id: family.id,
          name: family.name,
          inviteCode: family.inviteCode,
        },
        hostMember: {
          id: hostMember.id,
          displayName: hostMember.displayName,
          role: hostMember.role,
        },
      },
      201,
    );
  }

  if (url.pathname === "/api/families/join" && request.method === "POST") {
    const body = requireObject(await readJson(request));
    const nowIso = new Date().toISOString();
    const { family, member } = await joinFamily(
      env,
      validateInviteCode(body.inviteCode),
      validateDisplayName(body.displayName),
      nowIso,
    );

    return ok({
      family: {
        id: family.id,
        name: family.name,
      },
      member: {
        id: member.id,
        displayName: member.displayName,
        role: member.role,
      },
    });
  }

  return null;
}

export const handleFamilyRoutes = withErrorHandling(handleFamilies);
