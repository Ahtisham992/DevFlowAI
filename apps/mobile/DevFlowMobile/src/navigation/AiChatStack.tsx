import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversationsListScreen from '../screens/app/ConversationsListScreen';
import ChatScreen from '../screens/app/ChatScreen';

const Stack = createNativeStackNavigator();

export default function AiChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="ConversationsList" 
        component={ConversationsListScreen} 
        options={{ title: 'AI Assistant' }} 
      />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatScreen} 
        options={({ route }: any) => ({ title: route.params?.title || 'New Chat' })} 
      />
    </Stack.Navigator>
  );
}
