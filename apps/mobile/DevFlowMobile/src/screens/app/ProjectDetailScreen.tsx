import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useProject, useDeleteProject } from '../../hooks/useProjects';
import { ArrowLeft, GitBranch, Terminal, Pencil, Trash2, FileText, Bot } from 'lucide-react-native';

export default function ProjectDetailScreen({ route, navigation }: any) {
  const { projectId, workspaceId } = route.params;
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const deleteMutation = useDeleteProject();

  const handleDelete = () => {
    Alert.alert('Delete Project', `Are you sure you want to delete "${project?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          deleteMutation.mutate(projectId, {
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

  if (isError || !project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#111" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load project details.</Text>
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
          <Text style={styles.title}>{project.name}</Text>
          <Text style={styles.subtitle}>{project.framework}</Text>
        </View>
        <TouchableOpacity 
          style={styles.actionIconButton} 
          onPress={() => navigation.navigate('ProjectForm', { workspaceId: project.workspaceId, projectToEdit: project })}
        >
          <Pencil color="#666" size={20} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionIconButton} 
          onPress={handleDelete}
        >
          <Trash2 color="#ff4444" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{project.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Terminal color="#555" size={20} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Framework</Text>
              <Text style={styles.detailValue}>{project.framework}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <GitBranch color="#555" size={20} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Repository</Text>
              <Text style={styles.detailValue}>{project.githubUrl || 'Not connected'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Tools</Text>
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => navigation.navigate('NotesList', { projectId: project.id, workspaceName: project.name })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#e6f7ff' }]}>
              <FileText color="#0099ff" size={20} />
            </View>
            <View>
              <Text style={styles.detailValue}>Project Notes</Text>
              <Text style={styles.detailLabel}>View and add notes for this project</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => navigation.navigate('ProjectChat', { projectId: project.id, title: `Chat: ${project.name}` })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#f0e6ff' }]}>
              <Bot color="#9900ff" size={20} />
            </View>
            <View>
              <Text style={styles.detailValue}>AI Assistant</Text>
              <Text style={styles.detailLabel}>Chat with AI context of this project</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  actionIconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
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
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
});
