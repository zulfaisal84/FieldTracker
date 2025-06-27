import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import { Job, JobStatus } from '../types';

// Component to render assigned technicians
const AssignedTechsRow: React.FC<{ job: Job }> = ({ job }) => {
  const { users } = useApp();
  
  return (
    <View style={styles.detailRowNoIcon}>
      <View style={styles.techNamesContainer}>
        {job.assignedTechs.map((techId, index) => {
          const tech = Object.values(users).find(u => u.id === techId);
          return (
            <Text key={techId} style={styles.techName}>
              👷 {tech?.realName || tech?.username || 'Unknown'}{' '}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

interface JobListScreenProps {
  onJobPress: (jobId: string) => void;
  onCreateJobPress?: () => void;
  showCreateButton?: boolean;
  hideHeader?: boolean;
}

const JobListScreen: React.FC<JobListScreenProps> = ({ 
  onJobPress, 
  onCreateJobPress,
  showCreateButton = false,
  hideHeader = false
}) => {
  const { currentUser, getJobsForUser, getAllJobs } = useApp();

  // Get jobs based on user role
  const jobs = currentUser?.role === 'boss' 
    ? getAllJobs() 
    : getJobsForUser(currentUser?.id || '');

  // Filter out approved jobs for techs (boss sees all)
  const filteredJobs = currentUser?.role === 'boss' 
    ? jobs 
    : jobs.filter(job => job.status !== 'Approved');

  const getStatusIcon = (status: JobStatus): string => {
    switch (status) {
      case 'Created': return '📋';
      case 'In Progress': return '🔧';
      case 'Completed': return '✅';
      case 'Submitted': return '📤';
      case 'Approved': return '🎉';
      case 'Rejected': return '❌';
      default: return '📋';
    }
  };

  const getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case 'Created': return Colors.textSecondary;
      case 'In Progress': return '#F59E0B';
      case 'Completed': return Colors.tech;
      case 'Submitted': return '#3B82F6';
      case 'Approved': return '#10B981';
      case 'Rejected': return Colors.tech;
      default: return Colors.textSecondary;
    }
  };

  const renderJobCard = (job: Job) => (
    <TouchableOpacity
      key={job.id}
      style={styles.jobCard}
      onPress={() => onJobPress(job.id)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusIcon}>{getStatusIcon(job.status)}</Text>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>

      <View style={styles.jobDetails}>
        {/* Date and Location side by side */}
        <View style={styles.detailRowSideBySide}>
          <View style={styles.detailHalfDate}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>
              {new Date(job.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailHalf}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailTextTruncated} numberOfLines={1} ellipsizeMode="tail">
              {job.siteLocation}
            </Text>
          </View>
        </View>
        
        {/* Assigned Technicians with names */}
        {currentUser?.role === 'boss' && job.assignedTechs.length > 0 && (
          <AssignedTechsRow job={job} />
        )}
      </View>

      {job.status === 'Rejected' && job.rejectionReason && (
        <View style={styles.rejectionNotice}>
          <Text style={styles.rejectionText}>
            Rejection reason: {job.rejectionReason}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {currentUser?.role === 'boss' ? 'No Jobs Created Yet' : 'No Jobs Assigned'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {currentUser?.role === 'boss' 
          ? 'Create your first job to get started'
          : 'Your assigned jobs will appear here'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={currentUser?.role === 'boss' ? Colors.boss : Colors.tech} />
      
      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <View style={[
          styles.header, 
          { backgroundColor: currentUser?.role === 'boss' ? Colors.boss : Colors.tech }
        ]}>
          <Text style={styles.headerTitle}>
            {currentUser?.role === 'boss' ? '👔 All Jobs' : '👷 My Jobs'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentUser?.role === 'boss' 
              ? 'Monitor job progress and team activity'
              : 'Track your assigned work'
            }
          </Text>
        </View>
      )}

      {/* Create Job Button - Only for techs or when explicitly shown */}
      {(showCreateButton || currentUser?.role === 'tech') && onCreateJobPress && (
        <View style={styles.createButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.createButton,
              { backgroundColor: currentUser?.role === 'boss' ? Colors.boss : Colors.tech }
            ]}
            onPress={onCreateJobPress}
          >
            <Text style={styles.createButtonText}>✚ Create New Job</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Job List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredJobs.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.jobList}>
            {filteredJobs.map(renderJobCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  createButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  jobList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  jobDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailRowNoIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 0,
  },
  detailRowSideBySide: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailHalfDate: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  techNamesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailTextTruncated: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  rejectionNotice: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.tech,
  },
  rejectionText: {
    fontSize: 14,
    color: '#DC2626',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default JobListScreen;