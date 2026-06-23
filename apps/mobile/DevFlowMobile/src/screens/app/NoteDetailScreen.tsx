import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNote, useDeleteNote } from '../../hooks/useNotes';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

export default function NoteDetailScreen({ route, navigation }: any) {
  const { noteId, noteTitle } = route.params;
  const { data: note, isLoading, isError, refetch } = useNote(noteId);
  const deleteMutation = useDeleteNote();

  const handleDelete = () => {
    Alert.alert('Delete Note', `Are you sure you want to delete "${note?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          deleteMutation.mutate(noteId, {
            onSuccess: () => navigation.goBack()
          });
        }
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#111" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  if (isError || !note) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#111" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load note.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#111" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
          <Text style={styles.subtitle}>
            Generated {new Date(note.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.actionIconButton} 
          onPress={() => navigation.navigate('NoteForm', { noteToEdit: note })}
        >
          <Pencil color="#666" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconButton} onPress={handleDelete}>
          <Trash2 color="#ff4444" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.markdownContainer}>
          <Markdown style={markdownStyles}>
            {note.content}
          </Markdown>
        </View>
      </ScrollView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 16,
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    color: '#d63384',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: 16,
    borderRadius: 8,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
    paddingLeft: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  actionIconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  markdownContainer: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#111',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
