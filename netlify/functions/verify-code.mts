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
  if (!code) {
    return new Response(JSON.stringify({ valid: false }), { status: 200 });
  }

  const store = getStore("access-codes");
  const entry = await store.get(code, { type: "json" });

  if (entry && entry.active) {
    return new Response(JSON.stringify({ valid: true, label: entry.label || null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ valid: false }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/verify-code",
};
