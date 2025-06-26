import React from 'react';
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

const ManagerDashboardScreen: React.FC = () => {
  const { logout } = useApp();

  const handleJobPress = (jobId: string) => {
    // TODO: Navigate to job details
    Alert.alert('Job Details', `Opening job ${jobId} for review`);
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

  return (
    <View style={styles.container}>
      {/* Menu Button Overlay */}
      <View style={styles.menuOverlay}>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <Text style={styles.menuText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Use the same JobListScreen component */}
      <JobListScreen
        onJobPress={handleJobPress}
        onCreateJobPress={handleCreateJob}
        showCreateButton={false} // Managers don't need create button in job list
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
    color: Colors.boss,
    fontWeight: 'bold',
  },
});

export default ManagerDashboardScreen;