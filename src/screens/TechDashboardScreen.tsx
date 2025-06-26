import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import JobListScreen from './JobListScreen';
import JobDetailScreen from './JobDetailScreen';

const TechDashboardScreen: React.FC = () => {
  const { logout } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleJobPress = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
  };

  const handleCreateJob = () => {
    // TODO: Navigate to create job screen
    Alert.alert('Create Job', 'Create job functionality coming soon');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Show Job Detail Screen if a job is selected
  if (selectedJobId) {
    return (
      <JobDetailScreen
        jobId={selectedJobId}
        onBack={handleBackToList}
      />
    );
  }

  // Show Job List Screen by default
  return (
    <View style={styles.container}>
      {/* Menu Button Overlay */}
      <View style={styles.menuOverlay}>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <Text style={styles.menuText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Use the new JobListScreen component */}
      <JobListScreen
        onJobPress={handleJobPress}
        onCreateJobPress={handleCreateJob}
        showCreateButton={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  menuOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  menuText: {
    fontSize: 20,
    color: Colors.tech,
    fontWeight: 'bold',
  },
});

export default TechDashboardScreen;