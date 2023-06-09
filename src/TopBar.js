import { Text, View, TouchableOpacity } from "react-native";
import { signOut } from "../supabaseConfig";

export const TopBar = ({user, session, setShowModal, setIsInOrUp, setShowRdv }) => {
    return (
        <View style={{ padding: 20, position: "fixed", top: 0, left: 0, zIndex: 1, width: "100vw", alignItems: "flex-end" }}>
            {
                (user && session) ?
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => signOut()}>
                            <Text style={{ fontWeight: "bold", color: "black" }}>Se deconnecter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowRdv(true)} style={{ padding: 12, backgroundColor: "black", borderRadius: 10, marginLeft: 20 }}>
                            <Text style={{ fontWeight: "bold", color: "white" }}>{user.name} {String(user.lastname).toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => {
                            setShowModal(true)
                            setIsInOrUp(false)
                        }}>
                            <Text style={{ fontWeight: "bold", color: "black" }}>S'inscrire</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setShowModal(true)
                            setIsInOrUp(true)
                        }} style={{ padding: 12, backgroundColor: "black", borderRadius: 10, marginLeft: 20 }}>
                            <Text style={{ fontWeight: "bold", color: "white" }}>Se connecter</Text>
                        </TouchableOpacity>
                    </View>
            }
        </View>
    )
}