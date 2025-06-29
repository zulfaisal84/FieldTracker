import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import { JobStatus, TaskPhoto } from '../types';
import TaskWorkModal, { TaskWorkData } from '../components/TaskWorkModal';

interface JobDetailScreenProps {
  jobId: string;
  onBack: () => void;
}

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ jobId, onBack }) => {
  const { currentUser, users, jobs, startJob, validateJobCompletion, completeJob, submitJob, cancelJob, addPendingTask, updateTaskStatus, updateTask, cancelTask } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<TaskPhoto | null>(null);
  const [allPhotos, setAllPhotos] = useState<TaskPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingDescription, setEditingDescription] = useState('');
  const [isReadyForSubmission, setIsReadyForSubmission] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  const job = jobs[jobId];

  // Reset ready for submission state when tasks change
  useEffect(() => {
    if (job && job.status === 'In Progress') {
      const validation = validateJobCompletion(jobId);
      setIsReadyForSubmission(validation.isValid);
    } else {
      setIsReadyForSubmission(false);
    }
  }, [job?.tasks, jobId, validateJobCompletion]);

  // Helper function to format relative time
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    const newExpandedTasks = new Set(expandedTasks);
    if (newExpandedTasks.has(taskId)) {
      newExpandedTasks.delete(taskId);
    } else {
      newExpandedTasks.add(taskId);
    }
    setExpandedTasks(newExpandedTasks);
  };

  // Render task activity section
  const renderTaskActivity = (task: any, isExpanded: boolean) => {
    if (!task.activity) return null;

    const { startedBy, startedAt, lastEditedBy, lastEditedAt, lastSavedBy, lastSavedAt, completedBy, completedAt } = task.activity;
    
    // Collect activity items
    const activities = [];
    if (startedBy && startedAt) {
      const user = users[startedBy];
      activities.push({ action: 'started', user: user?.realName || 'Unknown', time: startedAt });
    }
    if (lastEditedBy && lastEditedAt) {
      const user = users[lastEditedBy];
      activities.push({ action: 'edited', user: user?.realName || 'Unknown', time: lastEditedAt });
    }
    if (lastSavedBy && lastSavedAt) {
      const user = users[lastSavedBy];
      activities.push({ action: 'saved', user: user?.realName || 'Unknown', time: lastSavedAt });
    }
    if (completedBy && completedAt) {
      const user = users[completedBy];
      activities.push({ action: 'completed', user: user?.realName || 'Unknown', time: completedAt });
    }

    if (activities.length === 0) return null;

    if (isExpanded) {
      // Expanded view - show all activities
      return (
        <View style={styles.taskActivitySection}>
          <Text style={styles.taskActivityTitle}>👤 Task Activity:</Text>
          {activities.map((activity, index) => (
            <Text key={index} style={styles.taskActivityDetail}>
              • {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} by: 👷 {activity.user} ({getRelativeTime(activity.time)})
            </Text>
          ))}
        </View>
      );
    } else {
      // Compact view - show most recent 2 activities
      const recentActivities = activities.slice(-2);
      const activityText = recentActivities.map(activity => 
        `👷 ${activity.user} ${activity.action} (${getRelativeTime(activity.time)})`
      ).join(' • ');

      return (
        <View style={styles.taskActivitySection}>
          <Text style={styles.taskActivityCompact}>
            👤 Activity: {activityText}
          </Text>
        </View>
      );
    }
  };

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
          text: isReadyForSubmission ? '📤 Submit Job' : '✅ Complete Job',
          color: Colors.tech,
          onPress: () => {
            if (isReadyForSubmission) {
              // Submit the job
              if (completeJob(jobId)) {
                submitJob(jobId);
              }
            } else {
              // Validate all tasks
              const validation = validateJobCompletion(jobId);
              if (validation.isValid) {
                setIsReadyForSubmission(true);
                Alert.alert('Ready for Submission', 'All tasks completed successfully! Tap Submit Job to send for approval.');
              } else {
                Alert.alert('Cannot Complete Job', validation.message);
              }
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

  // Photo modal functions
  const openPhotoModal = (photo: TaskPhoto, allTaskPhotos: TaskPhoto[]) => {
    const photoIndex = allTaskPhotos.findIndex(p => p.id === photo.id);
    setSelectedPhoto(photo);
    setAllPhotos(allTaskPhotos);
    setCurrentPhotoIndex(photoIndex);
    setIsEditingDescription(false);
    setEditingDescription('');
    setShowPhotoModal(true);
  };

  const startEditingDescription = () => {
    if (selectedPhoto) {
      setEditingDescription(selectedPhoto.description);
      setIsEditingDescription(true);
    }
  };

  const saveDescriptionEdit = () => {
    if (selectedPhoto && editingDescription.trim()) {
      // Find the task that contains this photo
      const taskWithPhoto = job.tasks.find(task => 
        task.photos?.some(photo => photo.id === selectedPhoto.id)
      );
      
      if (taskWithPhoto) {
        // Update the photo description in the task
        const updatedPhotos = taskWithPhoto.photos.map(photo => 
          photo.id === selectedPhoto.id 
            ? { ...photo, description: editingDescription.trim() }
            : photo
        );
        
        // Update the task with new photos
        updateTask(jobId, taskWithPhoto.id, { photos: updatedPhotos });
        
        // Update local state
        const updatedPhoto = { ...selectedPhoto, description: editingDescription.trim() };
        setSelectedPhoto(updatedPhoto);
        
        const updatedAllPhotos = allPhotos.map(photo => 
          photo.id === selectedPhoto.id ? updatedPhoto : photo
        );
        setAllPhotos(updatedAllPhotos);
        
        Alert.alert('Success', 'Photo description updated!');
      }
    }
    setIsEditingDescription(false);
  };

  const cancelDescriptionEdit = () => {
    setIsEditingDescription(false);
    setEditingDescription('');
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentPhotoIndex - 1 + allPhotos.length) % allPhotos.length
      : (currentPhotoIndex + 1) % allPhotos.length;
    
    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(allPhotos[newIndex]);
  };

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
            
            {/* Assigned Technicians */}
            <View style={[styles.detailRow, { marginBottom: 24 }]}>
              <Text style={styles.detailLabel}>👥 Assigned Techs:</Text>
              <Text style={styles.detailValue}>
                {job.assignedTechs.map((techId, index) => {
                  const tech = users[techId];
                  return tech ? `👷 ${tech.realName}${index < job.assignedTechs.length - 1 ? ' ' : ''}` : '';
                }).join('')}
              </Text>
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
          
          {job.tasks && job.tasks.filter(task => task.status === 'completed').length > 0 ? (
            <View style={styles.pendingSection}>
              <Text style={styles.pendingSectionTitle}>✅ Completed Tasks</Text>
              {job.tasks.filter(task => task.status === 'completed').map((task, index) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <TouchableOpacity 
                    style={styles.taskMainContent}
                    onPress={() => {
                      setSelectedTaskId(task.id);
                      setShowTaskModal(true);
                    }}
                  >
                    <Text style={styles.taskTitle}>✅ {task.description}</Text>
                    <Text style={styles.editHint}>Tap to edit</Text>
                  </TouchableOpacity>
                  
                  {/* Only show expand button if task has photos */}
                  {task.photos && task.photos.length > 0 && (
                    <TouchableOpacity 
                      style={styles.expandButton}
                      onPress={() => toggleTaskExpansion(task.id)}
                    >
                      <Text style={styles.expandButtonText}>
                        {expandedTasks.has(task.id) ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Task Activity */}
                {renderTaskActivity(task, expandedTasks.has(task.id))}
                
                {/* Work Sessions */}
                {task.sessions && task.sessions.length > 0 && (
                  <View style={styles.taskSessionsSection}>
                    <Text style={styles.taskSessionsTitle}>📋 Work Sessions ({task.sessions.length} total)</Text>
                    {task.sessions.map((session, sessionIndex) => (
                      <View key={session.id} style={styles.taskSessionItem}>
                        <Text style={styles.taskSessionText}>
                          Session {sessionIndex + 1}: {session.startDate === session.endDate 
                            ? `${session.startDate} ${session.startTime} - ${session.endTime || '[Active]'}`
                            : `${session.startDate} ${session.startTime} - ${session.endDate} ${session.endTime || '[Active]'}`
                          }
                        </Text>
                        <Text style={styles.taskSessionStatus}>
                          {session.isActive ? '🔄' : '✅'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Photo count indicator when collapsed */}
                {!expandedTasks.has(task.id) && task.photos && task.photos.length > 0 && (
                  <View style={styles.photoCountSection}>
                    <Text style={styles.photoCountText}>
                      📸 {task.photos.length} photo(s) • Tap ▶ to view thumbnails
                    </Text>
                  </View>
                )}
                
                {/* Photos by Category - Only show when expanded */}
                {expandedTasks.has(task.id) && task.photos && task.photos.length > 0 && (
                  <View style={styles.photoSection}>
                    <Text style={styles.photoSectionTitle}>📸 Work Photos ({task.photos.length} total)</Text>
                    
                    {/* Before Photos */}
                    {task.photos.filter(p => p.category === 'before').length > 0 && (
                      <View style={styles.photoCategorySection}>
                        <Text style={styles.photoCategoryTitle}>Before ({task.photos.filter(p => p.category === 'before').length})</Text>
                        <View style={styles.photoGrid}>
                          {task.photos.filter(p => p.category === 'before').map((photo) => (
                            <TouchableOpacity 
                              key={photo.id} 
                              style={styles.photoThumbnail}
                              onPress={() => openPhotoModal(photo, task.photos)}
                            >
                              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                              <Text style={styles.photoLabel} numberOfLines={2}>
                                {photo.description}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {/* During Photos */}
                    {task.photos.filter(p => p.category === 'during').length > 0 && (
                      <View style={styles.photoCategorySection}>
                        <Text style={styles.photoCategoryTitle}>During ({task.photos.filter(p => p.category === 'during').length})</Text>
                        <View style={styles.photoGrid}>
                          {task.photos.filter(p => p.category === 'during').map((photo) => (
                            <TouchableOpacity 
                              key={photo.id} 
                              style={styles.photoThumbnail}
                              onPress={() => openPhotoModal(photo, task.photos)}
                            >
                              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                              <Text style={styles.photoLabel} numberOfLines={2}>
                                {photo.description}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {/* After Photos */}
                    {task.photos.filter(p => p.category === 'after').length > 0 && (
                      <View style={styles.photoCategorySection}>
                        <Text style={styles.photoCategoryTitle}>After ({task.photos.filter(p => p.category === 'after').length})</Text>
                        <View style={styles.photoGrid}>
                          {task.photos.filter(p => p.category === 'after').map((photo) => (
                            <TouchableOpacity 
                              key={photo.id} 
                              style={styles.photoThumbnail}
                              onPress={() => openPhotoModal(photo, task.photos)}
                            >
                              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                              <Text style={styles.photoLabel} numberOfLines={2}>
                                {photo.description}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Task Remarks at Bottom */}
                {task.remarks && task.remarks.trim() !== '' && (
                  <View style={styles.taskCardRemarksSection}>
                    <Text style={styles.taskCardRemarksLabel}>📄 Remarks:</Text>
                    <Text style={styles.taskCardRemarksText}>{task.remarks}</Text>
                  </View>
                )}
                
              </View>
              ))}
            </View>
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

          {/* In Progress Tasks */}
          {job.tasks && job.tasks.filter(task => task.status === 'in_progress').length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.pendingSectionTitle}>🔄 In Progress Tasks</Text>
              {job.tasks.filter(task => task.status === 'in_progress').map((task, index) => (
                <View key={task.id} style={[styles.taskItem, styles.inProgressTaskButton]}>
                  <View style={styles.taskHeader}>
                    <TouchableOpacity 
                      style={styles.taskMainContent}
                      onPress={() => {
                        setSelectedTaskId(task.id);
                        setShowTaskModal(true);
                      }}
                    >
                      <Text style={styles.taskTitle}>🔧 {task.description}</Text>
                      <Text style={styles.editHint}>Working - Tap to complete</Text>
                    </TouchableOpacity>
                    
                    {/* Only show expand button if task has photos */}
                    {task.photos && task.photos.length > 0 && (
                      <TouchableOpacity 
                        style={styles.expandButton}
                        onPress={() => toggleTaskExpansion(task.id)}
                      >
                        <Text style={styles.expandButtonText}>
                          {expandedTasks.has(task.id) ? '▼' : '▶'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Task Activity */}
                  {renderTaskActivity(task, expandedTasks.has(task.id))}
                  
                  {/* Work Sessions */}
                  {task.sessions && task.sessions.length > 0 && (
                    <View style={styles.taskSessionsSection}>
                      <Text style={styles.taskSessionsTitle}>📋 Work Sessions ({task.sessions.length} total)</Text>
                      {task.sessions.map((session, sessionIndex) => (
                        <View key={session.id} style={styles.taskSessionItem}>
                          <Text style={styles.taskSessionText}>
                            Session {sessionIndex + 1}: {session.startDate === session.endDate 
                              ? `${session.startDate} ${session.startTime} - ${session.endTime || '[Active]'}`
                              : `${session.startDate} ${session.startTime} - ${session.endDate} ${session.endTime || '[Active]'}`
                            }
                          </Text>
                          <Text style={styles.taskSessionStatus}>
                            {session.isActive ? '🔄' : '✅'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {/* Photo count indicator when collapsed */}
                  {!expandedTasks.has(task.id) && task.photos && task.photos.length > 0 && (
                    <View style={styles.photoCountSection}>
                      <Text style={styles.photoCountText}>
                        📸 {task.photos.length} photo(s) • Tap ▶ to view thumbnails
                      </Text>
                    </View>
                  )}
                  
                  {/* Photos by Category - Only show when expanded */}
                  {expandedTasks.has(task.id) && task.photos && task.photos.length > 0 && (
                    <View style={styles.photoSection}>
                      <Text style={styles.photoSectionTitle}>📸 Work Photos ({task.photos.length} total)</Text>
                      
                      {/* Before Photos */}
                      {task.photos.filter(p => p.category === 'before').length > 0 && (
                        <View style={styles.photoCategorySection}>
                          <Text style={styles.photoCategoryTitle}>Before ({task.photos.filter(p => p.category === 'before').length})</Text>
                          <View style={styles.photoGrid}>
                            {task.photos.filter(p => p.category === 'before').map((photo) => (
                              <TouchableOpacity 
                                key={photo.id} 
                                style={styles.photoThumbnail}
                                onPress={() => openPhotoModal(photo, task.photos)}
                              >
                                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                                <Text style={styles.photoLabel} numberOfLines={2}>
                                  {photo.description}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                      
                      {/* During Photos */}
                      {task.photos.filter(p => p.category === 'during').length > 0 && (
                        <View style={styles.photoCategorySection}>
                          <Text style={styles.photoCategoryTitle}>During ({task.photos.filter(p => p.category === 'during').length})</Text>
                          <View style={styles.photoGrid}>
                            {task.photos.filter(p => p.category === 'during').map((photo) => (
                              <TouchableOpacity 
                                key={photo.id} 
                                style={styles.photoThumbnail}
                                onPress={() => openPhotoModal(photo, task.photos)}
                              >
                                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                                <Text style={styles.photoLabel} numberOfLines={2}>
                                  {photo.description}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                      
                      {/* After Photos */}
                      {task.photos.filter(p => p.category === 'after').length > 0 && (
                        <View style={styles.photoCategorySection}>
                          <Text style={styles.photoCategoryTitle}>After ({task.photos.filter(p => p.category === 'after').length})</Text>
                          <View style={styles.photoGrid}>
                            {task.photos.filter(p => p.category === 'after').map((photo) => (
                              <TouchableOpacity 
                                key={photo.id} 
                                style={styles.photoThumbnail}
                                onPress={() => openPhotoModal(photo, task.photos)}
                              >
                                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                                <Text style={styles.photoLabel} numberOfLines={2}>
                                  {photo.description}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {/* Task Remarks at Bottom */}
                  {task.remarks && task.remarks.trim() !== '' && (
                    <View style={styles.taskCardRemarksSection}>
                      <Text style={styles.taskCardRemarksLabel}>📄 Remarks:</Text>
                      <Text style={styles.taskCardRemarksText}>{task.remarks}</Text>
                    </View>
                  )}
                  
                </View>
              ))}
            </View>
          )}

          {/* Pending Tasks */}
          {job.tasks && job.tasks.filter(task => task.status === 'pending').length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.pendingSectionTitle}>⏳ Pending Tasks</Text>
              {job.tasks.filter(task => task.status === 'pending').map((task, index) => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.pendingTaskButton}
                  onPress={() => {
                    if (job.status === 'Created') {
                      Alert.alert(
                        'Job Not Started',
                        'Please tap Start Work button first to begin working on tasks.',
                        [{ text: 'OK' }]
                      );
                      return;
                    }
                    setSelectedTaskId(task.id);
                    setShowTaskModal(true);
                  }}
                >
                  <View style={styles.pendingTaskContent}>
                    <Text style={styles.pendingTaskText}>📝 {task.description}</Text>
                    <Text style={styles.pendingTaskStatus}>Tap to work</Text>
                    
                    {/* Task Remarks at Bottom of Pending Card */}
                    {task.remarks && task.remarks.trim() !== '' && (
                      <View style={styles.taskCardRemarksSection}>
                        <Text style={styles.taskCardRemarksLabel}>📄 Remarks:</Text>
                        <Text style={styles.taskCardRemarksText}>{task.remarks}</Text>
                      </View>
                    )}
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
                  setNewTaskDescription('');
                  setShowAddTaskModal(true);
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
        taskDescription={
          selectedTaskId 
            ? job.tasks?.find(task => task.id === selectedTaskId)?.description || '' 
            : ''
        }
        existingTaskData={
          selectedTaskId 
            ? job.tasks?.find(task => task.id === selectedTaskId) 
            : undefined
        }
        jobId={jobId}
        taskId={selectedTaskId}
        onCancelTask={cancelTask}
        onUpdateTask={(taskData: TaskWorkData) => {
          // Update task status in the job using task ID
          updateTaskStatus(jobId, selectedTaskId, taskData);
          setShowTaskModal(false);
        }}
      />

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.addTaskModal}>
              <Text style={styles.addTaskModalTitle}>Add New Task</Text>
              <Text style={styles.addTaskModalSubtitle}>
                Enter a description for the task you plan to work on:
              </Text>
              
              <TextInput
                style={styles.addTaskInput}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                placeholder="Task description..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
                autoFocus
              />
              
              <View style={styles.addTaskModalButtons}>
                <TouchableOpacity
                  style={[styles.addTaskModalButton, styles.addTaskButtonPrimary]}
                  onPress={() => {
                    if (newTaskDescription && newTaskDescription.trim()) {
                      addPendingTask(jobId, newTaskDescription.trim());
                      setShowAddTaskModal(false);
                      setNewTaskDescription('');
                      Alert.alert('Task Added', 'Pending task has been added successfully!');
                    } else {
                      Alert.alert('Invalid Input', 'Please enter a valid task description');
                    }
                  }}
                >
                  <Text style={styles.addTaskButtonText}>Add Task</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.addTaskModalButton, styles.addTaskButtonSecondary]}
                  onPress={() => {
                    setShowAddTaskModal(false);
                    setNewTaskDescription('');
                  }}
                >
                  <Text style={styles.addTaskButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Photo Detail Modal */}
      {showPhotoModal && selectedPhoto && (
        <Modal visible={true} animationType="fade" presentationStyle="fullScreen">
          <View style={styles.photoModalContainer}>
            {/* Header */}
            <View style={styles.photoModalHeader}>
              <TouchableOpacity 
                style={styles.photoModalCloseButton}
                onPress={() => setShowPhotoModal(false)}
              >
                <Text style={styles.photoModalCloseText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.photoModalHeaderInfo}>
                <Text style={styles.photoModalCategory}>
                  {selectedPhoto.category.charAt(0).toUpperCase() + selectedPhoto.category.slice(1)} Photo
                </Text>
                <Text style={styles.photoModalCounter}>
                  {currentPhotoIndex + 1} of {allPhotos.length}
                </Text>
              </View>
              
              <View style={styles.photoModalHeaderSpacer} />
            </View>

            {/* Photo */}
            <View style={styles.photoModalImageContainer}>
              <Image 
                source={{ uri: selectedPhoto.uri }} 
                style={styles.photoModalImage}
                resizeMode="contain"
              />
              
              {/* Navigation Arrows */}
              {allPhotos.length > 1 && (
                <>
                  <TouchableOpacity 
                    style={[styles.photoModalNavButton, styles.photoModalNavLeft]}
                    onPress={() => navigatePhoto('prev')}
                  >
                    <Text style={styles.photoModalNavText}>‹</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.photoModalNavButton, styles.photoModalNavRight]}
                    onPress={() => navigatePhoto('next')}
                  >
                    <Text style={styles.photoModalNavText}>›</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Description */}
            <View style={styles.photoModalDescription}>
              <View style={styles.photoModalDescriptionHeader}>
                <Text style={styles.photoModalDescriptionTitle}>Description</Text>
                {!isEditingDescription && (
                  <TouchableOpacity 
                    style={styles.editDescriptionButton}
                    onPress={startEditingDescription}
                  >
                    <Text style={styles.editDescriptionButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {isEditingDescription ? (
                <View style={styles.descriptionEditContainer}>
                  <TextInput
                    style={styles.descriptionEditInput}
                    value={editingDescription}
                    onChangeText={setEditingDescription}
                    placeholder="Enter photo description..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    autoFocus
                  />
                  <View style={styles.descriptionEditButtons}>
                    <TouchableOpacity 
                      style={[styles.descriptionEditButton, styles.descriptionSaveButton]}
                      onPress={saveDescriptionEdit}
                    >
                      <Text style={styles.descriptionSaveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.descriptionEditButton, styles.descriptionCancelButton]}
                      onPress={cancelDescriptionEdit}
                    >
                      <Text style={styles.descriptionCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={startEditingDescription}>
                  <Text style={styles.photoModalDescriptionText}>
                    {selectedPhoto.description}
                  </Text>
                  <Text style={styles.tapToEditHint}>Tap to edit description</Text>
                </TouchableOpacity>
              )}
              
              {/* Metadata */}
              <View style={styles.photoModalMetadata}>
                <Text style={styles.photoModalMetadataText}>
                  Taken: {new Date(selectedPhoto.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.photoModalMetadataText}>
                  Size: {(selectedPhoto.fileSize / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  editHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
  inProgressTaskButton: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  taskSessionsSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  taskSessionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  taskSessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 6,
    marginBottom: 3,
  },
  taskSessionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  taskSessionStatus: {
    fontSize: 12,
    marginLeft: 8,
  },
  taskRemarksSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  taskRemarksTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  taskRemarksText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.cardBackground,
    borderRadius: 6,
  },
  // Task card remarks styles (for main card display)
  taskCardRemarksSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  taskCardRemarksLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  taskCardRemarksText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Expand/Collapse button styles
  taskMainContent: {
    flex: 1,
  },
  expandButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  expandButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  // Inline expand styles for in-progress tasks
  pendingTaskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  taskMainContentInline: {
    flex: 1,
  },
  expandButtonInline: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  // Photo count indicator styles
  photoCountSection: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoCountText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inlinePhotoCountSection: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  inlinePhotoCountText: {
    fontSize: 10,
    color: '#F59E0B',
    fontStyle: 'italic',
  },
  // Task Activity styles
  taskActivitySection: {
    marginTop: 8,
    marginBottom: 8,
  },
  taskActivityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  taskActivityDetail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
    paddingLeft: 8,
  },
  taskActivityCompact: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  photoSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  photoSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoImage: {
    width: '100%',
    height: 60,
    resizeMode: 'cover',
  },
  photoLabel: {
    fontSize: 10,
    color: Colors.text,
    padding: 4,
    lineHeight: 12,
    textAlign: 'center',
  },
  photoCategorySection: {
    marginBottom: 12,
  },
  photoCategoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  inlineSessionsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.3)',
  },
  inlineSessionsTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 4,
  },
  inlineSessionText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  inlinePhotoSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  inlinePhotoTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 6,
  },
  inlinePhotoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  inlinePhotoThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  inlinePhotoImage: {
    width: '100%',
    height: 35,
    resizeMode: 'cover',
  },
  inlinePhotoLabel: {
    fontSize: 8,
    color: Colors.textSecondary,
    padding: 2,
    lineHeight: 10,
    textAlign: 'center',
  },
  inlinePhotoCategorySection: {
    marginBottom: 8,
  },
  inlinePhotoCategoryTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    maxWidth: '90%',
  },
  addTaskModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  addTaskModalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  addTaskInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 20,
  },
  addTaskModalButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  addTaskModalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addTaskButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  addTaskButtonSecondary: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addTaskButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  addTaskButtonSecondaryText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Photo Modal Styles
  photoModalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  photoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  photoModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalCloseText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoModalHeaderInfo: {
    alignItems: 'center',
  },
  photoModalCategory: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoModalCounter: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  photoModalHeaderSpacer: {
    width: 40,
  },
  photoModalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photoModalImage: {
    width: '100%',
    height: '100%',
  },
  photoModalNavButton: {
    position: 'absolute',
    top: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  photoModalNavLeft: {
    left: 20,
  },
  photoModalNavRight: {
    right: 20,
  },
  photoModalNavText: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: 'bold',
  },
  photoModalDescription: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  photoModalDescriptionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  photoModalDescriptionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  photoModalMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoModalMetadataText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  photoModalDescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editDescriptionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editDescriptionButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionEditContainer: {
    marginTop: 8,
  },
  descriptionEditInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.white,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 12,
  },
  descriptionEditButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  descriptionEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  descriptionSaveButton: {
    backgroundColor: '#10B981',
  },
  descriptionSaveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  descriptionCancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tapToEditHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default JobDetailScreen;