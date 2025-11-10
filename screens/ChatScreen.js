// screens/ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Ali Khan', lastMessage: 'I will be there in 30 mins', time: '2:45 PM' },
  { id: '2', name: 'Hassan Ahmed', lastMessage: 'What is your budget?', time: '1:20 PM' },
];

export default function ChatScreen() {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), text: message, sender: 'me' }]);
    setMessage('');
  };

  if (activeChat) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveChat(null)}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{activeChat.name}</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === 'me' && styles.messageMine]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          keyExtractor={i => i.id.toString()}
          style={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const renderConversation = ({ item }) => (
    <TouchableOpacity style={styles.conversationCard} onPress={() => setActiveChat(item)}>
      <View style={styles.avatar}>
        <Text>👤</Text>
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList data={MOCK_CONVERSATIONS} renderItem={renderConversation} keyExtractor={i => i.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  chatHeader: { backgroundColor: '#007AFF', padding: 15, paddingTop: 25, flexDirection: 'row', alignItems: 'center' },
  backBtn: { color: '#fff', fontSize: 16, marginRight: 15 },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
  messageList: { flex: 1, padding: 10 },
  messageBubble: { backgroundColor: '#e0e0e0', borderRadius: 10, padding: 10, marginBottom: 8, maxWidth: '80%' },
  messageMine: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  messageText: { color: '#333', fontSize: 14 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  chatInput: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#f0f0f0', marginRight: 10 },
  sendBtn: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 15, justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  conversationCard: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  conversationInfo: { flex: 1 },
  conversationName: { fontSize: 16, fontWeight: '600', marginBottom: 3 },
  lastMessage: { fontSize: 13, color: '#666' },
  time: { fontSize: 12, color: '#999' }
});