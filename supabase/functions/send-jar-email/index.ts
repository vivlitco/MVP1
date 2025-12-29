import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// 1. Import the dotenv loader (matching your std version)
import { load } from "https://deno.land/std@0.190.0/dotenv/mod.ts";

// 2. Load environment variables from .env file
await load();

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface JarEmailRequest {
  recipientEmail: string;
  senderName: string;
  personalMessage?: string;
  jarName: string;
  shareUrl: string;
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

    const { recipientEmail, senderName, personalMessage, jarName, shareUrl }: JarEmailRequest = await req.json();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vivlit <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `${senderName} shared a jar of notes with you! 🎁`,
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
                  <strong>${senderName}</strong> has created a special jar of notes just for you!
                </p>
                
                ${personalMessage ? `
                  <div style="background: #faf5ff; padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #c084fc;">
                    <p style="color: #6b21a8; font-style: italic; margin: 0;">"${personalMessage}"</p>
                  </div>
                ` : ''}
                
                <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
                  This jar called "<strong>${jarName}</strong>" is filled with heartfelt messages waiting to be discovered. Open it and let the surprises unfold! ✨
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

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-jar-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
