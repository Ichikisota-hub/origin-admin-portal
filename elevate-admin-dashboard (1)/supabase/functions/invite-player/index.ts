import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token", // x-user-tokenを許可に追加
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = (Deno as any).env.get("SUPABASE_URL") || "";
const supabaseServiceRole = (Deno as any).env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceRole);

(Deno as any).serve(async (req: Request) => {
  // CORS プリフライト対応
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. フロントから送られてきた「本当のユーザートークン」を取得
    const userToken = req.headers.get("x-user-token");

    if (!userToken) {
      return new Response(
        JSON.stringify({ error: "認証トークンがありません" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. JWTの検証（このトークンが正しいログインユーザーのものか確認）
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "不正な認証トークンです" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. リクエストボディの取得
    const { name, email, role = "player" } = await req.json();

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "名前とメールアドレスは必須です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. ユーザーを招待（Auth）
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name, role, case_name: "獲得wifi" } // 後の管理のためにメタデータを入れる
    });

    if (inviteError) {
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. profiles（users）テーブルに情報を保存
    const { error: dbError } = await supabase.from("users").insert({
      id: inviteData.user.id,
      name: name,
      email: email,
      role: role,
    });

    if (dbError) {
      // Auth招待は成功したがDB保存に失敗した場合
      return new Response(
        JSON.stringify({ error: "DB登録失敗: " + dbError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "招待を送信しました" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || "予期せぬエラーが発生しました" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
