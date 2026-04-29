import { HttpError } from "./errors.js";

const FAMILY_NAME_MAX = 40;
const MEMBER_NAME_MAX = 20;
const TITLE_MAX = 80;
const COMMENT_MAX = 120;

export function requireString(value, field, { min = 1, max } = {}) {
  if (typeof value !== "string") {
    throw new HttpError(400, "validation_error", `${field} must be a string.`, {
      field,
    });
  }

  const trimmed = value.trim();
  if (trimmed.length < min || (max && trimmed.length > max)) {
    throw new HttpError(
      400,
      "validation_error",
      `${field} must be between ${min} and ${max ?? "∞"} characters.`,
      { field },
    );
  }

  return trimmed;
}

export function validateFamilyName(value) {
  return requireString(value, "familyName", { min: 1, max: FAMILY_NAME_MAX });
}

export function validateDisplayName(value, field = "displayName") {
  return requireString(value, field, { min: 1, max: MEMBER_NAME_MAX });
}

export function validateMemberId(value) {
  return requireString(value, "memberId", { min: 1, max: 64 });
}

export function validateInviteCode(value) {
  const inviteCode = requireString(value, "inviteCode", { min: 6, max: 6 }).toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(inviteCode)) {
    throw new HttpError(400, "validation_error", "inviteCode must be 6 uppercase letters or digits.", {
      field: "inviteCode",
    });
  }
  return inviteCode;
}

export function validateDate(value) {
  const date = requireString(value, "date", { min: 10, max: 10 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, "validation_error", "date must use YYYY-MM-DD format.", {
      field: "date",
    });
  }
  return date;
}

export function validateCookTime(value) {
  const time = requireString(value, "cookTime", { min: 4, max: 5 });
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new HttpError(400, "validation_error", "cookTime must use HH:MM format.", {
      field: "cookTime",
    });
  }
  return time;
}

export function validateTitle(value) {
  return requireString(value, "title", { min: 1, max: TITLE_MAX });
}

export function validateOptionalComment(value) {
  if (value == null || value === "") {
    return "";
  }
  return requireString(value, "comment", { min: 1, max: COMMENT_MAX });
}

export function validateShoppingNeeded(value) {
  if (typeof value !== "boolean") {
    throw new HttpError(400, "validation_error", "shoppingNeeded must be a boolean.", {
      field: "shoppingNeeded",
    });
  }
  return value;
}

export function validateShoppingItems(value) {
  if (!Array.isArray(value)) {
    throw new HttpError(400, "validation_error", "shoppingItems must be an array.", {
      field: "shoppingItems",
    });
  }
  return value.map((item, index) =>
    requireString(item, `shoppingItems[${index}]`, { min: 1, max: 40 }),
  );
}

export function validateDishes(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, "validation_error", "dishes must be a non-empty array.", {
      field: "dishes",
    });
  }

  return value.map((dish, index) => {
    if (!dish || typeof dish !== "object") {
      throw new HttpError(400, "validation_error", "Each dish must be an object.", {
        field: `dishes[${index}]`,
      });
    }

    return {
      id: `dish-${index + 1}`,
      name: requireString(dish.name, `dishes[${index}].name`, { min: 1, max: 40 }),
      servings: requireString(dish.servings, `dishes[${index}].servings`, { min: 1, max: 20 }),
      notes: dish.notes ? requireString(dish.notes, `dishes[${index}].notes`, { min: 1, max: 80 }) : "",
    };
  });
}

const RSVP_STATUSES = new Set(["going", "late", "skip"]);

export function validateRsvpStatus(value) {
  const status = requireString(value, "status", { min: 4, max: 5 });
  if (!RSVP_STATUSES.has(status)) {
    throw new HttpError(400, "validation_error", "status must be one of going, late, skip.", {
      field: "status",
    });
  }
  return status;
}

export function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "validation_error", "Request body must be a JSON object.");
  }
  return value;
}
