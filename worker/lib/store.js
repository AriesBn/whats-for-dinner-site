import { HttpError } from "./errors.js";

function requireKv(env) {
  if (!env.DINNER_APP_KV) {
    throw new HttpError(500, "missing_binding", "DINNER_APP_KV binding is not configured.");
  }
  return env.DINNER_APP_KV;
}

export async function kvGetJson(env, key, fallback = null) {
  const kv = requireKv(env);
  const value = await kv.get(key, "json");
  return value ?? fallback;
}

export async function kvPutJson(env, key, value) {
  const kv = requireKv(env);
  await kv.put(key, JSON.stringify(value));
}

export async function kvGetText(env, key) {
  const kv = requireKv(env);
  return kv.get(key, "text");
}

export async function kvPutText(env, key, value) {
  const kv = requireKv(env);
  await kv.put(key, value);
}
