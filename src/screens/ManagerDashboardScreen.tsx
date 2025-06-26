import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import JobListScreen from './JobListScreen';
import JobDetailScreen from './JobDetailScreen';
import CreateJobScreen from './CreateJobScreen';

const ManagerDashboardScreen: React.FC = () => {
  const { logout } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'create' | 'manage' | 'reports' | 'settings'>('jobs');

  const handleJobPress = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
  };

  const handleCreateJob = () => {
    setActiveTab('create');
  };

  const handleJobCreated = () => {
    setActiveTab('jobs'); // Return to jobs list after creation
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <JobListScreen
            onJobPress={handleJobPress}
            onCreateJobPress={handleCreateJob}
            showCreateButton={false}
            hideHeader={true}
          />
        );
      case 'create':
        return (
          <CreateJobScreen onJobCreated={handleJobCreated} />
        );
      case 'manage':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Manage Technicians</Text>
            <Text style={styles.comingSoon}>Technician management coming soon</Text>
          </View>
        );
      case 'reports':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Reports</Text>
            <Text style={styles.comingSoon}>Report generation coming soon</Text>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Settings</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
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

  // Show Manager Dashboard with Bottom Tabs
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.boss} />
      
      {/* Header - only show for Jobs tab */}
      {activeTab === 'jobs' && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manager Dashboard</Text>
          <Text style={styles.headerSubtitle}>Monitor job progress and team activity</Text>
        </View>
      )}

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
          onPress={() => setActiveTab('jobs')}
        >
          <Text style={[styles.tabIcon, activeTab === 'jobs' && styles.activeTabText]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabIcon, activeTab === 'create' && styles.activeTabText]}>➕</Text>
          <Text style={[styles.tabLabel, activeTab === 'create' && styles.activeTabText]}>Create</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabIcon, activeTab === 'manage' && styles.activeTabText]}>👥</Text>
          <Text style={[styles.tabLabel, activeTab === 'manage' && styles.activeTabText]}>Manage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabIcon, activeTab === 'reports' && styles.activeTabText]}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'reports' && styles.activeTabText]}>Reports</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabIcon, activeTab === 'settings' && styles.activeTabText]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.boss,
    paddingTop: 50,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: Colors.boss,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 40,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(31, 41, 55, 0.1)',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: Colors.textSecondary,
  },
  tabLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.boss,
    fontWeight: 'bold',
  },
});

export default ManagerDashboardScreen;