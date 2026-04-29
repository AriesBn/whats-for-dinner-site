export function familyKey(familyId) {
  return `family:${familyId}`;
}

export function familyMembersKey(familyId) {
  return `family-members:${familyId}`;
}

export function inviteCodeKey(inviteCode) {
  return `family-invite:${inviteCode}`;
}

export function dinnerPlanKey(familyId, date) {
  return `dinner-plan:${familyId}:${date}`;
}

export function dinnerRsvpKey(familyId, date) {
  return `dinner-rsvp:${familyId}:${date}`;
}

export function dinnerImageAttemptKey(familyId, date) {
  return `dinner-image-attempts:${familyId}:${date}`;
}
