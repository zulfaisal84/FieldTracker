import React, { useState } from 'react';
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
}

export interface TaskWorkData {
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'in_progress' | 'completed';
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
}) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

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
    
    if (newStatus === 'in_progress' && !date) {
      setDate(getCurrentDate());
    }
    if (newStatus === 'in_progress' && !startTime) {
      setStartTime(getCurrentTime());
    }
  };

  const handleSave = () => {
    if (status === 'in_progress' || status === 'completed') {
      if (!date || !startTime) {
        Alert.alert('Missing Information', 'Please fill in date and start time for active tasks');
        return;
      }
    }

    if (status === 'completed' && !endTime) {
      Alert.alert('Missing Information', 'Please fill in end time for completed tasks');
      return;
    }

    const taskData: TaskWorkData = {
      description: taskDescription,
      date,
      startTime,
      endTime,
      status,
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


          {/* Work Session Details */}
          {(status === 'in_progress' || status === 'completed') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🕐 Work Session</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date (dd/mm/yyyy)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={date}
                    onChangeText={setDate}
                    placeholder="26/12/2024"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput
                    style={styles.textInput}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="9:00 AM"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                
                {status === 'completed' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>End Time</Text>
                    <TextInput
                      style={styles.textInput}
                      value={endTime}
                      onChangeText={setEndTime}
                      placeholder="5:00 PM"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                )}
              </View>
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
          <TouchableOpacity 
            style={[styles.bottomButton, styles.startCompleteButton]}
            onPress={() => {
              if (status === 'pending') {
                handleStatusChange('in_progress');
                Alert.alert('Task Started', 'Task is now in progress!');
              } else if (status === 'in_progress') {
                handleStatusChange('completed');
                Alert.alert('Task Completed', 'Task has been completed!');
              }
            }}
          >
            <Text style={styles.bottomButtonText}>
              {status === 'pending' ? '🚀 Start' : '✅ Complete'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bottomButton, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.bottomButtonText}>💾 Save</Text>
          </TouchableOpacity>
        </View>
      </View>
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
});

export default TaskWorkModal;