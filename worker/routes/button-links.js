import { kvManagedKeys } from "../../src/button-links.js";
import { ok } from "../lib/http.js";

async function readButtonLinks(env) {
  if (!env.BUTTON_LINKS) {
    return {};
  }

  const values = await env.BUTTON_LINKS.get(kvManagedKeys, "text");
  const links = {};

  for (const key of kvManagedKeys) {
    const value = values.get(key);
    if (value) {
      links[key] = value;
    }
  }

  return links;
}

export async function handleButtonLinks(env) {
  const links = await readButtonLinks(env);
  return ok({ links });
}
