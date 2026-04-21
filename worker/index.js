import { kvManagedKeys } from "../src/button-links.js";

function json(data, init = {}) {
  return Response.json(data, {
    headers: {
      "cache-control": "no-store",
    },
    ...init,
  });
}

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/button-links" && request.method === "GET") {
      const links = await readButtonLinks(env);
      return json({ links });
    }

    return new Response("Not found", { status: 404 });
  },
};
