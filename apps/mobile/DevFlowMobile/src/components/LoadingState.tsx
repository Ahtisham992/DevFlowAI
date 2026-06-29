import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#111" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
