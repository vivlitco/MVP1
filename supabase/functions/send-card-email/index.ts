import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase configuration is missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired authentication token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const userId = user.id;

    const { recipientEmail, senderName, personalMessage, cardId } = await req.json();

    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return new Response(JSON.stringify({ error: "Invalid recipient email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (!cardId) {
      return new Response(JSON.stringify({ error: "Card ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (!senderName || senderName.length > 100) {
      return new Response(JSON.stringify({ error: "Sender name is required and must be under 100 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (personalMessage && personalMessage.length > 500) {
      return new Response(JSON.stringify({ error: "Personal message must be under 500 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Verify user owns this card
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id, share_token, user_id, recipient_name, cover_preset")
      .eq("id", cardId)
      .maybeSingle();

    if (cardError || !card) {
      return new Response(JSON.stringify({ error: "Card not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (card.user_id !== userId) {
      return new Response(JSON.stringify({ error: "You do not have permission to share this card" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const baseUrl = req.headers.get("origin") || "https://vivlit.app";
    const shareUrl = `${baseUrl}/card/${card.share_token}`;

    const safeSenderName = escapeHtml(senderName.trim());
    const safeRecipientName = card.recipient_name ? escapeHtml(card.recipient_name) : null;
    const safePersonalMessage = personalMessage ? escapeHtml(personalMessage.trim()) : null;

    const coverEmojis: Record<string, string> = {
      floral: '💐', hearts: '💕', stars: '🌟', balloons: '🎈', cake: '🎂',
      butterfly: '🦋', sunset: '🌅', rainbow: '🌈', sparkles: '✨',
    };
    const emoji = coverEmojis[card.cover_preset] || '💌';

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vivlit <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `${safeSenderName} sent you a special e-card! ${emoji}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf5ff;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #e879f9 0%, #c084fc 50%, #818cf8 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                <p style="font-size: 48px; margin: 0 0 8px;">${emoji}</p>
                <h1 style="color: white; font-size: 26px; margin: 0;">You've received an E-Card!</h1>
              </div>
              <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px;">
                  <strong>${safeSenderName}</strong> has crafted a beautiful e-card${safeRecipientName ? ` for <strong>${safeRecipientName}</strong>` : ''} — sealed with love and waiting to be opened!
                </p>
                ${safePersonalMessage ? `
                  <div style="background: #faf5ff; padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #c084fc;">
                    <p style="color: #6b21a8; font-style: italic; margin: 0;">"${safePersonalMessage}"</p>
                  </div>
                ` : ''}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${shareUrl}" style="display: inline-block; background: linear-gradient(135deg, #e879f9, #c084fc); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    Open Your E-Card ${emoji}
                  </a>
                </div>
                <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 24px;">
                  Break the seal to reveal what's inside ✨
                </p>
                <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
                  Made with 💜 on Vivlit
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResponse = await response.json();
    if (!response.ok) throw new Error(emailResponse.message || "Failed to send email");

    console.log("Card email sent by user:", userId, "to:", recipientEmail, "for card:", cardId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-card-email function:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
