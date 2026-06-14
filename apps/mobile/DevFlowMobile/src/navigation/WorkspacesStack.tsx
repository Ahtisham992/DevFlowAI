import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkspacesScreen from '../screens/app/WorkspacesScreen';
import ProjectsListScreen from '../screens/app/ProjectsListScreen';
import ProjectDetailScreen from '../screens/app/ProjectDetailScreen';

const Stack = createNativeStackNavigator();

export default function WorkspacesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkspacesList" component={WorkspacesScreen} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}
