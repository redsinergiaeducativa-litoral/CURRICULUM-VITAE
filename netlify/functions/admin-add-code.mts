import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405 });
  }

  const secret = req.headers.get("x-admin-secret");
  const expected = Netlify.env.get("ADMIN_SECRET");

  if (!expected || secret !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid body" }), { status: 400 });
  }

  const code = (body.code || "").trim().toUpperCase();
  const label = (body.label || "").trim();

  if (!code) {
    return new Response(JSON.stringify({ error: "missing code" }), { status: 400 });
  }

  const store = getStore("access-codes");
  await store.setJSON(code, { active: true, label, createdAt: new Date().toISOString() });

  return new Response(JSON.stringify({ ok: true, code }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/admin-add-code",
};
