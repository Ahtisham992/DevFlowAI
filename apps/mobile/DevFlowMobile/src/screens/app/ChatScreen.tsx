import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useMessages, Message } from '../../hooks/useConversations';
import { Send, Bot, User, Square, ArrowLeft } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import LoadingState from '../../components/LoadingState';
import { useAuthStore } from '../../store/auth.store';
import EventSource from 'react-native-sse';
import { useQueryClient } from '@tanstack/react-query';

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId: initialConversationId, projectId } = route.params;
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const { data: historyMessages, isLoading } = useMessages(conversationId);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProjectConv = async () => {
        try {
          const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';
          const res = await fetch(`${baseURL}/ai/projects/${projectId}/conversation`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.id) {
              setConversationId(data.id);
            }
          }
        } catch (e) {
          console.error('Failed to fetch project conversation', e);
        }
      };
      fetchProjectConv();
    }
  }, [projectId, token]);

  useEffect(() => {
    if (historyMessages) {
      setMessages(historyMessages);
    }
  }, [historyMessages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    
    const currentInput = input;
    setInput('');
    
    const userMsg: Message = { id: Date.now().toString() + 'u', role: 'user', content: currentInput, createdAt: new Date().toISOString() };
    const botMsg: Message = { id: Date.now().toString() + 'b', role: 'assistant', content: '', createdAt: new Date().toISOString() };
    
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setIsStreaming(true);

    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';
    
    const es = new EventSource(`${baseURL}/ai/chat/stream`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
      body: JSON.stringify({ 
        message: currentInput, 
        conversationId, 
        model: 'llama3',
        projectId
      })
    });

    eventSourceRef.current = es;

    es.addEventListener('message', (event: any) => {
      if (event.data === '[DONE]') {
        es.close();
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        return;
      }
      
      try {
        const data = JSON.parse(event.data);
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
        if (data.content) {
          setMessages((prev) => {
            const newMsgs = [...prev];
            const lastIndex = newMsgs.length - 1;
            if (newMsgs[lastIndex] && newMsgs[lastIndex].role === 'assistant') {
              newMsgs[lastIndex] = {
                ...newMsgs[lastIndex],
                content: newMsgs[lastIndex].content + data.content
              };
            }
            return newMsgs;
          });
        }
      } catch (e) {
        console.error('Parse SSE error:', e);
      }
    });

    es.addEventListener('error', (event: any) => {
      console.error('SSE Error:', event);
      es.close();
      setIsStreaming(false);
    });
  };

  const handleStop = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsStreaming(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperBot]}>
        {!isUser && (
          <View style={styles.avatarBot}>
            <Bot color="#000" size={16} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageUser : styles.messageBot]}>
          {isUser ? (
            <Text style={styles.messageTextUser}>{item.content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{item.content || '...'}</Markdown>
          )}
        </View>
        {isUser && (
          <View style={styles.avatarUser}>
            <User color="#fff" size={16} />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#111" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.params?.title || 'Chat'}</Text>
      </View>

      {isLoading && messages.length === 0 ? (
        <LoadingState message="Loading messages..." />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask DevFlow AI..."
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
        />
        {isStreaming ? (
          <TouchableOpacity style={[styles.sendButton, styles.stopButton]} onPress={handleStop}>
            <Square color="#fff" size={20} fill="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!input.trim()}>
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperBot: {
    justifyContent: 'flex-start',
  },
  avatarBot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageUser: {
    backgroundColor: '#000',
    borderBottomRightRadius: 4,
  },
  messageBot: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  messageTextUser: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ff4444',
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    color: '#111',
  },
  code_inline: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    padding: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  code_block: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 8,
    marginBottom: 8,
  },
  fence: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 8,
    marginBottom: 8,
  },
};
