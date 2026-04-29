export function groupKey(groupId) {
  return `group:${groupId}`;
}

export function groupMembersKey(groupId) {
  return `group-members:${groupId}`;
}

export function inviteCodeKey(inviteCode) {
  return `group-invite:${inviteCode}`;
}

export function tonightMealKey(groupId, date) {
  return `group:${groupId}:tonight-meal:${date}`;
}

export function mealResponseKey(groupId, date) {
  return `group:${groupId}:meal-response:${date}`;
}

export function dinnerImageAttemptKey(groupId, date) {
  return `group:${groupId}:meal-image-attempts:${date}`;
}
