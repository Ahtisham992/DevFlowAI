import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useConversations, Conversation, useDeleteConversation } from '../../hooks/useConversations';
import { MessageSquare, Plus, Trash2, Bot } from 'lucide-react-native';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';

export default function ConversationsListScreen({ navigation }: any) {
  const { data: conversations, isLoading, refetch } = useConversations();
  const deleteMutation = useDeleteConversation();

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Chat', `Are you sure you want to delete this chat?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ChatDetail', { conversationId: item.id, title: item.title })}
      >
        <View style={styles.cardHeader}>
          <MessageSquare color="#666" size={20} />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || 'New Conversation'}
          </Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Model: {item.model} • {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDelete(item.id, item.title || 'New Conversation')}
      >
        <Trash2 color="#ff4444" size={20} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <LoadingState message="Loading chats..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Chats</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <EmptyState 
            icon={Bot} 
            title="No conversations yet" 
            message="Start a new chat to ask DevFlow AI!" 
          />
        }
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ChatDetail', { conversationId: null, title: 'New Chat' })}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 24,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteButton: {
    padding: 16,
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
