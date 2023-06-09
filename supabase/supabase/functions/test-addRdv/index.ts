// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// [x] - verifier si utilisateur logged in
// [x] - verifier si y as pas d'autres rdv
// [x] - verifier si rdv possible
// [ ] - verifier si la date demandée n'est pas déjà passée...

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
      const { date, from, to, doctor } = await req.json();
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
      const { data, error } = await supabaseClient.from('users').select().in("id", [user.id, doctor]);
      if (error) throw error;

      const doctorIndex = data.findIndex(x => x.id === doctor)


      if (data[0].initialized && data[1].initialized && data[doctorIndex].type != 0) {
        // users exists and doctor is a doctor
        var d = new Date()
        d.setTime(date);
        const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
        const { data, error } = await supabaseClient.from("agenda").select().eq("doctor_id", doctor);
        if (error) throw error;

        var docAvailableForRdv = false;

        // for (let i = 0; i < data[0][days[d.getDay()]].length; i++) {
          // const f = data[0][days[d.getDay()]][i][0];
          // const t = data[0][days[d.getDay()]][i][1];

          // if (f == from && t == to) {
          //   docAvailableForRdv = true;
          // }
        // }

        for (let i = 0; i < data[0][days[d.getDay()]].length; i++) {
          const hourArray = data[0][days[d.getDay()]][i];
          for (let j = 0; j < hourArray.length; j++) {
            const f = hourArray[j][0];
            const t = hourArray[j][1];

            if (f == from && t == to) {
              docAvailableForRdv = true;
            }
          }
        }    

        if (!docAvailableForRdv) {
          throw "0";
        } else {
          const { data, error } = await supabaseClient.from("rdv").select().match({ from: from, to: to, doctor_id: doctor });
          if (error) throw error;

          var date_ = new Date()
          date_.setTime(date)
          if (data.length == 0) {
            //ajouter rdv
            const { error } = await supabaseClient.from("rdv").insert({ doctor_id: doctor, user_id: user.id, from, to, date: date_ })
            if (error) throw error;

          } else {
            if (new Date(data[0].date).getDate() == d.getDate()) {
              throw "1";
            } else {
              // ajouter rdv 
              const { error } = await supabaseClient.from("rdv").insert({ doctor_id: doctor, user_id: user.id, from, to, date: date_ })
              if (error) throw error;
            }
          }
        }
      } else {
        throw "2";
      }

      return new Response(JSON.stringify({ data, logging }), {

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
