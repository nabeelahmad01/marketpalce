// screens/ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

// Define theme constants inline to avoid import issues
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#10B981',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  background: '#F8FAFC',
  border: '#E5E7EB',
};

const SIZES = {
  body: 16,
  bodySmall: 14,
  caption: 12,
  h5: 18,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  iconMD: 20,
  iconLG: 24,
};

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header
        title="Messages"
        subtitle={`${MOCK_CONVERSATIONS.length} conversation${MOCK_CONVERSATIONS.length !== 1 ? 's' : ''}`}
      />
      
      <FlatList 
        data={MOCK_CONVERSATIONS} 
        renderItem={renderConversation} 
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={SIZES.iconLG * 2} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>No Messages</Text>
            <Text style={styles.emptyText}>Your conversations will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  list: {
    flex: 1,
  },
  
  chatHeader: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    paddingTop: SIZES.lg + 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backBtn: {
    color: COLORS.white,
    fontSize: SIZES.body,
    marginRight: SIZES.md,
  },
  
  chatTitle: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  
  messageList: {
    flex: 1,
    padding: SIZES.md,
  },
  
  messageBubble: {
    backgroundColor: COLORS.gray200,
    borderRadius: 16,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    maxWidth: '80%',
  },
  
  messageMine: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  
  messageText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.bodySmall,
  },
  
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  chatInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.gray100,
    marginRight: SIZES.sm,
    fontSize: SIZES.bodySmall,
  },
  
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SIZES.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sendText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  
  conversationCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  
  conversationInfo: {
    flex: 1,
  },
  
  conversationName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  
  lastMessage: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  
  time: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
  },
  
  emptyTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
  },
  
  emptyText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});