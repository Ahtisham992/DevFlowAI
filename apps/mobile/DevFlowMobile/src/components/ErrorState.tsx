import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

export default function ErrorState({ 
  message = 'An error occurred. Please try again.', 
  onRetry 
}: { 
  message?: string, 
  onRetry?: () => void 
}) {
  return (
    <View style={styles.container}>
      <AlertCircle size={48} color="#ff4444" style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32 
  },
  icon: { 
    marginBottom: 16 
  },
  message: { 
    fontSize: 16, 
    color: '#111', 
    marginBottom: 24, 
    textAlign: 'center',
    fontWeight: '500'
  },
  button: { 
    paddingVertical: 12, 
    paddingHorizontal: 32, 
    backgroundColor: '#111', 
    borderRadius: 8 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
});
