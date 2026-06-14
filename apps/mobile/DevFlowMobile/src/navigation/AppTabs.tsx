import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WorkspacesStack from './WorkspacesStack';
import { Briefcase } from 'lucide-react-native';

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
        component={WorkspacesStack} 
        options={{
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
