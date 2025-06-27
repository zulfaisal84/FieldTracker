import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import { JobStatus } from '../types';
import TaskWorkModal, { TaskWorkData } from '../components/TaskWorkModal';

interface JobDetailScreenProps {
  jobId: string;
  onBack: () => void;
}

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ jobId, onBack }) => {
  const { currentUser, jobs, startJob, completeJob, submitJob, cancelJob, addPendingTask } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  
  const job = jobs[jobId];

  if (!job) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.tech} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Not Found</Text>
        </View>
      </View>
    );
  }

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

  const getActionButton = () => {
    // Managers cannot start jobs - only assigned techs can
    const isAssignedTech = job.assignedTechs.includes(currentUser?.id || '');
    const isManager = currentUser?.role === 'boss';

    switch (job.status) {
      case 'Created':
        if (isManager) {
          return null; // Managers cannot start jobs
        }
        if (!isAssignedTech) {
          return null; // Only assigned techs can start
        }
        return {
          text: '🚀 Start Work',
          color: Colors.tech,
          onPress: () => {
            startJob(jobId);
            Alert.alert('Success', 'Job started! You can now add tasks and track progress.');
          }
        };
      case 'In Progress':
        if (isManager) {
          return null; // Managers don't need action button, Job Details page shows all progress
        }
        if (!isAssignedTech) {
          return null;
        }
        return {
          text: '✅ Complete Job',
          color: Colors.tech,
          onPress: () => {
            // Validate all tasks before allowing completion
            if (completeJob(jobId)) {
              Alert.alert('Success', 'Job completed! You can now submit it for approval.');
            }
          }
        };
      case 'Completed':
        if (isManager) {
          return {
            text: '⏳ Awaiting Submission',
            color: '#6B7280',
            onPress: () => Alert.alert('Waiting', 'Technician will submit when ready')
          };
        }
        if (!isAssignedTech) {
          return null;
        }
        return {
          text: '📤 Submit Job',
          color: Colors.tech,
          onPress: () => {
            submitJob(jobId);
          }
        };
      case 'Submitted':
        if (isManager) {
          return {
            text: '🔍 Review & Approve',
            color: '#3B82F6',
            onPress: () => Alert.alert('Review Job', 'Approval system coming soon')
          };
        }
        return {
          text: '👁️ View Submission',
          color: '#3B82F6',
          onPress: () => Alert.alert('Submitted', 'Job is awaiting manager approval')
        };
      case 'Rejected':
        if (isManager) {
          return {
            text: '👁️ Awaiting Fix',
            color: '#6B7280',
            onPress: () => Alert.alert('Awaiting', 'Technician will fix and resubmit')
          };
        }
        if (!isAssignedTech) {
          return null;
        }
        return {
          text: '🔄 Fix & Resubmit',
          color: Colors.tech,
          onPress: () => Alert.alert('Fix Job', 'Task editing coming soon')
        };
      default:
        return null;
    }
  };

  const actionButton = getActionButton();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.tech} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Info Card */}
        <View style={styles.card}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
              <Text style={styles.statusIcon}>{getStatusIcon(job.status)}</Text>
              <Text style={styles.statusText}>{job.status}</Text>
            </View>
          </View>

          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Site Location:</Text>
              <Text style={styles.detailValue}>{job.siteLocation}</Text>
            </View>
            
            {/* Created and Submitted side by side */}
            <View style={styles.dateRowContainer}>
              <View style={styles.dateColumn}>
                <Text style={styles.detailLabel}>📅 Created:</Text>
                <Text style={styles.detailValue}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {job.submittedAt && (
                <View style={styles.dateColumn}>
                  <Text style={styles.detailLabel}>📤 Submitted:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(job.submittedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Started and Completed side by side */}
            {(job.startedAt || job.completedAt) && (
              <View style={styles.dateRowContainer}>
                {job.startedAt && (
                  <View style={styles.dateColumn}>
                    <Text style={styles.detailLabel}>🚀 Started:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(job.startedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {job.completedAt && (
                  <View style={styles.dateColumn}>
                    <Text style={styles.detailLabel}>✅ Completed:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(job.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>📝 Description</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>
        </View>

        {/* Rejection Notice */}
        {job.status === 'Rejected' && job.rejectionReason && (
          <View style={styles.card}>
            <View style={styles.rejectionHeader}>
              <Text style={styles.rejectionTitle}>❌ Rejection Feedback</Text>
            </View>
            <Text style={styles.rejectionText}>{job.rejectionReason}</Text>
          </View>
        )}

        {/* Tasks Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📋 Tasks</Text>
          
          {job.tasks && job.tasks.length > 0 ? (
            job.tasks.map((task, index) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>✅ {task.description}</Text>
                </View>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskDate}>📅 {task.date}</Text>
                  <Text style={styles.taskTime}>🕐 {task.startTime} - {task.endTime}</Text>
                </View>
                
                {/* Photo Thumbnails */}
                <View style={styles.photoSection}>
                  <Text style={styles.photoSectionTitle}>📸 Photos</Text>
                  <View style={styles.photoGrid}>
                    <View style={styles.photoThumbnail}>
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoEmoji}>📷</Text>
                      </View>
                      <Text style={styles.photoLabel}>Before</Text>
                    </View>
                    <View style={styles.photoThumbnail}>
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoEmoji}>📷</Text>
                      </View>
                      <Text style={styles.photoLabel}>During</Text>
                    </View>
                    <View style={styles.photoThumbnail}>
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoEmoji}>📷</Text>
                      </View>
                      <Text style={styles.photoLabel}>After</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>No tasks completed yet</Text>
              {currentUser?.role !== 'boss' && (
                <Text style={styles.emptyTasksSubtext}>
                  Start working to add your first task
                </Text>
              )}
            </View>
          )}

          {/* Pending Tasks */}
          {job.pendingTasks && job.pendingTasks.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.pendingSectionTitle}>⏳ Pending Tasks</Text>
              {job.pendingTasks.map((task, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.pendingTaskButton}
                  onPress={() => {
                    setSelectedTask(task);
                    setShowTaskModal(true);
                  }}
                >
                  <View style={styles.pendingTaskContent}>
                    <Text style={styles.pendingTaskText}>📝 {task}</Text>
                    <Text style={styles.pendingTaskStatus}>Tap to work</Text>
                  </View>
                  <Text style={styles.pendingTaskArrow}>▶</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {(actionButton || (currentUser?.role === 'boss' && (job.status === 'Created' || job.status === 'In Progress' || job.status === 'Submitted'))) && (
          <View style={styles.actionSection}>
            {/* Add Task Button - Only for techs on Created and In Progress jobs */}
            {currentUser?.role !== 'boss' && job.assignedTechs.includes(currentUser?.id || '') && (job.status === 'Created' || job.status === 'In Progress') && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                onPress={() => {
                  Alert.prompt(
                    'Add New Task',
                    'Enter a description for the task you plan to work on:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Add Task',
                        onPress: (taskDescription) => {
                          if (taskDescription && taskDescription.trim()) {
                            addPendingTask(jobId, taskDescription.trim());
                            Alert.alert('Task Added', 'Pending task has been added successfully!');
                          } else {
                            Alert.alert('Invalid Input', 'Please enter a valid task description');
                          }
                        }
                      }
                    ],
                    'plain-text',
                    '',
                    'default'
                  );
                }}
              >
                <Text style={styles.actionButtonText}>📝 Add Task</Text>
              </TouchableOpacity>
            )}
            
            {actionButton && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: actionButton.color }]}
                onPress={actionButton.onPress}
              >
                <Text style={styles.actionButtonText}>{actionButton.text}</Text>
              </TouchableOpacity>
            )}
            
            {/* Cancel Job Button - Only for managers on Created, In Progress and Submitted jobs */}
            {currentUser?.role === 'boss' && (job.status === 'Created' || job.status === 'In Progress' || job.status === 'Submitted') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  Alert.alert(
                    'Cancel Job',
                    'Are you sure you want to cancel this job? This action cannot be undone.',
                    [
                      { text: 'No', style: 'cancel' },
                      { 
                        text: 'Yes, Cancel Job', 
                        style: 'destructive', 
                        onPress: () => {
                          cancelJob(jobId);
                          onBack(); // Go back to job list after cancelling
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.actionButtonText}>🗑️ Cancel Job</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Task Work Modal */}
      <TaskWorkModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        taskDescription={selectedTask}
        onUpdateTask={(taskData: TaskWorkData) => {
          // Handle task update
          Alert.alert('Task Updated', `Task status: ${taskData.status}`);
          setShowTaskModal(false);
        }}
      />
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 8,
  },
  dateRowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  dateColumn: {
    flex: 1,
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  rejectionHeader: {
    marginBottom: 12,
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  rejectionText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  taskItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskHeader: {
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  taskTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  photoSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  photoSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoThumbnail: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoEmoji: {
    fontSize: 24,
    opacity: 0.6,
  },
  photoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyTasks: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTasksText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyTasksSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pendingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pendingSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  pendingTaskButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pendingTaskContent: {
    flex: 1,
  },
  pendingTaskText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  pendingTaskStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  pendingTaskArrow: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});

export default JobDetailScreen;