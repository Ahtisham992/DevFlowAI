import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkspacesScreen from '../screens/app/WorkspacesScreen';
import WorkspaceFormScreen from '../screens/app/WorkspaceFormScreen';
import ProjectsListScreen from '../screens/app/ProjectsListScreen';
import ProjectDetailScreen from '../screens/app/ProjectDetailScreen';
import ProjectFormScreen from '../screens/app/ProjectFormScreen';
import NotesListScreen from '../screens/app/NotesListScreen';
import NoteDetailScreen from '../screens/app/NoteDetailScreen';
import NoteFormScreen from '../screens/app/NoteFormScreen';
import ChatScreen from '../screens/app/ChatScreen';

const Stack = createNativeStackNavigator();

export default function WorkspacesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkspacesList" component={WorkspacesScreen} />
      <Stack.Screen name="WorkspaceForm" component={WorkspaceFormScreen} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
      <Stack.Screen name="NotesList" component={NotesListScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="NoteForm" component={NoteFormScreen} />
      <Stack.Screen name="ProjectChat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
