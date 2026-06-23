import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/app/DashboardScreen';
import WorkspacesStack from './WorkspacesStack';
import NotesStack from './NotesStack';
import AiChatStack from './AiChatStack';
import ProfileScreen from '../screens/app/ProfileScreen';
import { Home, Briefcase, FileText, Bot, User } from 'lucide-react-native';
import { useSocket } from '../hooks/useSocket';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  // Initialize websocket for notifications when authenticated
  useSocket();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="WorkspacesTab" 
        component={WorkspacesStack} 
        options={{
          title: 'Workspaces',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="NotesTab" 
        component={NotesStack} 
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="AI Chat" 
        component={AiChatStack} 
        options={{
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
