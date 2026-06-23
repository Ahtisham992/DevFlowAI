import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import { ArrowLeft } from 'lucide-react-native';

export default function ProjectFormScreen({ route, navigation }: any) {
  const { workspaceId, projectToEdit } = route.params || {};
  const isEditing = !!projectToEdit;

  const [name, setName] = useState(projectToEdit?.name || '');
  const [description, setDescription] = useState(projectToEdit?.description || '');
  const [framework, setFramework] = useState(projectToEdit?.framework || '');
  const [githubUrl, setGithubUrl] = useState(projectToEdit?.githubUrl || '');

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (isEditing) {
      updateMutation.mutate(
        { id: projectToEdit.id, name, description, framework, githubUrl },
        { onSuccess: () => navigation.goBack() }
      );
    } else {
      createMutation.mutate(
        { name, description, framework, githubUrl, workspaceId },
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
        <Text style={styles.title}>{isEditing ? 'Edit Project' : 'New Project'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. E-Commerce App"
          value={name}
          onChangeText={setName}
          autoFocus={!isEditing}
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief description"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Framework (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Next.js, React, NestJS"
          value={framework}
          onChangeText={setFramework}
        />

        <Text style={styles.label}>GitHub URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://github.com/user/repo"
          value={githubUrl}
          onChangeText={setGithubUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        <TouchableOpacity 
          style={[styles.button, !name.trim() && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={!name.trim() || isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Create Project'}</Text>
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
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#111',
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
