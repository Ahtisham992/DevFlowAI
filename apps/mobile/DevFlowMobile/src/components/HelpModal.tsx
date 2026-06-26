import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { X, FolderGit2, FileText, Bot } from 'lucide-react-native';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HelpModal({ visible, onClose }: HelpModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>DevFlow AI Guide</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#111" size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.intro}>
              Welcome to DevFlow AI! Here's a quick guide on how to get the most out of your workspace.
            </Text>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FolderGit2 color="#111" size={20} />
                <Text style={styles.sectionTitle}>Workspaces & Projects</Text>
              </View>
              <Text style={styles.text}>• <Text style={styles.bold}>Workspaces</Text> act as folders for your projects. Start by creating a Workspace.</Text>
              <Text style={styles.text}>• Inside a Workspace, you can add <Text style={styles.bold}>Projects</Text>. Give them a name, description, and framework.</Text>
              <Text style={styles.proTip}>Pro tip: Our AI reads your project descriptions to understand the context of your codebase!</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText color="#111" size={20} />
                <Text style={styles.sectionTitle}>Notes</Text>
              </View>
              <Text style={styles.text}>• Keep track of snippets, ideas, and architecture in the Notes section.</Text>
              <Text style={styles.text}>• You can tag notes and link them to specific projects.</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bot color="#111" size={20} />
                <Text style={styles.sectionTitle}>AI Features</Text>
              </View>
              <Text style={styles.text}>• <Text style={styles.bold}>AI Chat</Text>: A conversational assistant powered by Llama 3 that knows about your projects.</Text>
              <Text style={styles.text}>• <Text style={styles.bold}>Code Analysis</Text>: Detect bugs, security flaws, and performance issues. (Web)</Text>
              <Text style={styles.text}>• <Text style={styles.bold}>AI Debugger</Text>: Instant root cause analysis and fixes for your stack traces. (Web)</Text>
              <Text style={styles.text}>• <Text style={styles.bold}>Docs Generator</Text>: Generate beautiful Markdown documentation automatically. (Web)</Text>
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  content: {
    padding: 24,
  },
  intro: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 10,
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#111',
  },
  proTip: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#111',
  },
});
