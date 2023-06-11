import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, ScrollView, Image, ActivityIndicator } from "react-native";
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { addRdv, authListener, defaultDoctor, defaultRdv, defaultUser, fetchClient, fetchDoctor, fetchUserRdv } from "../supabaseConfig";
import { TopBar } from "./TopBar";
import { AuthModal } from "./AuthModal";
import { UserRdvModal } from "./UserRdvModal";

const types = ["", "Accuponcteur"]

const Calendar = ({ prendreRdv, agenda, rdvs, dName, dLastname, setShowConfirmModal, showConfrimModal, checkLog }) => {

    // function to get all the days in the current month
    const getDaysInMonth = (month, year) => {
        var date = new Date(year, month, 1);
        var days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    const [currentDate, setCurrentDate] = useState(new Date());
    // dates of the months stored in those variables
    const [currentMonth, setCurrentMonth] = useState([]);
    const [nextMonth, setNextMonth] = useState([]);
    // current index to know which month to display
    const [monthIndex, setMonthIndex] = useState(0);

    const [selectedDate, setSelectedDate] = useState();

    useEffect(() => {

        const d = new Date();
        const month = d.getMonth();
        const year = d.getFullYear();
        const cMonth = getDaysInMonth(month, year);
        var nMonth;
        if (month == 11) {
            nMonth = getDaysInMonth(0, year + 1);
        } else {
            nMonth = getDaysInMonth(month + 1, year);
        }

        const chunkSize = 7;
        for (let i = 0; i < cMonth.length; i += chunkSize) {
            const chunk = cMonth.slice(i, i + chunkSize);
            setCurrentMonth((old) => [...old, chunk]);
        }

        for (let i = 0; i < nMonth.length; i += chunkSize) {
            const chunk = nMonth.slice(i, i + chunkSize);
            setNextMonth((old) => [...old, chunk]);
        }

    }, [])

    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"]
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    const daysEng = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    const fullDays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

    const offsetRight = useRef(new Animated.Value(420)).current;
    const animIn = () => {
        Animated.timing(offsetRight, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start()
    }
    const animOut = () => {
        Animated.timing(offsetRight, {
            toValue: 420,
            duration: 500,
            useNativeDriver: true
        }).start()
    }

    const [clickedTiming, setClickedTiming] = useState([]);

    return (
        <View style={{
            width: 400, backgroundColor: "rgb(242, 242, 242)", borderRadius: 15, shadowColor: "gray",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.33,
            shadowRadius: 5,
        }}>{
                (selectedDate && showConfrimModal) &&
                <ConfirmRdvModal checkLog={checkLog} from={clickedTiming[0]} to={clickedTiming[1]} selectedDate={selectedDate} prendreRdv={prendreRdv} dayFull={fullDays[selectedDate.getDay()]} day={selectedDate.getDate()} monthFull={months[selectedDate.getMonth()]} lastname={dLastname} name={dName} setShowModal={setShowConfirmModal} />
            }

            {/* modal */}
            {selectedDate &&
                <Animated.View style={{
                    height: "100%", width: "100%", backgroundColor: "rgb(242, 242, 242)", position: "absolute", top: 0, left: 0, transform: [{ translateX: offsetRight }], zIndex: 1, borderRadius: 15
                }} >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{fullDays[selectedDate.getDay()]} {selectedDate.getDate()} {months[selectedDate.getMonth()].toLowerCase()} {selectedDate.getFullYear()}</Text>
                        <TouchableOpacity onPress={() => animOut()}>
                            <Ionicons name="close" size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ paddingVertical: 10, width: "100%", paddingHorizontal: 20, height: "100%" }}>
                        {
                            agenda[daysEng[selectedDate.getDay()]].map((row, i) => {
                                return (
                                    <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text style={{ fontWeight: "bold" }}>{Number(agenda[daysEng[selectedDate.getDay()]][i][0][0].slice(0, 2))}h</Text>
                                        {
                                            row.map((fromTo, j) => {

                                                var taken = true;

                                                const isBooked = () => {
                                                    for (let k = 0; k < rdvs.length; k++) {
                                                        const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                                                        const day = days[new Date(rdvs[k].date).getDay()];
                                                        if (day == days[selectedDate.getDay()]) {
                                                            const d = new Date(rdvs[k].date);
                                                            const utc_d = d.getDate();
                                                            const utc_y = d.getFullYear();
                                                            const utc_m = d.getMonth();

                                                            const d2 = selectedDate;
                                                            const d2_d = d2.getDate();
                                                            const d2_y = d2.getFullYear();
                                                            const d2_m = d2.getMonth();

                                                            if (d2_d == utc_d && utc_y == d2_y && d2_m == utc_m) {
                                                                if (rdvs[k].from == fromTo[0] && rdvs[k].to == fromTo[1]) {
                                                                    return true;
                                                                }
                                                            }
                                                        }
                                                    }

                                                    return false;
                                                }

                                                isBooked();


                                                // if the selected day is the current day and the hours are already in past
                                                if (selectedDate.getDate() == currentDate.getDate() && selectedDate.getMonth() == currentDate.getMonth() && new Date().getHours() >= Number(fromTo[0].slice(0, 2))) {
                                                    taken = true;
                                                } else if (isBooked()) {
                                                    taken = true;
                                                } else {
                                                    taken = false;
                                                }



                                                return (

                                                    <TouchableOpacity onPress={() => {
                                                        // to do
                                                        if (checkLog()) {
                                                            setClickedTiming(fromTo);
                                                            setShowConfirmModal(true);
                                                        }
                                                    }} disabled={taken} key={j} style={{ marginVertical: 10, backgroundColor: !taken ? "white" : null, borderRadius: 10, padding: 10, justifyContent: "center", alignItems: "center" }}>
                                                        <Text style={{ color: !taken ? null : "darkgray" }}>{String(fromTo[0]).slice(0, 5).replace(":", "h")}</Text>
                                                        <Text style={{ color: !taken ? null : "darkgray" }}>•</Text>
                                                        <Text style={{ color: !taken ? null : "darkgray" }}>{String(fromTo[1]).slice(0, 5).replace(":", "h")}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </Animated.View>
            }
            <View style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: "105%", backgroundColor: "rgb(242, 242, 242)", zIndex: 2 }}></View>
            {/* display current month and year */}
            <View style={{ flexDirection: "row", marginVertical: 15, marginLeft: 20, marginTop: 25, justifyContent: "center", alignItems: "center" }}>
                {
                    monthIndex == 1 &&
                    <TouchableOpacity onPress={() => setMonthIndex(0)} style={{ marginRight: 10 }}>
                        <FontAwesome5 name="arrow-left" size={14} color="black" />
                    </TouchableOpacity>
                }
                {
                    monthIndex == 0 ?
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
                        :
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{months[(currentDate.getMonth() + 1) % 12]} {currentDate == 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()}</Text>
                }
                {

                    monthIndex == 0 &&
                    <TouchableOpacity onPress={() => setMonthIndex(1)} style={{ marginLeft: 10 }}>
                        <FontAwesome5 name="arrow-right" size={14} color="black" />
                    </TouchableOpacity>
                }
            </View>

            {/* dispay days name  */}
            <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                {
                    [currentMonth, nextMonth][monthIndex][0] && currentMonth[0].map((day, j) => {

                        return (
                            <View key={j} style={{ width: 40, alignItems: "center" }}>
                                <Text style={{ fontWeight: "bold", marginBottom: 15, marginTop: 20 }}>{monthIndex == 1 ? days[nextMonth[0][j].getDay()] : days[day.getDay()]}</Text>
                            </View>
                        )
                    })
                }
            </View>

            {/* display calendar */}
            <View style={{ marginBottom: 10 }}>
                {
                    [currentMonth, nextMonth][monthIndex].map((week, i) => {
                        return (
                            <View key={i} style={{ flexDirection: "row", justifyContent: "space-evenly", marginVertical: 6 }}>
                                {
                                    week.length == 7 ? week.map((day, j) => {
                                        const isAvailable = !(agenda[daysEng[day.getDay()]].length > 0 ? monthIndex == 1 ? false : day.getDate() >= currentDate.getDate() ? false : true : true);
                                        return (
                                            <TouchableOpacity onPress={() => {
                                                setSelectedDate(day)
                                                animIn()
                                            }} disabled={!isAvailable} key={j} style={{ width: 40, height: 40, backgroundColor: isAvailable ? "white" : null, borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
                                                <Text style={{ fontWeight: "bold", color: isAvailable ? "black" : "gray" }}>{day.getDate()}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                        :
                                        [...week, ...Array(7 - week.length).keys()].map((day, j) => {
                                            var isAvailable;
                                            if (typeof (day) == "object") {
                                                isAvailable = !(agenda[daysEng[day.getDay()]].length > 0 ? monthIndex == 1 ? false : day.getDate() >= currentDate.getDate() ? false : true : true)
                                            }
                                            return (
                                                <View key={j}>
                                                    {
                                                        typeof (day) == "object" ?
                                                            <TouchableOpacity onPress={() => {
                                                                setSelectedDate(day)
                                                                animIn()
                                                            }} disabled={!isAvailable} style={{ width: 40, height: 40, backgroundColor: isAvailable ? "white" : null, borderRadius: 10, justifyContent: "center", alignItems: "center" }}>

                                                                <Text style={{ fontWeight: "bold", color: isAvailable ? "black" : "gray" }}>{day.getDate()}</Text>

                                                            </TouchableOpacity>
                                                            :
                                                            <View style={{ height: 40, width: 40 }} />
                                                    }
                                                </View>
                                            )
                                        })
                                }
                            </View>
                        )
                    })
                }
            </View>
        </View>
    )
}

const SpeBubbles = ({ spe }) => {
    return (
        <View style={{ padding: 8, backgroundColor: "rgb(242, 242, 242)", borderRadius: 8, marginRight: 8 }} >
            <Text style={{ fontWeight: "400", fontSize: 14 }}>{spe}</Text>
        </View>
    )
}

const DoctorInfos = ({ doctor }) => {

    const spes = ["douleurs", "stress", "troubles digestifs", "problèmes hormonaux"];

    return (
        <View style={{ alignItems: "center", padding: 20 }}>
            <Image style={{ height: 170, width: 170, borderRadius: 170 }} source={{ uri: "https://img.freepik.com/photos-gratuite/portrait-du-docteur-adulte-moyen-reussi-bras-croises_1262-12865.jpg" }} />
            <Text style={{ fontSize: 38, fontWeight: "bolder", textAlign: "center", marginTop: 10 }}>{doctor.name} {String(doctor.lastname).toUpperCase()}</Text>
            <Text style={{ textAlign: "center", fontWeight: "300", marginBottom: 20 }}>{types[doctor.type]}</Text>
            {doctor.keywords.length > 0 &&
                <View>
                    <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Spécialités : </Text>
                    <View style={{ flexDirection: "row" }}>
                        {
                            doctor.keywords.map((spe, i) => {
                                return <SpeBubbles key={i} spe={spe} />
                            })
                        }
                    </View>
                </View>
            }
            <Text style={{ fontWeight: "bold", marginTop: 30, textAlign: "center" }}>{doctor.address}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 10, textAlign: "center" }}>{doctor.phone}</Text>
        </View>
    )
}

const ConfirmRdvModal = ({ dayFull, day, monthFull, lastname, name, from, to, selectedDate, prendreRdv, setShowModal, checkLog }) => {

    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    const animIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            bounciness: 10,
            speed: 4
        }).start()
    }

    const animOut = () => {
        Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 400,
        }).start(() => setShowModal(false))
    }

    const [loading, setLoading] = useState(false);

    return (
        <View style={{
            position: "absolute",
            zIndex: 2,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Animated.View onLayout={() => animIn()} style={{
                transform: [{ scale: scaleAnim }],
                shadowColor: "gray",
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.33,
                shadowRadius: 5,
                backgroundColor: "rgb(242, 242, 242)",
                padding: 20,
                borderRadius: 10,
                width: "90%"
            }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>Valider le rendez-vous</Text>
                    <TouchableOpacity onPress={() => animOut()}>
                        <Ionicons name="close" size={20} color="black" />
                    </TouchableOpacity>
                </View>
                <Text style={{ marginVertical: 20 }}>Êtes-vous sûr(e) de vouloir prendre rendez-vous le <Text style={{ fontWeight: "bold" }}>{dayFull} {day} {monthFull}</Text> de <Text style={{ fontWeight: "bold" }}>{String(from).substring(0, 5).replace(":", "h")} <Text style={{ fontWeight: "400" }}>à</Text> {String(to).substring(0, 5).replace(":", "h")} </Text>avec <Text style={{ fontWeight: "bold" }}>{String(lastname).toUpperCase()} {name} ?</Text></Text>
                <TouchableOpacity onPress={() => {
                    if (checkLog()) {
                        setLoading(true);
                        prendreRdv(from, to, selectedDate);
                    }
                }} disabled={loading} style={{ padding: 10, backgroundColor: "black", borderRadius: 10, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Valider la date</Text>
                    {
                        loading && <ActivityIndicator color={"white"} style={{ marginLeft: 15 }} />
                    }
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
}

export const Reservation = () => {

    const uuid = "b26374e3-d5d6-40a5-905a-fad47ff6c89a";

    const [doctor, setDoctor] = useState(defaultDoctor);
    const [user, setUser] = useState(defaultUser);
    const [session, setSession] = useState({});
    const [userRdv, setUserRdv] = useState(defaultRdv);

    const [isInOrUp, setIsInOrUp] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showRdv, setShowRdv] = useState(false);

    const [showConfrimModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const getData = async () => {
            authListener(setSession);
            setDoctor(await fetchDoctor(uuid));
        }

        getData();
    }, []);

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
            alert("Ajout ton nom et ton prénom")
        }
    }, [user]);

    const reloadData = async () => {
        if (session && session.user) {
            const rdvs = await fetchUserRdv(session.user.id)
            setUserRdv([]);
            setUserRdv(rdvs);
            // setUserRdv(await fetchUserRdv(session.user.id));

            // setUserRdv([]);
        }
        setDoctor(await fetchDoctor(uuid));
    }

    const prendreRdv = async (from, to, selectedDate, setLoading) => {
        if (!session) {
            setIsInOrUp(true);
            return setShowModal(true);
        }

        const data = await addRdv(session.access_token, selectedDate.valueOf() + 14400000, from, to, uuid);

        if (data.error) {
            setLoading(false);
            setShowConfirmModal(false);
        } else {
            // pas d'erreur
            setShowConfirmModal(false);
            reloadData();
            setShowRdv(true);
        }
    }

    const checkLog = () => {
        if (!session) {
            setIsInOrUp(true);
            setShowModal(true);
            return false;
        }

        return true;
    }

    return (
        <View style={{ minHeight: 600, height: "100vh", width: "100vw", flexDirection: "row", backgroundColor: "rgb(242, 242, 242)", overflowX: "hidden" }}>
            {
                showModal && <AuthModal setShowModal={setShowModal} inOrUp={isInOrUp} />
            }
            {
                showRdv && <UserRdvModal rdvs={userRdv} setShowModal={setShowRdv} checkLog={checkLog} session={session} reloadData={reloadData} />
            }
            <TopBar user={user} session={session} setIsInOrUp={setIsInOrUp} setShowModal={setShowModal} setShowRdv={setShowRdv} />
            <View style={{ width: "50vw", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "white", borderTopRightRadius: 70, borderBottomRightRadius: 70 }}>
                <DoctorInfos doctor={doctor} />
            </View>
            <View style={{ width: "50vw", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "rgb(242, 242, 242)" }}>
                <Calendar checkLog={checkLog} setShowConfirmModal={setShowConfirmModal} showConfrimModal={showConfrimModal} prendreRdv={prendreRdv} agenda={doctor.agenda} rdvs={doctor.rdv} dLastname={doctor.lastname} dName={doctor.name} />
            </View>
        </View>
    )
}