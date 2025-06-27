import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';

interface CreateJobScreenProps {
  onJobCreated: () => void;
}

const CreateJobScreen: React.FC<CreateJobScreenProps> = ({ onJobCreated }) => {
  const { users, createJob } = useApp();
  const [siteLocation, setSiteLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  // Get all technician users
  const technicians = Object.values(users).filter(user => user.role === 'tech');

  const toggleTechSelection = (techId: string) => {
    setSelectedTechs(prev => {
      if (prev.includes(techId)) {
        return prev.filter(id => id !== techId);
      } else {
        return [...prev, techId];
      }
    });
  };

  const handleCreateJob = () => {
    // Validation
    if (!siteLocation.trim()) {
      Alert.alert('Error', 'Please enter a site location');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }
    
    if (selectedTechs.length === 0) {
      Alert.alert('Error', 'Please select at least one technician');
      return;
    }

    // Create the job
    const jobId = createJob(
      `${siteLocation} - ${description}`,
      siteLocation.trim(),
      description.trim(),
      selectedTechs
    );

    if (jobId) {
      Alert.alert(
        'Success', 
        'Job created successfully!',
        [{ text: 'OK', onPress: () => {
          // Reset form
          setSiteLocation('');
          setDescription('');
          setSelectedTechs([]);
          onJobCreated();
        }}]
      );
    } else {
      Alert.alert('Error', 'Failed to create job. Please try again.');
    }
  };

  const resetForm = () => {
    setSiteLocation('');
    setDescription('');
    setSelectedTechs([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.boss} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Job</Text>
        <Text style={styles.headerSubtitle}>Fill in the details to assign work to technicians</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Information Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Job Information</Text>
            <Text style={styles.sectionSubtitle}>Basic details about the work to be done</Text>
          </View>
          
          {/* Site Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📍 Site Location *</Text>
            <TextInput
              style={[
                styles.textInput,
                siteLocation.trim() && styles.inputValid
              ]}
              value={siteLocation}
              onChangeText={setSiteLocation}
              placeholder="e.g., KLCC Tower 1, Level 23"
              placeholderTextColor={Colors.textSecondary}
            />
            {siteLocation.trim() && (
              <Text style={styles.validationSuccess}>✓ Location entered</Text>
            )}
          </View>

          {/* Job Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📝 Job Description *</Text>
            <TextInput
              style={[
                styles.textInput, 
                styles.textArea,
                description.trim() && styles.inputValid
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Machine 1 Electrical Works"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            {description.trim() && (
              <Text style={styles.validationSuccess}>✓ Description added</Text>
            )}
          </View>

          {/* Creation Date (Auto) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📅 Creation Date</Text>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-GB')} (Today)
              </Text>
              <Text style={styles.dateIcon}>✓</Text>
            </View>
          </View>
        </View>

        {/* Technician Assignment Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👷 Assign Technicians</Text>
            <Text style={styles.sectionSubtitle}>
              {selectedTechs.length > 0 
                ? `${selectedTechs.length} technician(s) selected`
                : 'Select one or more technicians for this job'
              }
            </Text>
          </View>
          
          {technicians.length === 0 ? (
            <View style={styles.noTechsContainer}>
              <Text style={styles.noTechsIcon}>👤</Text>
              <Text style={styles.noTechsText}>No technicians available</Text>
              <Text style={styles.noTechsSubtext}>Create technician accounts in Manage tab first</Text>
            </View>
          ) : (
            <>
              <View style={styles.techSelectionGrid}>
                {technicians.map(tech => (
                  <TouchableOpacity
                    key={tech.id}
                    style={styles.techEmojiButton}
                    onPress={() => toggleTechSelection(tech.id)}
                  >
                    <Text style={[
                      styles.techEmoji,
                      selectedTechs.includes(tech.id) && styles.techEmojiSelected
                    ]}>
                      👷
                    </Text>
                    <Text style={[
                      styles.techEmojiName,
                      selectedTechs.includes(tech.id) && styles.techEmojiNameSelected
                    ]}>
                      {tech.realName || tech.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedTechs.length > 0 && (
                <Text style={styles.validationSuccess}>
                  ✓ {selectedTechs.length} technician(s) assigned
                </Text>
              )}
            </>
          )}
        </View>

        {/* Form Summary & Actions Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Review & Create</Text>
            <Text style={styles.sectionSubtitle}>Check your job details before creating</Text>
          </View>
          
          {/* Form Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={siteLocation.trim() ? styles.progressIconComplete : styles.progressIcon}>📍</Text>
              <Text style={siteLocation.trim() ? styles.progressTextComplete : styles.progressText}>
                Site Location {siteLocation.trim() ? '✓' : ''}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={description.trim() ? styles.progressIconComplete : styles.progressIcon}>📝</Text>
              <Text style={description.trim() ? styles.progressTextComplete : styles.progressText}>
                Description {description.trim() ? '✓' : ''}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={selectedTechs.length > 0 ? styles.progressIconComplete : styles.progressIcon}>👷</Text>
              <Text style={selectedTechs.length > 0 ? styles.progressTextComplete : styles.progressText}>
                Technicians {selectedTechs.length > 0 ? `(${selectedTechs.length}) ✓` : ''}
              </Text>
            </View>
          </View>
          
          {/* Form Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={handleCreateJob}
            >
              <Text style={styles.createButtonText}>✓ Create Job</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomPadding} />
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
    backgroundColor: Colors.boss,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
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
    fontSize: 12,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Card-based layout like PP
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  inputValid: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  validationSuccess: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 6,
    fontWeight: '500',
  },
  dateDisplay: {
    backgroundColor: 'rgba(31, 41, 55, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  dateIcon: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  noTechsContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noTechsIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  noTechsText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  noTechsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  techSelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  techEmojiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  techEmoji: {
    fontSize: 16,
    marginRight: 6,
    opacity: 0.6,
  },
  techEmojiSelected: {
    opacity: 1,
  },
  techEmojiName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  techEmojiNameSelected: {
    color: Colors.boss,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.5,
  },
  progressIconComplete: {
    fontSize: 16,
    marginRight: 8,
    opacity: 1,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressTextComplete: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  actions: {
    marginTop: 16,
  },
  createButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
    shadowOpacity: 0.15,
    elevation: 2,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 20,
  },
});

export default CreateJobScreen;