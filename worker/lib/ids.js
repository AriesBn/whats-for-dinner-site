const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomToken(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let value = "";
  for (let i = 0; i < bytes.length; i += 1) {
    value += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return value;
}

export function createFamilyId() {
  return `fam_${randomToken(6).toLowerCase()}`;
}

export function createInviteCode() {
  return randomToken(6);
}

export function createMemberId(role, count) {
  const prefix = role === "host" ? "host" : "member";
  return `${prefix}-${count}`;
}
