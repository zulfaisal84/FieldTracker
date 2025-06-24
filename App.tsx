/**
 * Field Tracker - Mobile App for Technician Work Management
 * Demo Version with Cross-Simulator Sync
 */

import React from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { Colors } from './src/styles/colors';

function App() {
  return (
    <AppProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Temporary Demo Screen */}
        <View style={styles.centerContent}>
          <Text style={styles.title}>🚀 Field Tracker</Text>
          <Text style={styles.subtitle}>Demo Ready - Context Setup Complete!</Text>
          <Text style={styles.info}>Cross-simulator sync is now active</Text>
        </View>
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default App;
