import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Modal, Pressable, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import * as Speech from 'expo-speech';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const COLORS = {
  primaryBg: '#99E7D9',
  primaryText: '#34B0A6',
  accentLight: '#34B0A6',
  accentMedium: '#99E7D9',
  accentDark: '#34B0A6',
  accentWarm: '#34B0A6',
  lightBorder: '#99E7D9',
};

const TOPICS = [
  { icon: 'home', label: 'Ambiente Preparado' },
  { icon: 'puzzle-piece', label: 'Materiales Sensoriales' },
  { icon: 'globe', label: 'Educación Cósmica' },
  { icon: 'key', label: 'Autonomía' },
  { icon: 'book', label: 'Ciclos de Desarrollo' },
];

const GUIDED_OPTIONS = [
  { key: 'casa', label: 'Cómo aplicar en casa', prompt: '¿Cómo puedo aplicar los principios Montessori en casa?' },
  { key: 'actividades', label: 'Diseñar actividades', prompt: '¿Cómo diseñar actividades Montessori apropiadas para mi hijo?' },
  { key: 'citas', label: 'Citas de María Montessori', prompt: 'Comparte algunas citas inspiradoras de María Montessori' },
  { key: 'adaptaciones', label: 'Sugerir adaptaciones por etapa', prompt: '¿Qué adaptaciones Montessori puedo hacer según la etapa de desarrollo de mi hijo?' },
];

const WELCOME_MSG = '¡Hola! Soy tu asistente educativo Montessori. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre los principios Montessori, materiales, ambiente preparado, o cualquier tema relacionado con este método educativo.';

const MONTESSORI_LOOP_ID = '1f2a7160-c1fc-48a3-90e3-c4eb7b3b1046';
const FEEDBACK_LOGGER_LOOP_ID = '854d3eb4-ca6d-409b-8f97-5b50ce1d3c89';

export default function MontessoriAssistant() {
  const [conversation, setConversation] = useState([{ role: 'ai', content: WELCOME_MSG, id: Date.now().toString() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [speechRate, setSpeechRate] = useState(1);
  const [guidedVisible, setGuidedVisible] = useState(false);
  const scrollRef = useRef();

  //fuentes
    const [fontsLoaded] = useFonts({
          CenturyGothic: require('../../assets/fonts/3394-font.ttf'),
          CenturyGothicBold: require('../../assets/fonts/Century-Gothic-Bold.ttf'),
          CenturyGothicBold1a: require('../../assets/fonts/4410-font.ttf'),
      });

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [conversation]);

  const speakText = (text) => {
    Speech.speak(text, { rate: speechRate });
  };

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    const userMsg = { role: 'user', content: msg, id: Date.now().toString() };
    setConversation(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`https://magicloops.dev/api/loop/${MONTESSORI_LOOP_ID}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: msg,
          userRole: 'padre',
          voiceGender,
          speechRate,
          conversationHistory: conversation.map(m => ({
            sender: m.role === 'user' ? 'user' : 'assistant',
            text: m.content
          }))
        })
      });
      const { replyText } = await response.json();
      const aiMsg = { role: 'ai', content: replyText, id: Date.now().toString() };
      setConversation(prev => [...prev, aiMsg]);
      speakText(replyText);
    } catch (err) {
      setConversation(prev => [...prev, { role: 'ai', content: 'Lo siento, ocurrió un error al conectar con el servidor.', id: Date.now().toString() }]);
    }
    setLoading(false);
  };

  const handleFeedback = async (messageId, rating) => {
    await fetch(`https://magicloops.dev/api/loop/${FEEDBACK_LOGGER_LOOP_ID}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, rating, comment: '' })
    });
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.role === 'user' ? styles.userMessage : styles.aiMessage]}>
      <Text>{item.content}</Text>
      
    </View>
  );

  const handleNewConversation = () => {
    setConversation([{ role: 'ai', content: WELCOME_MSG, id: Date.now().toString() }]);
    Speech.stop();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* encavezado */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome name="child" size={32} color={COLORS.accentDark} style={{ marginRight: 12 }} />
          <Text style={styles.logoTitle}>Montessori AI Assistant</Text>
        </View>

        <View style={styles.voiceControls}>
          <TouchableOpacity style={styles.guidedBtn} onPress={() => setGuidedVisible(true)}>
            <MaterialCommunityIcons name="sign-direction" size={20} color={COLORS.accentDark} />
            <Text style={{ marginLeft: 8 }}>Modo Guiado</Text>
            <Ionicons name="chevron-down" size={16} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <Modal visible={guidedVisible} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={() => setGuidedVisible(false)}>
              <View style={styles.guidedMenu}>
                {GUIDED_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt.key} style={styles.guidedOption} onPress={() => {
                    setGuidedVisible(false);
                    sendMessage(opt.prompt);
                  }}>
                    <Text>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>

          <TouchableOpacity style={styles.voiceSelect} onPress={() => setVoiceGender(voiceGender === 'female' ? 'male' : 'female')}>
            <Text>{voiceGender === 'female' ? 'Femenina' : 'Masculina'}</Text>
          </TouchableOpacity>

          <View style={styles.speedRange}>
            <TouchableOpacity onPress={() => setSpeechRate(Math.max(0.5, speechRate - 0.1))}>
              <Ionicons name="remove-circle-outline" size={18} color={COLORS.accentDark} />
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 8, fontFamily: 'CenturyGothicBold1a', }}>{speechRate.toFixed(1)}</Text>
            <TouchableOpacity onPress={() => setSpeechRate(Math.min(1.5, speechRate + 0.1))}>
              <Ionicons name="add-circle-outline" size={18} color={COLORS.accentDark} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.newConversationBtn} onPress={handleNewConversation}>
            <Ionicons name="add" size={16} color="#99E7D9" style={{ marginRight: 4 }} />
            <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'CenturyGothicBold1a',}}>Nueva Conversación</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.scroll}>
        {/* Temas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
          {TOPICS.map(topic => (
            <TouchableOpacity key={topic.label} style={styles.topicButton} onPress={() => sendMessage(`Cuéntame sobre ${topic.label}`)}>
              <FontAwesome name={topic.icon} size={20} style={styles.topicIcon} />
              <Text style={styles.texto}>{topic.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Chat */}
      <View style={styles.chatContainer}>
        <FlatList
          ref={scrollRef}
          data={conversation}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
        {loading && (
          <View style={styles.loadingSpinner}>
            <Text style={{ color: COLORS.accentDark, fontFamily: 'CenturyGothic', }}>Cargando respuesta...</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.micButton}>
            <FontAwesome name="microphone" size={22} color={COLORS.primaryText} />
          </TouchableOpacity>
          <TextInput
            style={styles.inputField}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu pregunta sobre Montessori..."
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(input)}>
            <FontAwesome name="paper-plane" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.lightBorder,
    backgroundColor: 'white',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.accentDark,
  },
  voiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 12,
  },
  guidedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidedMenu: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: 280,
    elevation: 4,
  },
  guidedOption: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
  },
  voiceSelect: {
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  speedRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newConversationBtn: {
    backgroundColor: COLORS.accentWarm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicScroll: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: '#99E7D9',
  },
  topicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
    height: 90,
    padding: 10,
    marginRight: 8,
    backgroundColor: '#99E7D9',
    borderWidth: 4,
    borderColor: '#34B0A6',
    borderRadius: 12,
    top: 10,
    marginBottom: 20,
  },
  topicIcon: {
    marginRight: 6,
    color: COLORS.accentDark,
    left: 50,
    bottom: 20,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
  },
  userMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: COLORS.accentLight,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  ratingControl: {
    flexDirection: 'row',
    position: 'absolute',
    right: -30,
    top: 10,
    opacity: 0.7,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontFamily: 'CenturyGothic',
  },
  sendButton: {
    backgroundColor: COLORS.accentDark,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    marginRight: 8,
  },
  loadingSpinner: {
    marginTop: 8,
  },
  texto: {
    color: '#000',
    width: 80,
    top: 20,
    fontFamily: 'CenturyGothicBold1a',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderColor: COLORS.lightBorder,
    padding: 12,
    backgroundColor: 'white',
    height: 120,
  },
});

