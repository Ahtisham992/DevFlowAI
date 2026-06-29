import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction 
}: {
  icon?: any;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      {Icon && <Icon size={56} color="#ccc" style={styles.icon} />}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
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
    marginBottom: 24 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#111', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  message: { 
    fontSize: 15, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 24, 
    lineHeight: 22 
  },
  button: { 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    backgroundColor: '#111', 
    borderRadius: 8 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
});
