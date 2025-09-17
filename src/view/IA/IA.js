// App.js
import React, { useEffect, useRef, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const LOOP_MONTESSORI_RESPONDER = "1f2a7160-c1fc-48a3-90e3-c4eb7b3b1046";
// Feedback Logger eliminado (quitamos pulgares)

const COLOR_BG = "#99E7D9";
const COLOR_PRIMARY = "#34B0A6";
const COLOR_WHITE = "#FFFFFF";
const STORAGE_KEY = "montessoriChatHistory";

export default function App() {
    const scrollRef = useRef(null);

    function cleanTextForSpeech(text) {
        let cleaned = text;

        // 1) Convertir listas numeradas "1." → "número 1"
        cleaned = cleaned.replace(/(\d+)\./g, "número $1");

        // 2) Eliminar asteriscos (por ejemplo *texto* → texto)
        cleaned = cleaned.replace(/\*/g, "");

        // 3) Opcional: eliminar guiones largos y símbolos raros
        cleaned = cleaned.replace(/[•\-]/g, " ");

        return cleaned.trim();
    }
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content:
                "¡Hola! Soy tu asistente educativo Montessori. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre los principios Montessori, materiales, ambiente preparado, o cualquier tema relacionado con este método educativo.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Controles de voz
    const [voiceGender, setVoiceGender] = useState("female"); // "female" | "male"
    const [speechRate, setSpeechRate] = useState(1.0); // 0.5 - 1.5 (usamos pasos en UI)

    // UI: modo guiado
    const [guidedOpen, setGuidedOpen] = useState(false);

    // Limpiar TTS al desmontar
    useEffect(() => {
        return () => {
        
            Speech.stop();
        };
    }, []);


    // Cargar historial
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length) {
                        setMessages(parsed);
                    }
                }
            } catch (e) {
                console.log("No se pudo cargar historial:", e);
            }
        })();
    }, []);

    // Guardar historial
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => { });
    }, [messages]);

    // Leer automáticamente cada vez que la IA responde
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === "ai") {
            Speech.stop(); // detener si estaba leyendo algo anterior

            const cleaned = cleanTextForSpeech(lastMessage.content);

            Speech.speak(cleaned, {
                language: "es",
                rate: Number(speechRate) || 1.0,
            });
        }
    }, [messages]);



    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, loading]);

    const speak = (text) => {
        try {
            Speech.stop();
            // No todas las plataformas permiten elegir una voz por género,
            // pero respetamos rate y language.
            Speech.speak(text, {
                language: "es",
                rate: Number(speechRate) || 1.0,
                pitch: 1.0,
            });
        } catch (err) {
            console.log("Error TTS:", err);
        }
    };

    const addMessage = (role, content) => {
        setMessages((prev) => [...prev, { role, content }]);
    };

    const buildPayload = (userText) => {
        return {
            userMessage: userText,
            userRole: "padre",
            voiceGender: voiceGender,
            speechRate: Number(speechRate) || 1.0,
            conversationHistory: messages.map((m) => ({
                sender: m.role === "user" ? "user" : "assistant",
                text: m.content,
            })),
        };
    };

    const callAPI = async (promptText) => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://magicloops.dev/api/loop/${LOOP_MONTESSORI_RESPONDER}/run`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(buildPayload(promptText)),
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const reply = data?.replyText || "No he podido generar una respuesta.";
            addMessage("ai", reply);
            speak(data?.ssml || reply);
        } catch (err) {
            console.log("API error:", err);
            addMessage(
                "ai",
                "Lo siento, ocurrió un error al conectar con el servidor."
            );
        } finally {
            setLoading(false);
        }
    };

    const onSend = () => {
        const text = input.trim();
        if (!text) return;
        addMessage("user", text);
        setInput("");
        callAPI(text);
    };

    const onTopic = (topic) => {
        const text = `Cuéntame sobre ${topic}`;
        addMessage("user", text);
        callAPI(text);
    };

    const onGuided = (key) => {
        let promptText = "";
        switch (key) {
            case "docente":
                promptText = "¿Cómo puedo aplicar los principios Montessori en colegio?";
                break;
            case "actividades":
                promptText =
                    "¿Cómo diseñar actividades Montessori apropiadas para mis alumnos?";
                break;
            case "citas":
                promptText = "Comparte algunas citas inspiradoras de María Montessori";
                break;
            case "adaptaciones":
                promptText =
                    "¿Qué adaptaciones Montessori puedo hacer según la etapa de desarrollo de mis alumnos?";
                break;
            default:
                return;
        }
        setGuidedOpen(false);
        addMessage("user", promptText);
        callAPI(promptText);
    };

    const onNewConversation = async () => {
        try {
            Speech.stop();
            await AsyncStorage.removeItem(STORAGE_KEY);
            setMessages([
                {
                    role: "ai",
                    content:
                        "¡Hola! Soy tu asistente educativo Montessori. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre los principios Montessori, materiales, ambiente preparado, o cualquier tema relacionado con este método educativo.",
                },
            ]);
        } catch (e) {
            Alert.alert("Error", "No se pudo reiniciar la conversación.");
        }
    };

    // UI helpers para controles de voz
    const cycleVoiceGender = () => {
        setVoiceGender((g) => (g === "female" ? "male" : "female"));
    };
    const decRate = () => setSpeechRate((r) => Math.max(0.5, +(r - 0.1).toFixed(1)));
    const incRate = () => setSpeechRate((r) => Math.min(1.5, +(r + 0.1).toFixed(1)));

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <FontAwesome5 name="child" size={28} color={COLOR_PRIMARY} />
                    <Text style={styles.headerTitle}>Montessori AI</Text>
                </View>

                {/* Controles de voz */}
                <View style={styles.voiceControls}>
                    <TouchableOpacity
                        style={styles.voicePill}
                        onPress={cycleVoiceGender}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="record-voice-over" size={18} color={COLOR_WHITE} />
                        <Text style={styles.voicePillText}>
                            {voiceGender === "female" ? "Femenina" : "Masculina"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.rateBox}>
                        <TouchableOpacity onPress={decRate} style={styles.rateBtn}>
                            <Ionicons name="remove" size={16} color={COLOR_PRIMARY} />
                        </TouchableOpacity>
                        <Text style={styles.rateText}>{speechRate.toFixed(1)}x</Text>
                        <TouchableOpacity onPress={incRate} style={styles.rateBtn}>
                            <Ionicons name="add" size={16} color={COLOR_PRIMARY} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={onNewConversation}
                        style={styles.newConvBtn}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add" size={16} color={COLOR_WHITE} />
                        <Text style={styles.newConvText}>Nueva</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modo Guiado */}
            <View style={styles.guidedWrap}>
                <TouchableOpacity
                    style={styles.guidedBtn}
                    onPress={() => setGuidedOpen((x) => !x)}
                    activeOpacity={0.85}
                >
                    <Ionicons name="map" size={18} color={COLOR_PRIMARY} />
                    <Text style={styles.guidedText}>Modo Guiado</Text>
                    <Ionicons
                        name={guidedOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={COLOR_PRIMARY}
                    />
                </TouchableOpacity>

                {guidedOpen && (
                    <View style={styles.guidedMenu}>
                        <GuidedItem label="Cómo aplicar en el colegio" onPress={() => onGuided("docente")} />
                        <GuidedItem
                            label="Diseñar actividades"
                            onPress={() => onGuided("actividades")}
                        />
                        <GuidedItem label="Citas de María Montessori" onPress={() => onGuided("citas")} />
                        <GuidedItem
                            label="Adaptaciones por etapa"
                            onPress={() => onGuided("adaptaciones")}
                        />
                    </View>
                )}
            </View>

            {/* Temas */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topicsRow}
            >
                <TopicButton icon="🏠" label="Ambiente Preparado" onPress={() => onTopic("Ambiente Preparado")} />
                <TopicButton icon="🧩" label="Materiales Sensoriales" onPress={() => onTopic("Materiales Sensoriales")} />
                <TopicButton icon="🌍" label="Educación Cósmica" onPress={() => onTopic("Educación Cósmica")} />
                <TopicButton icon="🔑" label="Autonomía" onPress={() => onTopic("Autonomía")} />
                <TopicButton icon="📚" label="Ciclos de Desarrollo" onPress={() => onTopic("Ciclos de Desarrollo")} />
            </ScrollView>

            {/* Chat */}
            <ScrollView
                ref={scrollRef}
                style={styles.chat}
                contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 12 }}
            >
                {messages.map((m, i) => (
                    <Bubble key={i} role={m.role} text={m.content} onSpeak={() => speak(m.content)} />
                ))}
                {loading && <TypingIndicator />}
            </ScrollView>

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.inputBar}>
                    {/* Botón de micrófono (placeholder: TTS-only). Si quieres dictado real, integra react-native-voice en un dev client. */}
                    {/*
                    <TouchableOpacity
                        onPress={() =>
                            Alert.alert(
                                "Micrófono",
                                "El dictado por voz no está activo. Esta app usa lectura en voz alta (TTS). Para STT puedes integrar react-native-voice en un Dev Client."
                            )
                        }
                        style={styles.micBtn}
                    >
                        <Ionicons name="mic" size={20} color={COLOR_PRIMARY} />
                    </TouchableOpacity>*/}

                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Escribe tu pregunta sobre Montessori..."
                        style={styles.input}
                        returnKeyType="send"
                        onSubmitEditing={onSend}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={onSend} disabled={loading}>
                        <Ionicons name="send" size={18} color={COLOR_WHITE} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Bubble({ role, text, onSpeak }) {
    const isUser = role === "user";
    return (
        <View
            style={[
                styles.bubble,
                isUser ? styles.bubbleUser : styles.bubbleAI,
            ]}
        >
            <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
                {text}
            </Text>
            {!isUser && (
                <TouchableOpacity onPress={onSpeak} style={styles.speaker}>
                    <Ionicons name="volume-high" size={18} color={COLOR_WHITE} />
                </TouchableOpacity>
            )}
        </View>
    );
}

function TopicButton({ icon, label, onPress }) {
    return (
        <TouchableOpacity style={styles.topicBtn} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.topicIcon}>{icon}</Text>
            <Text style={styles.topicText}>{label}</Text>
        </TouchableOpacity>
    );
}

function GuidedItem({ label, onPress }) {
    return (
        <TouchableOpacity style={styles.guidedItem} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.guidedItemText}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLOR_PRIMARY} />
        </TouchableOpacity>
    );
}

function TypingIndicator() {
    return (
        <View style={styles.typingWrap}>
            <View style={styles.dot} />
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.3 }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLOR_BG },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: COLOR_WHITE,
        borderBottomWidth: 1,
        borderBottomColor: "#e6e6e6",
        justifyContent: "space-between",
        gap: 10,
        height: 120,
    },
    headerLeft: { 
        flexDirection: "row", 
        alignItems: "center",
        bottom: 20,
        gap: 10 
    },
    headerTitle: {
        fontSize: 30,
        color: COLOR_PRIMARY,
        fontWeight: "700",
    },

    voiceControls: { flexDirection: "row", alignItems: "center", gap: 8 },
    voicePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: COLOR_PRIMARY,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        width: 100,
        top: 30,
        right: 235,
    },
    voicePillText: { color: COLOR_WHITE, fontWeight: "600", fontSize: 12 },
    rateBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLOR_WHITE,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLOR_PRIMARY,
        paddingHorizontal: 6,
        paddingVertical: 4,
        gap: 6,
        top: 30,
        right: 220,
    },
    rateBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLOR_PRIMARY,
        alignItems: "center",
        justifyContent: "center",
    },
    rateText: { fontWeight: "700", color: COLOR_PRIMARY, minWidth: 36, textAlign: "center" },
    newConvBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: COLOR_PRIMARY,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        width: 120,
        top: 30,
        right: 200,
    },
    newConvText: { color: COLOR_WHITE, fontWeight: "700", fontSize: 12 },

    guidedWrap: { paddingHorizontal: 12, paddingTop: 10 },
    guidedBtn: {
        backgroundColor: COLOR_WHITE,
        borderWidth: 1,
        borderColor: "#d9f4ef",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    guidedText: { color: COLOR_PRIMARY, fontWeight: "700" },
    guidedMenu: {
        marginTop: 8,
        backgroundColor: COLOR_WHITE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d9f4ef",
        overflow: "hidden",
    },
    guidedItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#eef9f7",
    },
    guidedItemText: { color: "#245b55", fontWeight: "600" },

    topicsRow: {
        height: 80,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 1,
    },
    topicBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLOR_WHITE,
        borderWidth: 1,
        borderColor: "#d9f4ef",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 8,
    },
    topicIcon: { fontSize: 16, marginRight: 6 },
    topicText: { color: "#245b55", fontWeight: "600" },

    chat: { 
        bottom: 40,
        height: 400,
        top: 15,
    },

    bubble: {
        maxWidth: "80%",
        padding: 12,
        marginBottom: 10,
        borderRadius: 16,
        position: "relative",
    },
    bubbleUser: {
        alignSelf: "flex-end",
        backgroundColor: COLOR_WHITE,
        borderBottomRightRadius: 6,
    },
    bubbleAI: {
        alignSelf: "flex-start",
        backgroundColor: COLOR_PRIMARY,
        borderBottomLeftRadius: 6,
    },
    bubbleText: { fontSize: 15, lineHeight: 20 },
    userText: { color: "#1d1d1f" },
    aiText: { color: COLOR_WHITE },

    speaker: {
        position: "absolute",
        right: 8,
        bottom: 8,
        backgroundColor: "rgba(0,0,0,0.25)",
        padding: 6,
        borderRadius: 999,
    },

    typingWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: "flex-start",
    },
    dot: {
        width: 8,
        height: 8,
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 4,
    },

    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: COLOR_WHITE,
        borderTopWidth: 1,
        borderTopColor: "#e6e6e6",
        gap: 8,
        top: 20,
        height: 150,
    },
    micBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLOR_PRIMARY,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ecfffb",
        bottom: 30,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d9f4ef",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
        bottom: 30,
    },
    sendBtn: {
        backgroundColor: COLOR_PRIMARY,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        bottom: 30,
    },
});
