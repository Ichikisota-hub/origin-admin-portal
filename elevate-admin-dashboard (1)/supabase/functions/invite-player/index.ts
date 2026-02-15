import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Fix: Using (Deno as any) to resolve "Property 'env' does not exist on type 'typeof Deno'" error
const supabase = createClient(
  (Deno as any).env.get("SUPABASE_URL") || "",
  (Deno as any).env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// Fix: Using (Deno as any).serve to resolve "Property 'serve' does not exist on type 'typeof Deno'" error
(Deno as any).serve(async (req) => {

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ★ 追加：ログインユーザーを取得（JWT検証）
const authHeader = req.headers.get("Authorization");

if (!authHeader) {
  return new Response(
    JSON.stringify({ error: "No JWT" }),
    { status: 401, headers: corsHeaders }
  );
}

const token = authHeader.replace("Bearer ", "");

const {
  data: { user },
} = await supabase.auth.getUser(token);

if (!user) {
  return new Response(
    JSON.stringify({ error: "Invalid JWT" }),
    { status: 401, headers: corsHeaders }
  );
}
    // 【修正】roleをbodyから取得するように変更（デフォルトは player）
    const { name, email, role = "player" } = await req.json();

    // Invite user via Supabase Auth Admin API
    const { data, error } =
      await supabase.auth.admin.inviteUserByEmail(email);

    if (error) {
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert profile into users table
    const { error: dbError } = await supabase.from("users").insert({
      id: data.user.id,
      name,
      email,
      role: role, // 【修正】動的にロールを設定
    });

    if (dbError) {
      return new Response(JSON.stringify(dbError), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
