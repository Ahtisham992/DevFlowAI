import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useNotes } from '../../hooks/useNotes';
import { useConversations } from '../../hooks/useConversations';
import { FolderGit2, FileText, Bot } from 'lucide-react-native';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  
  const { data: workspaces, isLoading: loadingW } = useWorkspaces();
  const { data: notes, isLoading: loadingN } = useNotes();
  const { data: chats, isLoading: loadingC } = useConversations();

  const isLoading = loadingW || loadingN || loadingC;

  const stats = [
    { label: 'Workspaces', value: workspaces?.length || 0, icon: FolderGit2, route: 'WorkspacesTab' },
    { label: 'Notes', value: notes?.length || 0, icon: FileText, route: 'NotesTab' },
    { label: 'AI Chats', value: chats?.length || 0, icon: Bot, route: 'AI Chat' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Welcome back,</Text>
            <Text style={styles.titleName}>{user?.name || 'Developer'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Your AI-powered developer workspace</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.card}
                  onPress={() => navigation.navigate(stat.route)}
                >
                  <View style={styles.iconContainer}>
                    <Icon color="#111" size={24} />
                  </View>
                  <Text style={styles.cardValue}>{stat.value}</Text>
                  <Text style={styles.cardLabel}>{stat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    color: '#666',
  },
  titleName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 14,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
