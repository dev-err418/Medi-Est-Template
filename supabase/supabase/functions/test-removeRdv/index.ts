import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

var logging = [];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(
      'ok',
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Expose-Headers": "Content-Length, X-JSON",
          "Access-Control-Allow-Headers": "apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization",
        }
      }
    );
  } else {
    try {
      const { id } = await req.json();
      // Create a Supabase client with the Auth context of the logged in user.
      const supabaseClient = createClient(
        "https://urxlizycdcakcagbzumv.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeGxpenljZGNha2NhZ2J6dW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ2NzExMDQsImV4cCI6MjAwMDI0NzEwNH0.TrNA8z2_ztoRpnVDAYbW5WqldphoeO35gurj2hqeWPg",
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      );
      // Now we can get the session or user object
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      // And we can run queries in the context of our authenticated user
      const { error } = await supabaseClient.from("rdv").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      const data = "ok"
      return new Response(JSON.stringify({ data, error }), {

        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Expose-Headers": "Content-Length, X-JSON",
          "Access-Control-Allow-Headers": "apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization",
        }
        ,
        status: 200,
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error, logging }), {

        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Expose-Headers": "Content-Length, X-JSON",
          "Access-Control-Allow-Headers": "apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization",
        }
        ,
        status: 400,
      })
    }
  }
})


// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
