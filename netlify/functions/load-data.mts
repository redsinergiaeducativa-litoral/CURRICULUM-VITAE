import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").trim().toUpperCase();
  const kind = (url.searchParams.get("kind") || "").trim();

  if (!code || !kind) {
    return new Response(JSON.stringify({ error: "missing fields" }), { status: 400 });
  }

  const codesStore = getStore("access-codes");
  const entry = await codesStore.get(code, { type: "json" });
  if (!entry || !entry.active) {
    return new Response(JSON.stringify({ error: "invalid code" }), { status: 403 });
  }

  const dataStore = getStore("cv-data");
  const data = await dataStore.get(`${code}:${kind}`, { type: "json" });

  return new Response(JSON.stringify({ data: data || null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/load-data",
};
