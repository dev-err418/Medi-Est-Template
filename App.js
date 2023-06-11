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
// [X] - Si pas connecté, pb pop up pour prendre rdv. Ne pas ouvrir pop up prendre rdv si pas co.
// [X] - Inscription, will it work ?
// [X] - Remove RDV
// [X] - Can't take rdv today !?

// [ ] - Inscription (add name and lastname modal)
// [ ] - Phone responsive
// [ ] - Remove RDV (send email on rdv removed)
// [ ] - Mot de passe oublié
// [ ] - Handle error on taking rdv with modals...
// [ ] - Doctor pannel (admin)
// [ ] - 

const App = () => {
  return (
    <View>
      <Reservation />
    </View>
  )
}

export default App;