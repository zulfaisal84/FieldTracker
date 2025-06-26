/**
 * Field Tracker - Mobile App for Technician Work Management
 * Demo Version with Cross-Simulator Sync
 */

import React from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Colors } from './src/styles/colors';
import LoginScreen from './src/screens/LoginScreen';
import TechDashboardScreen from './src/screens/TechDashboardScreen';
import ManagerDashboardScreen from './src/screens/ManagerDashboardScreen';

const AppContent = () => {
  const { isLoggedIn, currentUser } = useApp();

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  // Show role-specific dashboard
  if (currentUser?.role === 'tech') {
    return <TechDashboardScreen />;
  }

  if (currentUser?.role === 'boss') {
    return <ManagerDashboardScreen />;
  }

  // Fallback (shouldn't happen)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      <View style={styles.centerContent}>
        <Text style={styles.title}>
          Welcome, {currentUser?.realName}!
        </Text>
        <Text style={styles.subtitle}>
          Unknown role: {currentUser?.role}
        </Text>
      </View>
    </View>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
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
