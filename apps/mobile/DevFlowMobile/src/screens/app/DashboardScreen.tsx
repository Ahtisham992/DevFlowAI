import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useNotes } from '../../hooks/useNotes';
import { useConversations } from '../../hooks/useConversations';
import { FolderGit2, FileText, Bot, Plus, MessageSquare, Info } from 'lucide-react-native';
import { HelpModal } from '../../components/HelpModal';
import LoadingState from '../../components/LoadingState';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const { data: workspaces, isLoading: loadingW } = useWorkspaces();
  const { data: notes, isLoading: loadingN } = useNotes();
  const { data: chats, isLoading: loadingC } = useConversations();

  const isLoading = loadingW || loadingN || loadingC;

  const stats = [
    { label: 'Workspaces', value: workspaces?.length || 0, icon: FolderGit2, route: 'WorkspacesTab' },
    { label: 'Notes', value: notes?.length || 0, icon: FileText, route: 'NotesTab' },
    { label: 'AI Chats', value: chats?.length || 0, icon: Bot, route: 'AI Chat' },
  ];

  const recentNotes = notes 
    ? [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.titleName}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {user?.name || 'Developer'}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsHelpVisible(true)} style={styles.helpButton}>
            <Info color="#111" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <HelpModal visible={isHelpVisible} onClose={() => setIsHelpVisible(false)} />

      {isLoading ? (
        <LoadingState message="Loading dashboard..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsContainer}>
              <TouchableOpacity 
                style={styles.actionPill} 
                onPress={() => navigation.navigate('NotesTab', { screen: 'NoteFormScreen' })}
              >
                <Plus color="#111" size={16} />
                <Text style={styles.actionPillText}>New Note</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionPill}
                onPress={() => navigation.navigate('WorkspacesTab', { screen: 'WorkspaceFormScreen' })}
              >
                <Plus color="#111" size={16} />
                <Text style={styles.actionPillText}>New Workspace</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionPill}
                onPress={() => navigation.navigate('AI Chat')}
              >
                <MessageSquare color="#111" size={16} />
                <Text style={styles.actionPillText}>AI Chat</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Stats Grid */}
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

          {/* Recent Notes */}
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>Recent Notes</Text>
            {recentNotes.length === 0 ? (
              <Text style={styles.emptyText}>No recent notes found.</Text>
            ) : (
              <View style={styles.recentList}>
                {recentNotes.map((note, idx) => (
                  <TouchableOpacity 
                    key={note.id} 
                    style={[styles.recentItem, idx === recentNotes.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => navigation.navigate('NotesTab', { screen: 'NoteDetailScreen', params: { note } })}
                  >
                    <View style={styles.recentItemIcon}>
                      <FileText color="#666" size={18} />
                    </View>
                    <View style={styles.recentItemContent}>
                      <Text style={styles.recentItemTitle} numberOfLines={1}>{note.title}</Text>
                      <Text style={styles.recentItemDate}>{new Date(note.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  helpButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginLeft: 16,
  },
  titleName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsContainer: {
    flexDirection: 'row',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
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
  recentList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4,
  },
  recentItemDate: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
