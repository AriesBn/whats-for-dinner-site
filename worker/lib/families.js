import { HttpError } from "./errors.js";
import { createFamilyId, createInviteCode, createMemberId } from "./ids.js";
import { groupKey, groupMembersKey, inviteCodeKey } from "./keys.js";
import { kvGetJson, kvGetText, kvPutJson, kvPutText } from "./store.js";

export async function getFamily(env, familyId) {
  const family = await kvGetJson(env, groupKey(familyId));
  if (!family) {
    throw new HttpError(404, "family_not_found", "Family not found.", { familyId });
  }
  return family;
}

export async function getFamilyMembers(env, familyId) {
  return kvGetJson(env, groupMembersKey(familyId), []);
}

export async function requireMember(env, familyId, memberId) {
  const members = await getFamilyMembers(env, familyId);
  const member = members.find((item) => item.id === memberId);
  if (!member) {
    throw new HttpError(403, "member_not_in_family", "memberId is not part of this family.", {
      familyId,
      memberId,
    });
  }
  return { member, members };
}

export async function requireHost(env, familyId, memberId) {
  const { member, members } = await requireMember(env, familyId, memberId);
  if (member.role !== "host") {
    throw new HttpError(403, "host_required", "Only the family host can perform this action.", {
      familyId,
      memberId,
    });
  }
  return { member, members };
}

export async function createFamily(env, familyName, hostName, nowIso) {
  let inviteCode = null;
  let attempts = 0;
  while (!inviteCode && attempts < 10) {
    attempts += 1;
    const candidate = createInviteCode();
    const exists = await kvGetText(env, inviteCodeKey(candidate));
    if (!exists) {
      inviteCode = candidate;
    }
  }

  if (!inviteCode) {
    throw new HttpError(503, "invite_code_unavailable", "Could not allocate an invite code.");
  }

  const familyId = createFamilyId();
  const family = {
    id: familyId,
    name: familyName,
    inviteCode,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdBy: "host-1",
  };
  const hostMember = {
    id: createMemberId("host", 1),
    displayName: hostName,
    role: "host",
    joinedAt: nowIso,
  };

  await Promise.all([
    kvPutJson(env, groupKey(familyId), family),
    kvPutJson(env, groupMembersKey(familyId), [hostMember]),
    kvPutText(env, inviteCodeKey(inviteCode), familyId),
  ]);

  return { family, hostMember };
}

export async function joinFamily(env, inviteCode, displayName, nowIso) {
  const familyId = await kvGetText(env, inviteCodeKey(inviteCode));
  if (!familyId) {
    throw new HttpError(404, "invite_code_not_found", "Invite code not found.", {
      inviteCode,
    });
  }

  const family = await getFamily(env, familyId);
  const members = await getFamilyMembers(env, familyId);

  const existingMember = members.find((member) => member.displayName === displayName);
  if (existingMember) {
    return { family, member: existingMember, reused: true };
  }

  const member = {
    id: createMemberId("member", members.length + 1),
    displayName,
    role: "member",
    joinedAt: nowIso,
  };

  await kvPutJson(env, groupMembersKey(familyId), [...members, member]);

  return { family, member, reused: false };
}
