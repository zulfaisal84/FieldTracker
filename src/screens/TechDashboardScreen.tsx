import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';

const TechDashboardScreen: React.FC = () => {
  const { currentUser, getJobsForUser, logout } = useApp();
  const userJobs = getJobsForUser(currentUser?.id || '');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created': return Colors.status.created;
      case 'In Progress': return Colors.status.inProgress;
      case 'Completed': return Colors.status.completed;
      case 'Submitted': return Colors.status.submitted;
      case 'Approved': return Colors.status.approved;
      case 'Rejected': return Colors.status.rejected;
      default: return Colors.textSecondary;
    }
  };

  const getActionButton = (job: any) => {
    switch (job.status) {
      case 'Created':
        return { text: 'Start Work', color: Colors.tech };
      case 'In Progress':
        return { text: 'View Details', color: Colors.status.inProgress };
      case 'Completed':
        return { text: 'Submit Job', color: Colors.tech };
      case 'Submitted':
        return { text: 'View Details', color: Colors.status.submitted };
      case 'Rejected':
        return { text: 'Fix & Resubmit', color: Colors.status.rejected };
      default:
        return { text: 'View Details', color: Colors.textSecondary };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.tech} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>👷 Field Tracker</Text>
            <Text style={styles.subtitle}>Welcome, {currentUser?.realName}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
            <Text style={styles.menuText}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>My Assigned Jobs ({userJobs.length})</Text>
        
        {userJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚧</Text>
            <Text style={styles.emptyTitle}>No Jobs Assigned</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any jobs assigned yet.{'\n'}
              Check back later or contact your manager.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
            {userJobs.map((job) => {
              const actionButton = getActionButton(job);
              return (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <View style={styles.jobInfo}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobSite}>📍 {job.siteLocation}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                      <Text style={styles.statusText}>{job.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.jobDescription} numberOfLines={2}>
                    {job.description}
                  </Text>
                  
                  <View style={styles.jobFooter}>
                    <Text style={styles.jobDate}>
                      Created: {new Date(job.createdAt).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: actionButton.color }]}
                    >
                      <Text style={styles.actionButtonText}>{actionButton.text}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
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
    backgroundColor: Colors.tech,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  jobList: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.tech,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  jobSite: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default TechDashboardScreen;