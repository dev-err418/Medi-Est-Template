import { useRef, useState } from "react";
import { Animated, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { signInWithEmail, signUpWithEmail } from "../supabaseConfig";
import { Ionicons } from '@expo/vector-icons';

export const AuthModal = ({ inOrUp, setShowModal }) => {

    const [isInOrUp, setIsInOrUp] = useState(inOrUp); // if true, sign in, else sign up
    const { height } = useWindowDimensions();
    const verticalAnim = useRef(new Animated.Value(-height / 1.5)).current;

    const popIn = () => {
        Animated.spring(verticalAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 10,
            speed: 6
        }).start()
    }
    const popOut = () => {
        Animated.timing(verticalAnim, {
            toValue: -height,
            useNativeDriver: true,
            duration: 500,
        }).start(() => setShowModal(false))
    }

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");

    return (
        <View onLayout={() => popIn()} style={{ height: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, justifyContent: "center", alignItems: "center", zIndex: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
            <Animated.View style={{
                // height: 200, 
                // width: 200, 
                padding: 20,
                backgroundColor: "white",
                transform: [{ translateY: verticalAnim }],
                borderRadius: 15,
                shadowColor: "gray",
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.33,
                shadowRadius: 5,
            }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 20, }}>
                    <Text style={{ fontSize: 45, fontWeight: "bold", marginRight: 60, color: "black" }}>{isInOrUp ? "Connexion" : "Inscription"}</Text>
                    <TouchableOpacity onPress={() => popOut()}>
                        <Ionicons name="close" size={20} color="black" />
                    </TouchableOpacity>
                </View>
                <Text style={{ fontWeight: "bold", marginBottom: 10, color: "black" }} >Email</Text>
                <TextInput value={email} onChange={(e) => setEmail(e.nativeEvent.text)} style={{
                    outline: "none",
                    padding: 10,
                    borderRadius: 10,
                    shadowColor: "gray",
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.33,
                    shadowRadius: 5,
                }} placeholderTextColor={"gray"} placeholder="example@gmail.com" />

                <Text style={{ fontWeight: "bold", marginBottom: 10, marginTop: 15, color: "black" }} >Mot de passe</Text>
                <TextInput value={pwd} onChange={(e) => setPwd(e.nativeEvent.text)} style={{
                    outline: "none",
                    padding: 10,
                    borderRadius: 10,
                    shadowColor: "gray",
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.33,
                    shadowRadius: 5,
                }} secureTextEntry placeholderTextColor={"gray"} placeholder="Au minimum 6 charactères" onSubmitEditing={() => {
                    if (pwd.length < 6) {
                        return alert("Votre mot de passe doit faire au minimum 6 charactères !")
                    }
                    if (isInOrUp) {
                        signInWithEmail(email, pwd);
                    } else {
                        signUpWithEmail(email, pwd);
                    }
                    popOut()
                }} />

                <TouchableOpacity onPress={() => {
                    if (pwd.length < 6) {
                        return alert("Votre mot de passe doit faire au minimum 6 charactères !")
                    }
                    if (isInOrUp) {
                        signInWithEmail(email, pwd);
                    } else {
                        signUpWithEmail(email, pwd);
                    }
                    popOut()
                }} style={{ paddingVertical: 14, backgroundColor: "black", justifyContent: "center", alignItems: "center", backgroundColor: "black", borderRadius: 10, marginTop: 20 }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>{isInOrUp ? "Se connecter" : "S'inscrire"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 5 }} onPress={() => setIsInOrUp(!isInOrUp)}>
                    <Text style={{ fontWeight: "bold", fontSize: 12, textAlign: "right", color: "black" }}>{isInOrUp ? "Pas encore de compte" : "Déjà un compte"}</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
}