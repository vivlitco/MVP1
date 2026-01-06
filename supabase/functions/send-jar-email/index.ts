/// <reference path="./deno.d.ts" />
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface JarEmailRequest {
  recipientEmail: string;
  senderName: string;
  personalMessage?: string;
  jarId: string;
}

// HTML escape function to prevent XSS/injection attacks
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Extract and verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { recipientEmail, senderName, personalMessage, jarId }: JarEmailRequest = await req.json();

    // Input validation
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!jarId) {
      return new Response(
        JSON.stringify({ error: "Jar ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!senderName || senderName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Sender name is required and must be under 100 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (personalMessage && personalMessage.length > 500) {
      return new Response(
        JSON.stringify({ error: "Personal message must be under 500 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the user owns or has access to this jar
    const { data: jar, error: jarError } = await supabase
      .from("jars")
      .select("id, name, share_token, user_id")
      .eq("id", jarId)
      .maybeSingle();

    if (jarError) {
      console.error("Jar fetch error:", jarError);
      return new Response(
        JSON.stringify({ error: "Error fetching jar information" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!jar) {
      return new Response(
        JSON.stringify({ error: "Jar not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the authenticated user owns this jar or is a co-owner
    if (jar.user_id !== user.id) {
      const { data: ownership } = await supabase
        .from("jar_owners")
        .select("id")
        .eq("jar_id", jarId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!ownership) {
        return new Response(
          JSON.stringify({ error: "You do not have permission to share this jar" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Build the secure share URL using the jar's share_token
    const baseUrl = req.headers.get("origin") || "https://vivlit.com";
    const shareUrl = `${baseUrl}/jar/${jar.share_token}`;

    // Escape all user inputs to prevent HTML/script injection
    const safeSenderName = escapeHtml(senderName.trim());
    const safeJarName = escapeHtml(jar.name);
    const safePersonalMessage = personalMessage ? escapeHtml(personalMessage.trim()) : null;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vivlit <noreply@vivlit.com>",
        to: [recipientEmail],
        subject: `${safeSenderName} shared a jar of notes with you! 🎁`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #faf5ff;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #e879f9 0%, #c084fc 50%, #818cf8 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0;">🎁 You've Got a Gift!</h1>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px;">
                  <strong>${safeSenderName}</strong> has created a special jar of notes just for you!
                </p>
                
                ${safePersonalMessage ? `
                  <div style="background: #faf5ff; padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #c084fc;">
                    <p style="color: #6b21a8; font-style: italic; margin: 0;">"${safePersonalMessage}"</p>
                  </div>
                ` : ''}
                
                <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
                  This jar called "<strong>${safeJarName}</strong>" is filled with heartfelt messages waiting to be discovered. Open it and let the surprises unfold! ✨
                </p>
                
                <div style="text-align: center;">
                  <a href="${shareUrl}" style="display: inline-block; background: linear-gradient(135deg, #e879f9, #c084fc); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    Open Your Jar 🫙
                  </a>
                </div>
                
                <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
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
    
    if (!response.ok) {
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully by user:", user.id, "to:", recipientEmail, "for jar:", jarId);

    // Log the email activity
    await supabase.from("jar_activity").insert({
      jar_id: jarId,
      user_id: user.id,
      activity_type: "email_shared",
      metadata: { recipient_email: recipientEmail },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-jar-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
