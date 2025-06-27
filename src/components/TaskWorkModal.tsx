import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Colors } from '../styles/colors';

interface TaskWorkModalProps {
  visible: boolean;
  onClose: () => void;
  taskDescription: string;
  onUpdateTask: (taskData: TaskWorkData) => void;
  existingTaskData?: TaskWorkData;
}

export interface WorkSession {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TaskPhoto {
  id: string;
  uri: string;
  description: string;
  category: 'before' | 'during' | 'after';
  timestamp: string;
  fileSize: number;
}

export interface TaskWorkData {
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  sessions: WorkSession[];
  photos: TaskPhoto[];
  notes?: string;
}

const TaskWorkModal: React.FC<TaskWorkModalProps> = ({
  visible,
  onClose,
  taskDescription,
  onUpdateTask,
  existingTaskData,
}) => {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkSession | null>(null);
  
  // Photo modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'before' | 'during' | 'after'>('before');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [tempPhotoUri, setTempPhotoUri] = useState<string>('');
  const [photoDescription, setPhotoDescription] = useState('');
  
  // Simple text input state for session entry  
  const [startDateText, setStartDateText] = useState(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [endDateText, setEndDateText] = useState(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [startTimeText, setStartTimeText] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  });
  const [endTimeText, setEndTimeText] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  });
  const [hasEndTime, setHasEndTime] = useState(false);

  // Load existing task data or reset for new tasks
  useEffect(() => {
    if (visible) {
      setShowAddSession(false);
      
      // Initialize session form state
      setStartDateText(getCurrentDate());
      setEndDateText(getCurrentDate());
      setStartTimeText(getCurrentTime());
      setEndTimeText(getCurrentTime());
      setHasEndTime(false);
      setEditingSession(null);
      
      if (existingTaskData) {
        // Load existing task data
        setNotes(existingTaskData.notes || '');
        setStatus(existingTaskData.status);
        setSessions(existingTaskData.sessions || []);
        setPhotos(existingTaskData.photos || []);
      } else {
        // Reset for new task
        setNotes('');
        setStatus('pending');
        setSessions([]);
        setPhotos([]);
      }
    }
  }, [visible, taskDescription, existingTaskData]);

  // Helper functions for date/time formatting and validation
  const getCurrentDate = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  const isValidDate = (dateStr: string) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(dateStr);
  };

  const isValidTime = (timeStr: string) => {
    const regex = /^\d{1,2}:\d{2}\s(AM|PM)$/;
    return regex.test(timeStr);
  };

  // Photo handling functions
  const getPhotosForCategory = (category: 'before' | 'during' | 'after') => {
    return photos.filter(photo => photo.category === category);
  };

  const canAddMorePhotos = (category: 'before' | 'during' | 'after') => {
    return getPhotosForCategory(category).length < 10;
  };

  const validateTaskPhotos = () => {
    const beforePhotos = getPhotosForCategory('before');
    const afterPhotos = getPhotosForCategory('after');
    
    return {
      isValid: beforePhotos.length >= 1 && afterPhotos.length >= 1,
      missingBefore: beforePhotos.length === 0,
      missingAfter: afterPhotos.length === 0
    };
  };

  const showPhotoSourceModal = (category: 'before' | 'during' | 'after') => {
    if (!canAddMorePhotos(category)) {
      Alert.alert('Photo Limit', `Maximum 10 ${category} photos allowed`);
      return;
    }
    
    setSelectedCategory(category);
    setShowPhotoModal(true);
  };

  const selectPhotoSource = (source: 'camera' | 'gallery') => {
    setShowPhotoModal(false);
    
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
    };

    const callback = (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setTempPhotoUri(asset.uri || '');
        setPhotoDescription('');
        setShowDescriptionModal(true);
      }
    };

    if (source === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const savePhotoWithDescription = () => {
    if (!photoDescription.trim()) {
      Alert.alert('Description Required', 'Please enter a description for this photo');
      return;
    }

    const newPhoto: TaskPhoto = {
      id: `photo_${Date.now()}`,
      uri: tempPhotoUri,
      description: photoDescription.trim(),
      category: selectedCategory,
      timestamp: new Date().toISOString(),
      fileSize: 0, // We'll calculate this later if needed
    };

    setPhotos(prev => [...prev, newPhoto]);
    setShowDescriptionModal(false);
    setTempPhotoUri('');
    setPhotoDescription('');
  };

  const deletePhoto = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setPhotos(prev => prev.filter(p => p.id !== photoId))
        }
      ]
    );
  };

  const handleStatusChange = (newStatus: 'pending' | 'in_progress' | 'completed') => {
    setStatus(newStatus);
    
    if (newStatus === 'in_progress') {
      // Show add session modal to manually enter first session
      setStartDateText(getCurrentDate());
      setEndDateText(getCurrentDate());
      setStartTimeText(getCurrentTime());
      setEndTimeText(getCurrentTime());
      setHasEndTime(false);
      setEditingSession(null);
      setShowAddSession(true);
    }
  };

  const saveSession = () => {
    // Validate that we have at least start date and time
    if (!startDateText || !startDateText.trim() || !startTimeText || !startTimeText.trim()) {
      Alert.alert('Missing Information', 'Please enter start date and time');
      return;
    }

    // Validate date and time formats
    if (!isValidDate(startDateText.trim())) {
      Alert.alert('Invalid Date', 'Please use DD/MM/YYYY format (e.g., 27/06/2025)');
      return;
    }

    if (!isValidTime(startTimeText.trim())) {
      Alert.alert('Invalid Time', 'Please use H:MM AM/PM format (e.g., 1:30 PM)');
      return;
    }

    if (hasEndTime) {
      if (!endDateText || !endDateText.trim() || !endTimeText || !endTimeText.trim()) {
        Alert.alert('Missing Information', 'Please enter end date and time');
        return;
      }
      if (!isValidDate(endDateText.trim()) || !isValidTime(endTimeText.trim())) {
        Alert.alert('Invalid Format', 'Please check your end date and time formats');
        return;
      }
    }

    const sessionData = {
      startDate: startDateText.trim(),
      endDate: hasEndTime ? endDateText.trim() : startDateText.trim(),
      startTime: startTimeText.trim(),
      endTime: hasEndTime ? endTimeText.trim() : '',
      isActive: !hasEndTime
    };

    if (editingSession) {
      // Update existing session
      setSessions(prev => prev.map(session =>
        session.id === editingSession.id
          ? {
              ...session,
              ...sessionData
            }
          : session
      ));
    } else {
      // Add new session
      const newSession: WorkSession = {
        id: `session_${Date.now()}`,
        ...sessionData
      };
      setSessions(prev => [...prev, newSession]);
    }

    // Reset form and close modal
    resetSessionForm();
    setShowAddSession(false);
  };

  const resetSessionForm = () => {
    setStartDateText(getCurrentDate());
    setEndDateText(getCurrentDate());
    setStartTimeText(getCurrentTime());
    setEndTimeText(getCurrentTime());
    setHasEndTime(false);
    setEditingSession(null);
  };

  const handleSave = () => {
    // Validate photos if task is completed
    if (status === 'completed') {
      const photoValidation = validateTaskPhotos();
      if (!photoValidation.isValid) {
        let message = 'Task completion requires:\n';
        if (photoValidation.missingBefore) message += '• At least 1 Before photo\n';
        if (photoValidation.missingAfter) message += '• At least 1 After photo\n';
        
        Alert.alert('Photos Required', message, [
          { text: 'Continue Anyway', onPress: () => saveTask() },
          { text: 'Add Photos', style: 'cancel' }
        ]);
        return;
      }
    }
    
    saveTask();
  };

  const saveTask = () => {
    const taskData: TaskWorkData = {
      description: taskDescription,
      status,
      sessions,
      photos,
      notes,
    };

    onUpdateTask(taskData);
    onClose();
  };


  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Work on Task</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content}>
          {/* Task Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Task</Text>
            <Text style={styles.taskDescription}>{taskDescription}</Text>
          </View>


          {/* Work Sessions */}
          {sessions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Work Sessions ({sessions.length} total)</Text>
              
              {sessions.map((session, index) => (
                <TouchableOpacity 
                  key={session.id} 
                  style={styles.sessionCard}
                  onPress={() => {
                    // Open session for editing
                    setEditingSession(session);
                    
                    // Load existing session data into text inputs
                    setStartDateText(session.startDate);
                    setStartTimeText(session.startTime);
                    
                    if (session.endTime) {
                      setEndDateText(session.endDate);
                      setEndTimeText(session.endTime);
                      setHasEndTime(true);
                    } else {
                      setEndDateText(session.startDate);
                      setEndTimeText(getCurrentTime());
                      setHasEndTime(false);
                    }
                    
                    setShowAddSession(true);
                  }}
                >
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionTitle}>Session {index + 1}</Text>
                    <Text style={styles.sessionStatus}>
                      {session.isActive ? '🔄' : '✅'}
                    </Text>
                  </View>
                  <Text style={styles.sessionDetails}>
                    {session.startDate === session.endDate 
                      ? `${session.startDate} ${session.startTime} - ${session.endTime || '[Active]'}`
                      : `${session.startDate} ${session.startTime} - ${session.endDate} ${session.endTime || '[Active]'}`
                    }
                  </Text>
                  <Text style={styles.sessionTapHint}>Tap to edit</Text>
                </TouchableOpacity>
              ))}
              
              {/* Add Session Button */}
              <TouchableOpacity 
                style={styles.addSessionButton}
                onPress={() => {
                  resetSessionForm();
                  setShowAddSession(true);
                }}
              >
                <Text style={styles.addSessionText}>+ Add Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Photos Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Task Photos</Text>
            
            {/* Photo Categories */}
            <View style={styles.photoCategoriesContainer}>
              {/* Before Photos */}
              <View style={styles.photoCategorySection}>
                <View style={styles.photoCategoryHeader}>
                  <Text style={styles.photoCategoryTitle}>Before ({getPhotosForCategory('before').length}/10)</Text>
                  {getPhotosForCategory('before').length === 0 && (
                    <Text style={styles.requiredLabel}>Required</Text>
                  )}
                </View>
                <View style={styles.photoGrid}>
                  {getPhotosForCategory('before').map(photo => (
                    <TouchableOpacity 
                      key={photo.id} 
                      style={styles.photoThumbnail}
                      onLongPress={() => deletePhoto(photo.id)}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                      <Text style={styles.photoDescription} numberOfLines={2}>{photo.description}</Text>
                    </TouchableOpacity>
                  ))}
                  {canAddMorePhotos('before') && (
                    <TouchableOpacity 
                      style={styles.addPhotoButton}
                      onPress={() => showPhotoSourceModal('before')}
                    >
                      <Text style={styles.addPhotoText}>📷</Text>
                      <Text style={styles.addPhotoLabel}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* During Photos */}
              <View style={styles.photoCategorySection}>
                <View style={styles.photoCategoryHeader}>
                  <Text style={styles.photoCategoryTitle}>During ({getPhotosForCategory('during').length}/10)</Text>
                  <Text style={styles.optionalLabel}>Optional</Text>
                </View>
                <View style={styles.photoGrid}>
                  {getPhotosForCategory('during').map(photo => (
                    <TouchableOpacity 
                      key={photo.id} 
                      style={styles.photoThumbnail}
                      onLongPress={() => deletePhoto(photo.id)}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                      <Text style={styles.photoDescription} numberOfLines={2}>{photo.description}</Text>
                    </TouchableOpacity>
                  ))}
                  {canAddMorePhotos('during') && (
                    <TouchableOpacity 
                      style={styles.addPhotoButton}
                      onPress={() => showPhotoSourceModal('during')}
                    >
                      <Text style={styles.addPhotoText}>📷</Text>
                      <Text style={styles.addPhotoLabel}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* After Photos */}
              <View style={styles.photoCategorySection}>
                <View style={styles.photoCategoryHeader}>
                  <Text style={styles.photoCategoryTitle}>After ({getPhotosForCategory('after').length}/10)</Text>
                  {getPhotosForCategory('after').length === 0 && (
                    <Text style={styles.requiredLabel}>Required</Text>
                  )}
                </View>
                <View style={styles.photoGrid}>
                  {getPhotosForCategory('after').map(photo => (
                    <TouchableOpacity 
                      key={photo.id} 
                      style={styles.photoThumbnail}
                      onLongPress={() => deletePhoto(photo.id)}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                      <Text style={styles.photoDescription} numberOfLines={2}>{photo.description}</Text>
                    </TouchableOpacity>
                  ))}
                  {canAddMorePhotos('after') && (
                    <TouchableOpacity 
                      style={styles.addPhotoButton}
                      onPress={() => showPhotoSourceModal('after')}
                    >
                      <Text style={styles.addPhotoText}>📷</Text>
                      <Text style={styles.addPhotoLabel}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            
            <Text style={styles.photoInstructions}>
              Long press photos to delete • Descriptions required for all photos
            </Text>
          </View>

          {/* Remarks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📄 Remarks (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional remarks about this task..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          {/* Only show Start/Complete button if task is not already completed */}
          {status !== 'completed' && (
            <TouchableOpacity 
              style={[styles.bottomButton, styles.startCompleteButton]}
              onPress={() => {
                if (status === 'pending') {
                  handleStatusChange('in_progress');
                  
                  // Create first session when starting task
                  const firstSession: WorkSession = {
                    id: `session_${Date.now()}`,
                    startDate: getCurrentDate(),
                    endDate: getCurrentDate(),
                    startTime: getCurrentTime(),
                    endTime: '',
                    isActive: true,
                  };
                  
                  // Immediately update the task in Job Details
                  const taskData: TaskWorkData = {
                    description: taskDescription,
                    status: 'in_progress',
                    sessions: [firstSession],
                    notes,
                  };
                  onUpdateTask(taskData);
                  
                  Alert.alert('Task Started', 'Task is now in progress!');
                } else if (status === 'in_progress') {
                  // Mark current active session as completed
                  const updatedSessions = sessions.map(session => 
                    session.isActive ? { ...session, endTime: getCurrentTime(), isActive: false } : session
                  );
                  setSessions(updatedSessions);
                  setStatus('completed');
                  
                  // Immediately update the task in Job Details
                  const taskData: TaskWorkData = {
                    description: taskDescription,
                    status: 'completed',
                    sessions: updatedSessions,
                    notes,
                  };
                  onUpdateTask(taskData);
                  
                  Alert.alert('Task Completed', 'Task has been completed!');
                }
              }}
            >
              <Text style={styles.bottomButtonText}>
                {status === 'pending' ? '🚀 Start' : '✅ Complete'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.bottomButton, 
              styles.saveButton,
              // If no Start/Complete button, make Save button full width
              status === 'completed' && styles.fullWidthButton
            ]}
            onPress={handleSave}
          >
            <Text style={styles.bottomButtonText}>💾 Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Session Entry Modal */}
      {showAddSession && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.sessionModal}>
              <ScrollView 
                style={styles.sessionModalContent}
                contentContainerStyle={styles.sessionModalScrollContainer}
                showsVerticalScrollIndicator={Platform.OS === 'android'}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                bounces={false}
                overScrollMode="never"
              >
              <Text style={styles.sessionModalTitle}>
                {editingSession ? 'Edit Session' : 'Add New Session'}
              </Text>
              
              {/* Start Date & Time Inputs */}
              <View style={styles.dateTimeSection}>
                <Text style={styles.sectionHeader}>📅 Start Date & Time</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Start Date (DD/MM/YYYY):</Text>
                  <TextInput
                    style={styles.textInput}
                    value={startDateText}
                    onChangeText={setStartDateText}
                    placeholder="27/06/2025"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Start Time (H:MM AM/PM):</Text>
                  <TextInput
                    style={styles.textInput}
                    value={startTimeText}
                    onChangeText={setStartTimeText}
                    placeholder="1:30 PM"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              {/* End Date & Time Toggle */}
              <View style={styles.dateTimeSection}>
                <View style={styles.toggleSection}>
                  <Text style={styles.sectionHeader}>📅 End Date & Time</Text>
                  <TouchableOpacity
                    style={[styles.toggleButton, hasEndTime && styles.toggleButtonActive]}
                    onPress={() => setHasEndTime(!hasEndTime)}
                  >
                    <Text style={[styles.toggleText, hasEndTime && styles.toggleTextActive]}>
                      {hasEndTime ? 'Has End Time' : 'Ongoing Work'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {hasEndTime && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>End Date (DD/MM/YYYY):</Text>
                      <TextInput
                        style={styles.textInput}
                        value={endDateText}
                        onChangeText={setEndDateText}
                        placeholder="27/06/2025"
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>End Time (H:MM AM/PM):</Text>
                      <TextInput
                        style={styles.textInput}
                        value={endTimeText}
                        onChangeText={setEndTimeText}
                        placeholder="5:30 PM"
                        placeholderTextColor={Colors.textSecondary}
                      />
                    </View>
                  </>
                )}
              </View>
              
              {/* Buttons */}
              <View style={styles.sessionModalButtons}>
                <TouchableOpacity
                  style={styles.sessionModalButton}
                  onPress={saveSession}
                >
                  <Text style={styles.sessionModalButtonText}>
                    {editingSession ? 'Update Session' : 'Add Session'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.sessionModalButton, styles.cancelSessionButton]}
                  onPress={() => {
                    resetSessionForm();
                    setShowAddSession(false);
                  }}
                >
                  <Text style={styles.cancelSessionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Photo Source Selection Modal */}
      {showPhotoModal && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.photoSourceModal}>
              <Text style={styles.photoSourceTitle}>Add {selectedCategory} Photo</Text>
              
              <TouchableOpacity 
                style={styles.photoSourceButton}
                onPress={() => selectPhotoSource('camera')}
              >
                <Text style={styles.photoSourceButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.photoSourceButton}
                onPress={() => selectPhotoSource('gallery')}
              >
                <Text style={styles.photoSourceButtonText}>🖼️ Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.photoSourceButton, styles.cancelPhotoButton]}
                onPress={() => setShowPhotoModal(false)}
              >
                <Text style={styles.cancelPhotoButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Photo Description Modal */}
      {showDescriptionModal && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.descriptionModal}>
              <Text style={styles.descriptionModalTitle}>Add Photo Description</Text>
              
              {tempPhotoUri && (
                <Image source={{ uri: tempPhotoUri }} style={styles.previewImage} />
              )}
              
              <TextInput
                style={styles.descriptionInput}
                value={photoDescription}
                onChangeText={setPhotoDescription}
                placeholder="Describe what this photo shows..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
                autoFocus
              />
              
              <View style={styles.descriptionModalButtons}>
                <TouchableOpacity 
                  style={styles.descriptionSaveButton}
                  onPress={savePhotoWithDescription}
                >
                  <Text style={styles.descriptionSaveButtonText}>Save Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.descriptionCancelButton}
                  onPress={() => {
                    setShowDescriptionModal(false);
                    setTempPhotoUri('');
                    setPhotoDescription('');
                  }}
                >
                  <Text style={styles.descriptionCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelButton: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: Colors.text,
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  photoButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  photoNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  notesInput: {
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
  },
  headerSpacer: {
    width: 60, // Match cancel button width for symmetry
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for home indicator
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCompleteButton: {
    backgroundColor: Colors.tech,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  bottomButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullWidthButton: {
    flex: 2, // Take full width when Start/Complete button is hidden
  },
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  sessionStatus: {
    fontSize: 16,
  },
  sessionDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sessionTapHint: {
    fontSize: 11,
    color: Colors.tech,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  addSessionButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addSessionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sessionModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '85%',
    minHeight: '60%',
  },
  sessionModalContent: {
    flex: 1,
  },
  sessionModalScrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  sessionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  sessionModalButton: {
    backgroundColor: Colors.tech,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionModalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelSessionButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelSessionButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  sessionModalButtons: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 20,
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleButtonActive: {
    backgroundColor: Colors.tech,
    borderColor: Colors.tech,
  },
  toggleText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: Colors.white,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  // Photo styles
  photoCategoriesContainer: {
    marginBottom: 12,
  },
  photoCategorySection: {
    marginBottom: 16,
  },
  photoCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoCategoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  requiredLabel: {
    fontSize: 12,
    color: Colors.tech,
    fontWeight: '500',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  optionalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
  photoDescription: {
    fontSize: 10,
    color: Colors.text,
    padding: 4,
    lineHeight: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  addPhotoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  photoInstructions: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  // Photo source modal styles
  photoSourceModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 280,
  },
  photoSourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  photoSourceButton: {
    backgroundColor: Colors.tech,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  photoSourceButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelPhotoButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelPhotoButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Description modal styles
  descriptionModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
    minWidth: 320,
  },
  descriptionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  descriptionInput: {
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
    marginBottom: 16,
  },
  descriptionModalButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  descriptionSaveButton: {
    backgroundColor: Colors.tech,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  descriptionSaveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionCancelButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  descriptionCancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskWorkModal;