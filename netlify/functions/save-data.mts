import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid body" }), { status: 400 });
  }

  const code = (body.code || "").trim().toUpperCase();
  const kind = (body.kind || "").trim();
  const payload = body.payload;

  if (!code || !kind || payload === undefined) {
    return new Response(JSON.stringify({ error: "missing fields" }), { status: 400 });
  }

  const codesStore = getStore("access-codes");
  const entry = await codesStore.get(code, { type: "json" });
  if (!entry || !entry.active) {
    return new Response(JSON.stringify({ error: "invalid code" }), { status: 403 });
  }

  const dataStore = getStore("cv-data");
  await dataStore.setJSON(`${code}:${kind}`, payload);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/save-data",
};
