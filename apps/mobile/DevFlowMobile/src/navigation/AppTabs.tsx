import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WorkspacesScreen from '../screens/app/WorkspacesScreen';
// import ProjectsScreen from '../screens/app/ProjectsScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
      }}
    >
      <Tab.Screen 
        name="Workspaces" 
        component={WorkspacesScreen} 
      />
      {/* 
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen} 
      /> 
      */}
    </Tab.Navigator>
  );
}
