import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCreateWorkspace, useUpdateWorkspace } from '../../hooks/useWorkspaces';
import { ArrowLeft } from 'lucide-react-native';

export default function WorkspaceFormScreen({ route, navigation }: any) {
  const { workspaceToEdit } = route.params || {};
  const isEditing = !!workspaceToEdit;

  const [name, setName] = useState(workspaceToEdit?.name || '');
  const [description, setDescription] = useState(workspaceToEdit?.description || '');

  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (isEditing) {
      updateMutation.mutate(
        { id: workspaceToEdit.id, name, description },
        { onSuccess: () => navigation.goBack() }
      );
    } else {
      createMutation.mutate(
        { name, description },
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
        <Text style={styles.title}>{isEditing ? 'Edit Workspace' : 'New Workspace'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. My Personal Workspace"
          value={name}
          onChangeText={setName}
          autoFocus={!isEditing}
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What's this workspace for?"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity 
          style={[styles.button, !name.trim() && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={!name.trim() || isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Create Workspace'}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#111',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
