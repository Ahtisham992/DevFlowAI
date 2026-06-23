import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCreateNote, useUpdateNote } from '../../hooks/useNotes';
import { ArrowLeft } from 'lucide-react-native';

export default function NoteFormScreen({ route, navigation }: any) {
  const { projectId, noteToEdit } = route.params || {};
  const isEditing = !!noteToEdit;

  const [title, setTitle] = useState(noteToEdit?.title || '');
  const [content, setContent] = useState(noteToEdit?.content || '');

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    if (isEditing) {
      updateMutation.mutate(
        { id: noteToEdit.id, title, content },
        { onSuccess: () => navigation.goBack() }
      );
    } else {
      createMutation.mutate(
        { title, content, projectId },
        { onSuccess: () => navigation.goBack() }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#111" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
      </View>

      <View style={styles.contentContainer}>
        <TextInput
          style={styles.inputTitle}
          placeholder="Note Title"
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
        />

        <TextInput
          style={styles.inputContent}
          placeholder="Write in Markdown..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={[styles.button, (!title.trim() || !content.trim()) && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={!title.trim() || !content.trim() || isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Create Note'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  inputContent: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
