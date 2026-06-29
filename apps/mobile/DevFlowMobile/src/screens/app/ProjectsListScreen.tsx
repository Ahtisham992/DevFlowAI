import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useProjects, Project } from '../../hooks/useProjects';
import { FolderGit2, ChevronRight, ArrowLeft, Plus } from 'lucide-react-native';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';

export default function ProjectsListScreen({ route, navigation }: any) {
  const { workspaceId, workspaceName } = route.params;
  const { data: projects, isLoading, isError, refetch } = useProjects(workspaceId);

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id, projectName: item.name })}
    >
      <View style={styles.cardIcon}>
        <FolderGit2 color="#111" size={24} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.framework}</Text>
      </View>
      <ChevronRight color="#ccc" size={24} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#111" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{workspaceName}</Text>
          <Text style={styles.subtitle}>Projects</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        {isLoading ? (
          <LoadingState message="Loading projects..." />
        ) : isError ? (
          <ErrorState message="Failed to load projects." onRetry={refetch} />
        ) : projects?.length === 0 ? (
          <EmptyState 
            icon={FolderGit2} 
            title="No projects yet" 
            message="Add a project from the web app." 
          />
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshing={isLoading}
            onRefresh={refetch}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ProjectForm', { workspaceId })}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
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
  },
  listContainer: {
    flex: 1,
  },
  list: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    textTransform: 'capitalize',
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  emptySubtitle: {
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
