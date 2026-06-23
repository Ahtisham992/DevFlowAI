import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotesListScreen from '../screens/app/NotesListScreen';
import NoteDetailScreen from '../screens/app/NoteDetailScreen';
import NoteFormScreen from '../screens/app/NoteFormScreen';

const Stack = createNativeStackNavigator();

export default function NotesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesList" component={NotesListScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="NoteForm" component={NoteFormScreen} />
    </Stack.Navigator>
  );
}
