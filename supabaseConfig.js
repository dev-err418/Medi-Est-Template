import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://urxlizycdcakcagbzumv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeGxpenljZGNha2NhZ2J6dW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ2NzExMDQsImV4cCI6MjAwMDI0NzEwNH0.TrNA8z2_ztoRpnVDAYbW5WqldphoeO35gurj2hqeWPg", {auth: {autoRefreshToken: true, persistSession: true, detectSessionInUrl: false}});
// const supabase = createClient("https://urxlizycdcakcagbzumv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeGxpenljZGNha2NhZ2J6dW12Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDY3MTEwNCwiZXhwIjoyMDAwMjQ3MTA0fQ.VW5t36OTR1yAkNvuGu8NcLIkFPUuoHP_lElyUpGHnRU")

export const defaultUser = {
    id: undefined,
    created_at: "",
    lastname: "",
    name: "",
    type: undefined,
    initialized: undefined
}

export const defaultDoctor = {
    agenda: {
        id: null,
        doctor_id: null,
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: [],
    },
    rdv: [{
        created_at: "",
        id: null,
        doctor_id: null,
        user_id: null,
        from: "",
        to: "",
        day: "",
        date: ""
    }],
    phone: "",
    keywords: "",
    address: "",
    created_at: "",
    id: undefined,
    initialized: undefined,
    lastname: "",
    name: "",
    type: undefined,    
}

export const defaultRdv = [{
    created_at: "",
    date: "",
    day: "",
    doctor_id: null,
    from: "",
    to: "",
    id: null,
    user_id: null,
    users: defaultUser
}];

export const fetchClient = async (id) => {
    const { data, error } = await supabase.from("users").select().eq("id", id);

    if (error) {
        console.log("Err !", error);
        signOut();
        return defaultUser;
    } else {
        return data[0];
    }
}

export const fetchDoctor = async (id) => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const { data, error } = await supabase.from("users").select("*, agenda(*), rdv!rdv_doctor_id_fkey(*)").eq("id", id).gte("rdv.date", date.toISOString());

    if (error) {
        console.log("Err !", error);
        return defaultDoctor;
    } else {
        return data[0];
    }
}

export const fetchUserRdv = async (userId) => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const { data, error } = await supabase.from("rdv").select("*, users!rdv_doctor_id_fkey(*)").eq("user_id", userId).gte("date", date.toISOString());    

    if (error) {
        console.log("Err !", error);
        return [];
    } else {
        return data;
    }
}

export const signUpWithEmail = async (email, pass) => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pass,
    });

    if (error) {
        alert("Une erreur est survenue lors de la connexion.")
    }

    alert("Vous avez reçu un email de confirmation, validez votre email puis connectez vous !")
}
//example-password
export const signInWithEmail = async (email, pass) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (error) {
        alert("Une erreur est survenue lors de la connexion.")
    }

    return data;
}

export const signOut = async () => {
    const { data, error } = await supabase.auth.signOut();
}

export const sendData = async (name, lastname, id) => {    
    const { data, error } = await supabase.from("users").update({ "name": name, "lastname": lastname, "initialized": true }).eq("id", id).select();    

    return data[0];
}

export const authListener = (setSession) => {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log(event, session);
        setSession(session);
    })
}

export const addRdv = async (token, date, from, to, doctor) => {    
    const { data, error } = await supabase.functions.invoke("test-addRdv", {
        body: {
            date: new Date(date).getTime(),
            from: from,
            to: to,
            doctor: doctor
        },
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    console.log(error, data)

    if (error) {
        alert("Un erreur est survenue pendant la prise de votre rendez-vous.")
    }

    return data;
}