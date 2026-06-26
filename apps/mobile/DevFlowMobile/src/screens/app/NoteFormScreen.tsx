import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Pressable } from 'react-native';
import { useCreateNote, useUpdateNote } from '../../hooks/useNotes';
import { useAllProjects } from '../../hooks/useProjects';
import { ArrowLeft, Tag, ChevronDown, Check } from 'lucide-react-native';

export default function NoteFormScreen({ route, navigation }: any) {
  const { projectId: initialProjectId, noteToEdit } = route.params || {};
  const isEditing = !!noteToEdit;

  const [title, setTitle] = useState(noteToEdit?.title || '');
  const [content, setContent] = useState(noteToEdit?.content || '');
  const [tags, setTags] = useState(noteToEdit?.tags?.join(', ') || '');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || noteToEdit?.projectId || '');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const { data: projects, isLoading: projectsLoading } = useAllProjects();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { 
      title, 
      content, 
      tags: parsedTags, 
      projectId: selectedProjectId || undefined 
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: noteToEdit.id, ...payload },
        { onSuccess: () => navigation.goBack() }
      );
    } else {
      createMutation.mutate(
        payload,
        { onSuccess: () => navigation.goBack() }
      );
    }
  };

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#111" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.inputTitle}
          placeholder="Note Title"
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
        />

        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Project</Text>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setIsDropdownVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedProject ? selectedProject.name : 'None'}
              </Text>
              <ChevronDown color="#666" size={20} />
            </TouchableOpacity>

            <Modal
              visible={isDropdownVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setIsDropdownVisible(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setIsDropdownVisible(false)}>
                <View style={styles.dropdownMenu}>
                  <Text style={styles.dropdownTitle}>Select Project</Text>
                  <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => { setSelectedProjectId(''); setIsDropdownVisible(false); }}
                    >
                      <Text style={[styles.dropdownItemText, !selectedProjectId && styles.dropdownItemTextSelected]}>None</Text>
                      {!selectedProjectId && <Check color="#111" size={18} />}
                    </TouchableOpacity>
                    {projects.map(project => (
                      <TouchableOpacity
                        key={project.id}
                        style={styles.dropdownItem}
                        onPress={() => { setSelectedProjectId(project.id); setIsDropdownVisible(false); }}
                      >
                        <Text style={[styles.dropdownItemText, selectedProjectId === project.id && styles.dropdownItemTextSelected]}>
                          {project.name}
                        </Text>
                        {selectedProjectId === project.id && <Check color="#111" size={18} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Pressable>
            </Modal>
          </View>
        )}

        <View style={styles.tagsContainer}>
          <Tag color="#888" size={20} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.inputTags}
            placeholder="Tags (comma separated)..."
            value={tags}
            onChangeText={setTags}
          />
        </View>

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
      </ScrollView>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    zIndex: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#111',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownList: {
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#444',
  },
  dropdownItemTextSelected: {
    color: '#111',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  inputTags: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
  },
  inputContent: {
    flex: 1,
    minHeight: 200,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 48,
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
