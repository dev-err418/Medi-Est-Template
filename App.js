import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { addRdv, authListener, defaultDoctor, defaultRdv, defaultUser, fetchClient, fetchDoctor, fetchUserRdv, sendData, signInWithEmail, signOut, signUpWithEmail } from "./supabaseConfig";
import { Reservation } from "./src/Reservation";

// GitHub

// git add -A && git commit -m "message"
// git push -u origin

// pwd : SucqMk9SXGuVQ8Fb

// [X] - Show real EDT
// [X] - Display real availability of days
// [X] - Only display RDV that are in the future
// [X] - Consulter ses réservations en cours
// [X] - Display real availability of hours
// [X] - Prendre RDV

// [ ] - Inscription (add name and lastname modal)
// [ ] - Phone responsive
// [ ] - Remove RDV (send email on rdv removed)
// [ ] - Mot de passe oublié
// [ ] - Can't take rdv today !?
// [ ] - Handle error one taking rdv with modals...
// [ ] - Doctor pannel (admin)
// [ ] - 

const uuid = "b26374e3-d5d6-40a5-905a-fad47ff6c89a";

const Modal = ({ setShowModal, session }) => {

  const [login, setLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <View style={{ position: "absolute", padding: 20, borderRadius: 10, backgroundColor: "lightpink", zIndex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bolder", marginRight: 50 }}>{login ? "Connexion" : "Inscription"}</Text>
        <TouchableOpacity onPress={() => setShowModal(false)}>
          <Text>fermer</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ marginTop: 20, marginBottom: 5 }}>E-mail</Text>
        <TextInput value={email} onChange={(e) => setEmail(e.nativeEvent.text)} style={{ outline: "none", padding: 5, backgroundColor: "white", borderRadius: 5 }} />
        <Text style={{ marginTop: 10, marginBottom: 5 }}>Mot de passe</Text>
        <TextInput secureTextEntry={true} value={pass} onChange={(e) => setPass(e.nativeEvent.text)} style={{ outline: "none", padding: 5, backgroundColor: "white", borderRadius: 5 }} />
      </View>
      <TouchableOpacity onPress={async () => {
        if (login) {
          const signedin = await signInWithEmail(email, pass);
          if (signedin.session) {
            setShowModal(false);
          }

        } else {
          signUpWithEmail(email, pass);
          setLogin(true);
          setPass("");
        }
      }} style={{ backgroundColor: "black", padding: 10, borderRadius: 10, marginTop: 20, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>{login ? "Se connecter" : "S'inscrire"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 5, textAlign: "right" }} onPress={() => setLogin(!login)}>
        <Text>{login ? "Créer un compte" : "Se connecter"}</Text>
      </TouchableOpacity>
    </View>
  )
}
const InitializedModal = ({ setShowModal, session, setUser }) => {

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");

  return (
    <View style={{ position: "absolute", padding: 20, borderRadius: 10, backgroundColor: "lightpink", zIndex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bolder", marginRight: 50 }}>Ajoutez vos informations</Text>
        {/* <TouchableOpacity onPress={() => setShowModal(false)}>
          <Text>fermer</Text>
        </TouchableOpacity> */}
      </View>

      <View>
        <Text style={{ marginTop: 20, marginBottom: 5 }}>Prénom</Text>
        <TextInput value={name} onChange={(e) => setName(e.nativeEvent.text)} style={{ outline: "none", padding: 5, backgroundColor: "white", borderRadius: 5 }} />
        <Text style={{ marginTop: 10, marginBottom: 5 }}>Nom de famille</Text>
        <TextInput value={lastname} onChange={(e) => setLastname(e.nativeEvent.text)} style={{ outline: "none", padding: 5, backgroundColor: "white", borderRadius: 5 }} />
      </View>

      <TouchableOpacity onPress={async () => {
        if (name.length < 2 || lastname.length < 2) {
          alert("Entrez un nom et un prénom valide");
        } else {
          const data = await sendData(name, lastname, session.user.id);
          if (data) {
            setUser(data)
            setShowModal(false);
          }
        }
      }} style={{ backgroundColor: "black", padding: 10, borderRadius: 10, marginTop: 20, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Envoyer</Text>
      </TouchableOpacity>
    </View>
  )
}
const RdvModal = ({ setShowModal, session, rdv, doctor_id, loadCal }) => {
  return (
    <View style={{ position: "absolute", padding: 20, borderRadius: 10, backgroundColor: "lightpink", zIndex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bolder", marginRight: 50 }}>Prendre RDV</Text>
        <TouchableOpacity onPress={() => setShowModal(false)}>
          <Text>fermer</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ marginTop: 20 }}>De : {String(rdv[0][0]).substring(0, 5).replace(":", "h")} - {String(rdv[0][1]).substring(0, 5).replace(":", "h")}</Text>
        <TouchableOpacity onPress={async () => {
          const data = await addRdv(session.access_token, rdv[1], rdv[0][0], rdv[0][1], doctor_id);
          if (data.data) {
            loadCal();
          }
        }} style={{ backgroundColor: "black", padding: 10, borderRadius: 10, marginTop: 20, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Reserver cette date</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const AppOld = () => {

  const uuid = "b26374e3-d5d6-40a5-905a-fad47ff6c89a";

  const [doctor, setDoctor] = useState(defaultDoctor);
  const [user, setUser] = useState(defaultUser);
  const [session, setSession] = useState({});
  const [rdv, setRdv] = useState(["", ""]);
  const [userRdv, setUserRdv] = useState(defaultRdv);
  const [calendar, setCalendar] = useState([]);
  const [calendar2, setCalendar2] = useState([]);
  const [calendar3, setCalendar3] = useState([]);
  const [calendarIndex, setCalendarIndex] = useState(0);
  const calendars = [calendar, calendar2, calendar3];

  const [showModal, setShowModal] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [showRdvModal, setShowRdvModal] = useState(false);

  useEffect(() => {
    const getData = async () => {
      authListener(setSession);
      setDoctor(await fetchDoctor(uuid));
    }

    getData();
  }, []); // done

  useEffect(() => {

    const gatherData = async () => {
      if (session.user) {
        setUser(await fetchClient(session.user.id))
        setUserRdv(await fetchUserRdv(session.user.id))
      }
    }

    if (session) {
      gatherData();
    }
  }, [session]);

  useEffect(() => {
    if (user.initialized == false) {
      setShowInitModal(true);
    }
  }, [user]);

  const loadCal = () => {
    setCalendar([]);

    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      var day = new Date();
      day.setDate(today.getDate() + i)
      const dayOfWeek = day.getDay();
      const obj = {
        day: days[dayOfWeek],
        date: day,
      }

      // console.log(day.getTime())

      setCalendar((old) => [...old, obj]);
    }

    for (let i = 7; i < 14; i++) {
      var day = new Date();
      day.setDate(today.getDate() + i)
      const dayOfWeek = day.getDay();
      const obj = {
        day: days[dayOfWeek],
        date: day,
      }

      setCalendar2((old) => [...old, obj]);
    }

    for (let i = 14; i < 21; i++) {
      var day = new Date();
      day.setDate(today.getDate() + i)
      const dayOfWeek = day.getDay();
      const obj = {
        day: days[dayOfWeek],
        date: day,
      }

      setCalendar3((old) => [...old, obj]);
    }
  } // done
  useEffect(() => {

    loadCal();

  }, []) // done

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {showModal && <Modal setShowModal={setShowModal} session={session} />}
      {showInitModal && <InitializedModal setShowModal={setShowInitModal} session={session} setUser={setUser} />}
      {showRdvModal && <RdvModal setShowModal={setShowRdvModal} session={session} rdv={rdv} doctor_id={uuid} loadCal={loadCal} />}
      {doctor.id ?
        <View>
          {user && session ?
            <View>
              <Text>Vous êtes : {user.name} <Text style={{ fontWeight: "bold" }}>{user.lastname}</Text></Text>
              {userRdv[0] ?
                <View>
                  <Text style={{ fontWeight: "bold", marginVertical: 10 }}>Mes rdvs: </Text>
                  {
                    userRdv.map((el, i) => {
                      return (
                        <View key={i} style={{ padding: 10, borderRadius: 10, backgroundColor: "lightpink", marginBottom: 10 }}>
                          <Text>De : {el.from} - {el.to} | Avec : Dr. {el.users.lastname} {el.users.name}</Text>
                        </View>
                      )
                    })
                  }
                </View>
                :
                <Text style={{ marginVertical: 10 }}>Vous n'avez aucun rdv pour l'instant</Text>
              }
              <TouchableOpacity onPress={() => signOut()} style={{ marginTop: 10 }}>
                <Text>Se deconnecter</Text>
              </TouchableOpacity>
            </View>
            :
            <View>
              <TouchableOpacity onPress={() => setShowModal(true)}>
                <Text>Se connecter</Text>
              </TouchableOpacity>
            </View>
          }
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20, marginTop: 20 }}>Dr. {String(doctor.lastname).toUpperCase()} {doctor.name.charAt(0).toUpperCase() + doctor.name.substring(1).toLowerCase()}</Text>
          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={{ height: 15, width: 15, borderRadius: 15, backgroundColor: "lightgray" }} />
            <Text style={{ marginLeft: 5 }} >Libre</Text>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={{ height: 15, width: 15, borderRadius: 15, backgroundColor: "lightblue" }} />
            <Text style={{ marginLeft: 5 }} >Mes réservation</Text>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ height: 15, width: 15, borderRadius: 15, backgroundColor: "red" }} />
            <Text style={{ marginLeft: 5 }} >Réservé</Text>
          </View>
          <TouchableOpacity onPress={() => {
            setCalendarIndex(calendarIndex + 1);
            console.log(calendars)
          }}>
            <Text>+ next week</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setCalendarIndex(calendarIndex - 1);
            console.log(calendars)
          }}>
            <Text>- previous week</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row" }}>
            {
              // ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((el, i) => {
              calendars[calendarIndex].map((data, i) => {

                const el = data.day;

                return (
                  <View key={data.date + data.day + i} style={{ paddingHorizontal: 20, borderLeftWidth: i == 0 ? 2 : 1, borderRightWidth: i == 6 ? 2 : 1, borderColor: "black" }}>
                    <Text style={{ textAlign: "center", fontWeight: "bold" }}>{new Date(data.date).toDateString().substring(0, 10)}</Text>
                    <View style={{ width: "100%", height: 2, backgroundColor: "black", marginVertical: 5 }} />
                    {
                      doctor.agenda[el].map((fromTo, j) => {

                        var booked = false;
                        var bookedByUser = false;

                        const isBooked = () => {
                          for (let k = 0; k < doctor.rdv.length; k++) {
                            const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                            const day = days[new Date(doctor.rdv[k].date).getUTCDay()];
                            if (day == el) {
                              const d = new Date(doctor.rdv[k].date);
                              const utc_d = d.getUTCDate();
                              const utc_y = d.getUTCFullYear();
                              const utc_m = d.getUTCMonth();

                              const d2 = new Date(calendars[calendarIndex][i].date);
                              const d2_d = d2.getDate();
                              const d2_y = d2.getFullYear();
                              const d2_m = d2.getMonth();

                              if (d2_d == utc_d && utc_y == d2_y && d2_m == utc_m) {
                                if (doctor.rdv[k].from == fromTo[0] && doctor.rdv[k].to == fromTo[1]) {
                                  booked = true;
                                  if (doctor.rdv[k].user_id == user.id) {
                                    bookedByUser = true;
                                  }
                                }
                              }
                            }
                          }
                        }

                        isBooked();

                        return (
                          <TouchableOpacity onPress={() => {
                            if (session) {
                              setRdv([fromTo, data.date]);
                              setShowRdvModal(true);
                            } else {
                              setShowModal(true);
                            }
                          }} disabled={booked && !bookedByUser} key={j} style={{ padding: 5, backgroundColor: booked ? bookedByUser ? "lightblue" : "red" : "lightgray", borderRadius: 4, marginTop: 5 }}>
                            <Text>{String(fromTo[0]).slice(0, 5).replace(":", "h")} - {String(fromTo[1]).slice(0, 5).replace(":", "h")}</Text>
                          </TouchableOpacity>
                        )
                      })
                    }
                    <Text>{doctor.agenda[el].length == 0 && "Nth"}</Text>
                  </View>
                )
              })
            }
          </View>
        </View>
        :
        <ActivityIndicator color={"black"} />
      }
    </View>
  )
}
/* new */
const App = () => {

  const [doctor, setDoctor] = useState(defaultDoctor);
  const [rdv, setRdv] = useState(["", ""]);
  const [calendar, setCalendar] = useState([]);
  const [calendar2, setCalendar2] = useState([]);
  const [calendar3, setCalendar3] = useState([]);
  const [calendarIndex, setCalendarIndex] = useState(0);
  const calendars = [calendar, calendar2, calendar3];

  useEffect(() => {
    const getData = async () => {
      // authListener(setSession);
      setDoctor(await fetchDoctor(uuid));
    }

    const loadCal = () => {
      setCalendar([]);

      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

      const today = new Date();

      for (let i = 0; i < 7; i++) {
        var day = new Date();
        day.setDate(today.getDate() + i)
        const dayOfWeek = day.getDay();
        const obj = {
          day: days[dayOfWeek],
          date: day,
        }

        // console.log(day.getTime())

        setCalendar((old) => [...old, obj]);
      }

      for (let i = 7; i < 14; i++) {
        var day = new Date();
        day.setDate(today.getDate() + i)
        const dayOfWeek = day.getDay();
        const obj = {
          day: days[dayOfWeek],
          date: day,
        }

        setCalendar2((old) => [...old, obj]);
      }

      for (let i = 14; i < 21; i++) {
        var day = new Date();
        day.setDate(today.getDate() + i)
        const dayOfWeek = day.getDay();
        const obj = {
          day: days[dayOfWeek],
          date: day,
        }

        setCalendar3((old) => [...old, obj]);
      }
    }
    loadCal();
    getData();
  }, []);

  return (
    <View>
      <Reservation />
    </View>
  )
}

export default App;


// const from = doctor.rdv[k].from
//                               const to = doctor.rdv[k].to
//                               if (from == fromTo[0] || to == fromTo[1]) {
//                                 for (let l = 0; l < userRdv.length; l++) {
//                                   if (userRdv[l].doctor_id == uuid) {
//                                     if (userRdv[l].id == doctor.rdv[k].id) {
//                                       bookedByUser = true;
//                                     }
//                                     // const d = new Date(userRdv[l].date);
//                                     //       // const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(),
//                                     //       //   d.getUTCDate(), d.getUTCHours(),
//                                     //       //   d.getUTCMinutes(), d.getUTCSeconds())
//                                     //       // console.log("zizi", dUTC, new Date(dUTC).getDay())
//                                     //       if (days[d.getUTCDay()] == el) {                                      
//                                     //         // console.log("zizi", l, d.getUTCDay(), el)
//                                     //         // if (userRdv[l].from == fromTo[0] && userRdv[l].to == fromTo[1]) {
//                                     //           // should check if dates are matching...                                                                               
//                                     //           // if (compareDates(userRdv[l].date, data.date)) {
//                                     //             bookedByUser = true;
//                                     //           // }
//                                     //         // }
//                                   }
//                                 }
//                               }
//                               // if (compareDates(data.date, doctor.rdv[k].date)) {
//                               booked = true;
//                               // }
//                               // }