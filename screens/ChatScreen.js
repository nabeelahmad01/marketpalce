import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  messageReceived: '#F1F5F9',
  messageSent: '#8B5CF6',
};

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  // Get other user info from route params or default
  const { otherUser: routeOtherUser, bookingId } = route.params || {};

  useEffect(() => {
    loadUserData();
    loadChatMessages();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      // In a real app, this would be WebSocket or Socket.IO
      loadChatMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }

      // Set other user from route params or mock data
      if (routeOtherUser) {
        setOtherUser(routeOtherUser);
      } else {
        // Mock other user data
        setOtherUser({
          id: 'mock_user_id',
          name: 'Ahmed Ali',
          type: 'mechanic',
          profileImage: null,
          isOnline: true,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadChatMessages = async () => {
    try {
      // Mock messages - replace with actual API call
      const mockMessages = [
        {
          id: '1',
          text: 'Hello! I saw your service request for car repair.',
          senderId: 'mock_user_id',
          senderName: 'Ahmed Ali',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
        },
        {
          id: '2',
          text: 'Hi Ahmed! Yes, I need my car engine checked.',
          senderId: currentUser?.id || 'current_user',
          senderName: currentUser?.name || 'You',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          type: 'text',
        },
        {
          id: '3',
          text: 'I can help you with that. What seems to be the problem?',
          senderId: 'mock_user_id',
          senderName: 'Ahmed Ali',
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          type: 'text',
        },
        {
          id: '4',
          text: 'The engine makes a strange noise when I start it.',
          senderId: currentUser?.id || 'current_user',
          senderName: currentUser?.name || 'You',
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          type: 'text',
        },
        {
          id: '5',
          text: 'I can come to your location tomorrow at 2 PM. My rate is ₹2500 for engine diagnosis.',
          senderId: 'mock_user_id',
          senderName: 'Ahmed Ali',
          timestamp: new Date(Date.now() - 3200000).toISOString(),
          type: 'text',
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: currentUser?.id || 'current_user',
      senderName: currentUser?.name || 'You',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Mock auto-response
      const responses = [
        "Got it! I'll be there on time.",
        "Thanks for the details. I'll bring the necessary tools.",
        "Sounds good! See you then.",
        "I'll send you my location when I'm on the way.",
        "Perfect! Looking forward to helping you.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        senderId: otherUser?.id || 'mock_user_id',
        senderName: otherUser?.name || 'Ahmed Ali',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setMessages(prev => [...prev, responseMessage]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);

    try {
      // Here you would send the message to your backend
      // await sendMessageToAPI(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageMessage = {
          id: Date.now().toString(),
          text: '',
          imageUri: result.assets[0].uri,
          senderId: currentUser?.id || 'current_user',
          senderName: currentUser?.name || 'You',
          timestamp: new Date().toISOString(),
          type: 'image',
        };

        setMessages(prev => [...prev, imageMessage]);
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item, index }) => {
    const isCurrentUser = item.senderId === (currentUser?.id || 'current_user');
    const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].senderId !== item.senderId);
    const showTime = index === messages.length - 1 || 
                   messages[index + 1].senderId !== item.senderId ||
                   new Date(messages[index + 1].timestamp).getTime() - new Date(item.timestamp).getTime() > 300000; // 5 minutes

    return (
      <View style={[styles.messageContainer, isCurrentUser && styles.messageContainerSent]}>
        {showAvatar && !isCurrentUser && (
          <View style={styles.avatar}>
            {otherUser?.profileImage ? (
              <Image source={{ uri: otherUser.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{otherUser?.name?.charAt(0) || 'A'}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.messageBubbleSent : styles.messageBubbleReceived,
          !showAvatar && !isCurrentUser && styles.messageBubbleNoAvatar,
        ]}>
          {item.type === 'image' ? (
            <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
          ) : (
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.messageTextSent : styles.messageTextReceived,
            ]}>
              {item.text}
            </Text>
          )}
          
          {showTime && (
            <Text style={[
              styles.messageTime,
              isCurrentUser ? styles.messageTimeSent : styles.messageTimeReceived,
            ]}>
              {formatTime(item.timestamp)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.avatar}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{otherUser?.name?.charAt(0) || 'A'}</Text>
          </View>
        </View>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            {otherUser?.profileImage ? (
              <Image source={{ uri: otherUser.profileImage }} style={styles.headerAvatarImage} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarText}>{otherUser?.name?.charAt(0) || 'A'}</Text>
              </View>
            )}
            {otherUser?.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{otherUser?.name || 'User'}</Text>
            <Text style={styles.headerStatus}>
              {otherUser?.isOnline ? 'Online' : 'Last seen recently'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={sendImage}>
            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? COLORS.white : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerAction: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageContainerSent: {
    justifyContent: 'flex-end',
  },
  avatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleReceived: {
    backgroundColor: COLORS.messageReceived,
    borderBottomLeftRadius: 4,
  },
  messageBubbleSent: {
    backgroundColor: COLORS.messageSent,
    borderBottomRightRadius: 4,
  },
  messageBubbleNoAvatar: {
    marginLeft: 40,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTextReceived: {
    color: COLORS.text,
  },
  messageTextSent: {
    color: COLORS.white,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageTimeReceived: {
    color: COLORS.textSecondary,
  },
  messageTimeSent: {
    color: 'rgba(255,255,255,0.8)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  typingBubble: {
    backgroundColor: COLORS.messageReceived,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: COLORS.background,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: COLORS.border,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});
