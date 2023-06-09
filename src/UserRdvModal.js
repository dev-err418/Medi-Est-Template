import { useRef } from "react";
import { Animated, TouchableOpacity, View, useWindowDimensions, Text, ScrollView } from "react-native";
import { Ionicons, Entypo } from '@expo/vector-icons';

const RdvRow = ({rdv}) => {

    const rdvDate = new Date(rdv.date);

    return (
        <View style={{
            shadowColor: "gray",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.33,
            shadowRadius: 5,
            marginBottom: 15,
            borderRadius: 10,
            padding: 5
        }}>
            <Text>De <Text style={{ fontWeight: "bold" }}>{String(rdv.from).slice(0, 5).replace(":", "h")}</Text> à <Text style={{ fontWeight: "bold" }}>{String(rdv.to).slice(0, 5).replace(":", "h")}</Text> le <Text style={{ fontWeight: "bold" }}>{rdvDate.getDate()}/{rdvDate.getMonth() + 1}/{rdvDate.getFullYear()}</Text> avec <Text style={{ fontWeight: "bold" }}>{String(rdv.users.lastname).toUpperCase()} {rdv.users.name}</Text></Text>
            <View style={{flexDirection: "row", marginTop: 8, alignItems: "center" }}>
                <Entypo name="location" size={14} color="black" />
                <Text style={{ fontWeight: "bold", marginLeft: 5 }}>{rdv.users.address}</Text>
            </View>
            <View style={{flexDirection: "row", marginTop: 8, alignItems: "center" }}>
                <Entypo name="phone" size={14} color="black" />
                <Text style={{ fontWeight: "bold", marginLeft: 5 }}>{rdv.users.phone}</Text>
            </View>
        </View>
    )
}

export const UserRdvModal = ({ rdvs, setShowModal }) => {

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

    console.log(rdvs)

    return (
        <View onLayout={() => popIn()} style={{ height: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, justifyContent: "center", alignItems: "center", zIndex: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
            <Animated.View style={{
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
                paddingBottom: 0
            }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 20, }}>
                    <Text style={{ fontSize: 45, fontWeight: "bold", marginRight: 60, color: "black" }}>Mes rendez-vous</Text>
                    <TouchableOpacity onPress={() => popOut()}>
                        <Ionicons name="close" size={20} color="black" />
                    </TouchableOpacity>
                </View>
                {
                    rdvs.length == 0 ?
                    <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 20, marginTop: 10 }}>
                        <Text>Aucun rendez vous pour le moment.</Text>
                    </View>
                    : 
                    <View>
                        <Text style={{ fontWeight: "bold" }}>Vous avez {rdvs.length} rendez-vous :</Text>
                        <ScrollView style={{ maxHeight: 300, padding: 20, width: "calc(100% + 40px)", left: -20 }}>
                            {
                                rdvs.map((rdv, i) => {
                                    return <RdvRow key={i} rdv={rdv} />
                                })
                            }
                        </ScrollView>
                    </View>
                }
            </Animated.View>
        </View>
    )
}