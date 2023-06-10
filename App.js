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

/* new */
const App = () => {
  return (
    <View>
      <Reservation />
    </View>
  )
}

export default App;