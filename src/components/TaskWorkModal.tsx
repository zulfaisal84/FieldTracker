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
} from 'react-native';
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
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TaskWorkData {
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  sessions: WorkSession[];
  beforePhoto?: string;
  duringPhoto?: string;
  afterPhoto?: string;
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
  const [showAddSession, setShowAddSession] = useState(false);
  const [editingSession, setEditingSession] = useState<WorkSession | null>(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState('');
  const [sessionEndTime, setSessionEndTime] = useState('');

  // Load existing task data or reset for new tasks
  useEffect(() => {
    if (visible) {
      setShowAddSession(false);
      
      if (existingTaskData) {
        // Load existing task data
        setNotes(existingTaskData.notes || '');
        setStatus(existingTaskData.status);
        setSessions(existingTaskData.sessions || []);
      } else {
        // Reset for new task
        setNotes('');
        setStatus('pending');
        setSessions([]);
      }
    }
  }, [visible, taskDescription, existingTaskData]);

  const getCurrentDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
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

  const handleStatusChange = (newStatus: 'pending' | 'in_progress' | 'completed') => {
    setStatus(newStatus);
    
    if (newStatus === 'in_progress') {
      // Show add session modal to manually enter first session
      setSessionDate(getCurrentDate());
      setSessionStartTime(getCurrentTime());
      setSessionEndTime('');
      setEditingSession(null);
      setShowAddSession(true);
    }
  };

  const saveSession = () => {
    if (!sessionDate || !sessionStartTime) {
      Alert.alert('Missing Information', 'Please fill in date and start time');
      return;
    }

    if (editingSession) {
      // Update existing session
      setSessions(prev => prev.map(session =>
        session.id === editingSession.id
          ? {
              ...session,
              date: sessionDate,
              startTime: sessionStartTime,
              endTime: sessionEndTime,
              isActive: !sessionEndTime // If no end time, session is still active
            }
          : session
      ));
    } else {
      // Add new session
      const newSession: WorkSession = {
        id: `session_${Date.now()}`,
        date: sessionDate,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        isActive: !sessionEndTime, // If no end time, session is still active
      };
      setSessions(prev => [...prev, newSession]);
    }

    // Reset form and close modal
    setSessionDate('');
    setSessionStartTime('');
    setSessionEndTime('');
    setEditingSession(null);
    setShowAddSession(false);
  };

  const handleSave = () => {
    const taskData: TaskWorkData = {
      description: taskDescription,
      status,
      sessions,
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
                    setSessionDate(session.date);
                    setSessionStartTime(session.startTime);
                    setSessionEndTime(session.endTime || '');
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
                    {session.date} {session.startTime} - {session.endTime || '[Active]'}
                  </Text>
                  <Text style={styles.sessionTapHint}>Tap to edit</Text>
                </TouchableOpacity>
              ))}
              
              {/* Add Session Button */}
              <TouchableOpacity 
                style={styles.addSessionButton}
                onPress={() => {
                  setSessionDate(getCurrentDate());
                  setSessionStartTime(getCurrentTime());
                  setSessionEndTime('');
                  setEditingSession(null);
                  setShowAddSession(true);
                }}
              >
                <Text style={styles.addSessionText}>+ Add Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Photos Section */}
          {(status === 'in_progress' || status === 'completed') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Photos</Text>
              <View style={styles.photoRow}>
                <TouchableOpacity style={styles.photoButton}>
                  <Text style={styles.photoButtonText}>📷 Before</Text>
                </TouchableOpacity>
                {status === 'completed' && (
                  <>
                    <TouchableOpacity style={styles.photoButton}>
                      <Text style={styles.photoButtonText}>📷 During</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoButton}>
                      <Text style={styles.photoButtonText}>📷 After</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <Text style={styles.photoNote}>Photo upload coming soon</Text>
            </View>
          )}

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
                    date: getCurrentDate(),
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
              <Text style={styles.sessionModalTitle}>
                {editingSession ? 'Edit Session' : 'Add New Session'}
              </Text>
              
              {/* Date Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date (dd/mm/yyyy)</Text>
                <TextInput
                  style={styles.textInput}
                  value={sessionDate}
                  onChangeText={setSessionDate}
                  placeholder="27/06/2025"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Start Time Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Time (hh:mm AM/PM)</Text>
                <TextInput
                  style={styles.textInput}
                  value={sessionStartTime}
                  onChangeText={setSessionStartTime}
                  placeholder="09:00 AM"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* End Time Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Time (hh:mm AM/PM) - Optional</Text>
                <TextInput
                  style={styles.textInput}
                  value={sessionEndTime}
                  onChangeText={setSessionEndTime}
                  placeholder="12:00 PM (leave empty if ongoing)"
                  placeholderTextColor={Colors.textSecondary}
                />
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
                    setSessionDate('');
                    setSessionStartTime('');
                    setSessionEndTime('');
                    setEditingSession(null);
                    setShowAddSession(false);
                  }}
                >
                  <Text style={styles.cancelSessionButtonText}>Cancel</Text>
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
  },
  sessionModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 320,
    maxHeight: '80%',
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
    marginTop: 10,
  },
});

export default TaskWorkModal;