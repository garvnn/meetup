import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function FilesTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Files</Text>
      <View style={styles.fileList}>
        <Text style={styles.emptyText}>No files shared yet</Text>
      </View>
      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>Upload File</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  fileList: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
