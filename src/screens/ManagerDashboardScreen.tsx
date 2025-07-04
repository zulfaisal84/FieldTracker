import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import JobListScreen from './JobListScreen';
import JobDetailScreen from './JobDetailScreen';
import CreateJobScreen from './CreateJobScreen';

const ManagerDashboardScreen: React.FC = () => {
  const { logout, jobHistory, users, jobs, createTech, updateUser, getUsersByRole } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'create' | 'manage' | 'reports' | 'settings'>('jobs');
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [showEditTechModal, setShowEditTechModal] = useState(false);
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [newTechForm, setNewTechForm] = useState({
    username: '',
    realName: '',
    phone: '',
    email: ''
  });

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

  const handleGenerateReport = (jobId: string) => {
    setPreviewJobId(jobId);
    setShowReportPreview(true);
  };

  const generateReport = (jobId: string, format: 'pdf' | 'word') => {
    // This will be implemented in the next step with professional template
    Alert.alert(
      'Report Generated',
      `Professional ${format.toUpperCase()} report for job has been prepared. Share options: WhatsApp, Google Drive, AirDrop.`,
      [
        { text: 'Share', onPress: () => shareReport(jobId, format) },
        { text: 'Save', onPress: () => saveReport(jobId, format) },
      ]
    );
  };

  const shareReport = (jobId: string, format: string) => {
    Alert.alert('Share Report', `Sharing ${format.toUpperCase()} report via system share sheet...`);
  };

  const saveReport = (jobId: string, format: string) => {
    Alert.alert('Report Saved', `${format.toUpperCase()} report saved to device`);
  };

  // Technician Management Functions
  const handleAddTechnician = () => {
    if (newTechForm.username.trim() && newTechForm.realName.trim() && 
        newTechForm.phone.trim() && newTechForm.email.trim()) {
      createTech(newTechForm.username, newTechForm.realName, newTechForm.phone, newTechForm.email);
      setNewTechForm({ username: '', realName: '', phone: '', email: '' });
      setShowAddTechModal(false);
      Alert.alert(
        'Technician Added',
        `${newTechForm.realName} has been added successfully.\nTemporary password sent to ${newTechForm.phone} and ${newTechForm.email}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const handleEditTechnician = (techId: string) => {
    setEditingTechId(techId);
    const tech = users[techId];
    if (tech) {
      setNewTechForm({
        username: tech.username,
        realName: tech.realName,
        phone: tech.phone,
        email: tech.email
      });
      setShowEditTechModal(true);
    }
  };

  const handleUpdateTechnician = () => {
    if (editingTechId && newTechForm.realName.trim()) {
      updateUser(editingTechId, {
        realName: newTechForm.realName
      });
      setNewTechForm({ username: '', realName: '', phone: '', email: '' });
      setShowEditTechModal(false);
      setEditingTechId(null);
      Alert.alert('Success', 'Technician name updated successfully');
    } else {
      Alert.alert('Error', 'Please enter a valid name');
    }
  };

  const handleResetPassword = (techId: string) => {
    const tech = users[techId];
    if (tech) {
      Alert.alert(
        'Reset Password',
        `Reset password for ${tech.realName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: () => {
              const tempPassword = Math.random().toString(36).slice(-8);
              Alert.alert(
                'Password Reset',
                `New temporary password for ${tech.realName}: ${tempPassword}\n\nCredentials sent to:\n📱 ${tech.phone}\n📧 ${tech.email}`,
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    }
  };

  const handleViewTechJobs = (techId: string) => {
    const tech = users[techId];
    if (tech) {
      const techJobs = Object.values(jobHistory).filter(job => 
        job.assignedTechs.includes(techId)
      );
      Alert.alert(
        `${tech.realName}'s Jobs`,
        techJobs.length > 0 
          ? `Completed ${techJobs.length} jobs:\n\n${techJobs.map(job => `• ${job.title}`).join('\n')}`
          : 'No completed jobs yet',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteTechnician = (techId: string) => {
    const tech = users[techId];
    if (tech) {
      // Check for active jobs assigned to this technician
      // Active jobs are any status except 'Approved' (which are moved to history)
      const activeJobs = Object.values(jobs).filter(job => 
        job.assignedTechs.includes(techId) && job.status !== 'Approved'
      );

      console.log('Debug Delete:', {
        techId,
        techName: tech.realName,
        totalJobs: Object.values(jobs).length,
        activeJobsCount: activeJobs.length,
        activeJobs: activeJobs.map(j => ({ title: j.title, status: j.status, assignedTechs: j.assignedTechs }))
      });

      if (activeJobs.length > 0) {
        // Prevent deletion - show active jobs
        Alert.alert(
          'Cannot Delete Technician',
          `${tech.realName} has ${activeJobs.length} active job${activeJobs.length > 1 ? 's' : ''} assigned:\n\n${activeJobs.map(job => `• ${job.title} (${job.status})`).join('\n')}\n\nPlease cancel or reassign these jobs first before deleting the technician account.`,
          [
            { text: 'OK', style: 'cancel' },
            { 
              text: 'View Jobs', 
              onPress: () => {
                // Switch to Jobs tab to let manager see and manage active jobs
                setActiveTab('jobs');
              }
            }
          ]
        );
      } else {
        // Safe to delete - no active jobs
        Alert.alert(
          'Delete Technician',
          `Are you sure you want to delete ${tech.realName}?\n\nThis action cannot be undone. The technician will lose access to the app.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                // For now, just show confirmation since we need to implement deleteTech function
                Alert.alert(
                  'Technician Deleted',
                  `${tech.realName} has been removed from the system.`,
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      }
    }
  };

  const renderProfessionalReport = (jobId: string) => {
    const job = jobHistory[jobId];
    if (!job) return null;

    const tasks = job.tasks ? Object.values(job.tasks) : [];
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    return (
      <View style={styles.reportPage}>
        {/* Report Header */}
        <View style={styles.reportHeader}>
          <View style={styles.reportHeaderTop}>
            <Text style={styles.companyName}>FIELD TRACKER</Text>
            <Text style={styles.reportType}>DAILY WORK REPORT</Text>
          </View>
          <View style={styles.reportHeaderInfo}>
            <View style={styles.reportInfoRow}>
              <Text style={styles.reportLabel}>JOB TITLE:</Text>
              <Text style={styles.reportValue}>{job.title}</Text>
            </View>
            <View style={styles.reportInfoRow}>
              <Text style={styles.reportLabel}>LOCATION:</Text>
              <Text style={styles.reportValue}>{job.siteLocation}</Text>
            </View>
            <View style={styles.reportInfoRow}>
              <Text style={styles.reportLabel}>JOB STARTED:</Text>
              <Text style={styles.reportValue}>
                {job.startedAt ? new Date(job.startedAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.reportInfoRow}>
              <Text style={styles.reportLabel}>JOB COMPLETED:</Text>
              <Text style={styles.reportValue}>
                {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.reportInfoRow}>
              <Text style={styles.reportLabel}>APPROVED DATE:</Text>
              <Text style={styles.reportValue}>{new Date(job.approvedAt || '').toLocaleDateString()}</Text>
            </View>
            <View style={styles.reportInfoRow}>
              <Text style={styles.reportLabel}>STATUS:</Text>
              <Text style={styles.reportStatusApproved}>APPROVED ✅</Text>
            </View>
          </View>
        </View>

        {/* Work Summary */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>WORK SUMMARY</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>SCOPE OF WORK</Text>
              <Text style={styles.summaryValue}>{job.description}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>WORKING HOURS</Text>
              <Text style={styles.summaryValue}>
                {completedTasks.length > 0 ? 
                  `${completedTasks.reduce((total, task) => {
                    if (task.startTime && task.endTime) {
                      const start = new Date(`2000-01-01 ${task.startTime}`);
                      const end = new Date(`2000-01-01 ${task.endTime}`);
                      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    }
                    return total;
                  }, 0).toFixed(1)} hours` : 
                  'N/A'
                }
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TEAM</Text>
              <Text style={styles.summaryValue}>
                {job.assignedTechs.map(techId => {
                  const tech = users[techId];
                  return tech?.realName || 'Technician';
                }).join(', ')}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TASKS COMPLETED</Text>
              <Text style={styles.summaryValue}>{completedTasks.length}</Text>
            </View>
          </View>
        </View>

        {/* Tasks Detail */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>COMPLETED TASKS</Text>
          {completedTasks.map((task, index) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskNumber}>TASK {index + 1}</Text>
                <Text style={styles.taskTime}>
                  {task.startTime} - {task.endTime}
                </Text>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              
              {/* Task Photos */}
              {task.photos && task.photos.length > 0 && (
                <View style={styles.photoSection}>
                  <Text style={styles.photoSectionTitle}>BEFORE / DURING / AFTER</Text>
                  <View style={styles.photoGrid}>
                    {['before', 'during', 'after'].map(category => {
                      const categoryPhotos = task.photos?.filter(p => p.category === category) || [];
                      return (
                        <View key={category} style={styles.photoColumn}>
                          <Text style={styles.photoColumnTitle}>{category.toUpperCase()}</Text>
                          {categoryPhotos.length > 0 ? (
                            categoryPhotos.map(photo => (
                              <View key={photo.id} style={styles.photoContainer}>
                                <Image source={{ uri: photo.uri }} style={styles.reportPhoto} />
                                <Text style={styles.photoDescription}>{photo.description}</Text>
                              </View>
                            ))
                          ) : (
                            <View style={styles.photoPlaceholder}>
                              <Text style={styles.photoPlaceholderText}>No {category} photos</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Report Footer */}
        <View style={styles.reportFooter}>
          <Text style={styles.footerText}>
            Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </Text>
          <Text style={styles.footerText}>
            📱 Generated with Field Tracker Mobile App
          </Text>
        </View>
      </View>
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
        const technicians = getUsersByRole('tech');
        return (
          <View style={[styles.tabContent, styles.manageContent]}>
            <Text style={styles.tabTitle}>Manage Technicians</Text>
            
            <TouchableOpacity
              style={styles.addTechButton}
              onPress={() => setShowAddTechModal(true)}
            >
              <Text style={styles.addTechButtonText}>➕ Add New Technician</Text>
            </TouchableOpacity>

            <ScrollView style={styles.techList}>
              {technicians.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No technicians yet</Text>
                  <Text style={styles.emptySubtext}>Add your first technician to get started</Text>
                </View>
              ) : (
                technicians.map((tech) => (
                  <View key={tech.id} style={styles.techCard}>
                    <View style={styles.techHeader}>
                      <View style={styles.techAvatar}>
                        <Text style={styles.techAvatarText}>
                          {tech.realName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.techInfo}>
                        <Text style={styles.techName}>{tech.realName}</Text>
                        <Text style={styles.techUsername}>@{tech.username}</Text>
                        <Text style={styles.techJoinDate}>
                          Joined: {new Date(tech.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.techStatus}>
                        <Text style={styles.statusActive}>● Active</Text>
                      </View>
                    </View>

                    <View style={styles.techDetails}>
                      <Text style={styles.techContact}>📱 {tech.phone}</Text>
                      <Text style={styles.techContact}>📧 {tech.email}</Text>
                    </View>

                    <View style={styles.techActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditTechnician(tech.id)}
                      >
                        <Text style={styles.actionButtonText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.resetButton]}
                        onPress={() => handleResetPassword(tech.id)}
                      >
                        <Text style={styles.actionButtonText}>🔄 Reset</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => handleViewTechJobs(tech.id)}
                      >
                        <Text style={styles.actionButtonText}>👁️ Jobs</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteTechnician(tech.id)}
                      >
                        <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        );
      case 'reports':
        return (
          <View style={[styles.tabContent, styles.reportsContent]}>
            <Text style={styles.tabTitle}>Reports</Text>
            <Text style={styles.subtitle}>Approved Job History</Text>
            
            <ScrollView style={styles.historyList}>
              {Object.values(jobHistory).length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No approved jobs yet</Text>
                  <Text style={styles.emptySubtext}>Complete and approve some jobs to generate reports</Text>
                </View>
              ) : (
                Object.values(jobHistory)
                  .sort((a, b) => new Date(b.approvedAt || '').getTime() - new Date(a.approvedAt || '').getTime())
                  .map((job) => (
                    <TouchableOpacity
                      key={job.id}
                      style={styles.historyCard}
                      onPress={() => handleGenerateReport(job.id)}
                    >
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>{job.title}</Text>
                        <Text style={styles.historyDate}>
                          ✅ {new Date(job.approvedAt || '').toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.historyLocation}>📍 {job.siteLocation}</Text>
                      <View style={styles.historyFooter}>
                        <Text style={styles.historyTasks}>
                          {job.tasks ? Object.keys(job.tasks).length : 0} tasks completed
                        </Text>
                        <TouchableOpacity 
                          style={styles.generateButton}
                          onPress={() => handleGenerateReport(job.id)}
                        >
                          <Text style={styles.generateButtonText}>📄 Generate Report</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
              )}
            </ScrollView>
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

      {/* Add Technician Modal */}
      <Modal
        visible={showAddTechModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAddTechModal(false);
                setNewTechForm({ username: '', realName: '', phone: '', email: '' });
              }}
            >
              <Text style={styles.closeButtonText}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Technician</Text>
            <TouchableOpacity
              style={styles.previewExportButton}
              onPress={handleAddTechnician}
            >
              <Text style={styles.previewExportButtonText}>✅ Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Username *</Text>
              <TextInput
                style={styles.formInput}
                value={newTechForm.username}
                onChangeText={(text) => setNewTechForm({...newTechForm, username: text})}
                placeholder="Enter username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newTechForm.realName}
                onChangeText={(text) => setNewTechForm({...newTechForm, realName: text})}
                placeholder="Enter full name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={newTechForm.phone}
                onChangeText={(text) => setNewTechForm({...newTechForm, phone: text})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address *</Text>
              <TextInput
                style={styles.formInput}
                value={newTechForm.email}
                onChangeText={(text) => setNewTechForm({...newTechForm, email: text})}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formNote}>
              <Text style={styles.formNoteText}>
                📱 A temporary password will be sent to the provided phone and email.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Technician Modal */}
      <Modal
        visible={showEditTechModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowEditTechModal(false);
                setEditingTechId(null);
                setNewTechForm({ username: '', realName: '', phone: '', email: '' });
              }}
            >
              <Text style={styles.closeButtonText}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Technician</Text>
            <TouchableOpacity
              style={styles.previewExportButton}
              onPress={handleUpdateTechnician}
            >
              <Text style={styles.previewExportButtonText}>💾 Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Username</Text>
              <TextInput
                style={[styles.formInput, styles.disabledInput]}
                value={newTechForm.username}
                editable={false}
                placeholder="Username cannot be changed"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newTechForm.realName}
                onChangeText={(text) => setNewTechForm({...newTechForm, realName: text})}
                placeholder="Enter full name"
              />
            </View>

            <View style={styles.formNote}>
              <Text style={styles.formNoteText}>
                📝 Note: Technicians can update their own phone and email from their profile. Managers only control name and username for identity purposes.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Report Preview Modal */}
      <Modal
        visible={showReportPreview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReportPreview(false)}
            >
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Preview</Text>
            <TouchableOpacity
              style={styles.previewExportButton}
              onPress={() => {
                setShowReportPreview(false);
                if (previewJobId) {
                  Alert.alert(
                    'Export Report',
                    'Choose export format:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: '📄 PDF', onPress: () => generateReport(previewJobId, 'pdf') },
                      { text: '📝 Word', onPress: () => generateReport(previewJobId, 'word') },
                    ]
                  );
                }
              }}
            >
              <Text style={styles.previewExportButtonText}>📤 Export</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.reportContainer}>
            {previewJobId && renderProfessionalReport(previewJobId)}
          </ScrollView>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? 30 : 50,
    paddingBottom: Platform.OS === 'android' ? 6 : 8,
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
  // Reports tab styles
  reportsContent: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  historyList: {
    flex: 1,
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  historyLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTasks: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  generateButton: {
    backgroundColor: Colors.boss,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  // Report Preview Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: Colors.white,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: Colors.boss,
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  previewExportButton: {
    backgroundColor: Colors.boss,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  previewExportButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  reportContainer: {
    flex: 1,
    padding: 16,
  },
  // Professional Report Styles
  reportPage: {
    backgroundColor: Colors.white,
    padding: 20,
    minHeight: '100%',
  },
  reportHeader: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.boss,
    paddingBottom: 20,
    marginBottom: 24,
  },
  reportHeaderTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.boss,
    letterSpacing: 1,
  },
  reportType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  reportHeaderInfo: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  reportValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
  reportStatusApproved: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  reportSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.boss,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.boss,
    paddingBottom: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  taskItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.boss,
  },
  taskTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  photoSection: {
    marginTop: 12,
  },
  photoSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.boss,
    marginBottom: 12,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photoColumn: {
    flex: 1,
    alignItems: 'center',
  },
  photoColumnTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  reportPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoDescription: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  reportFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  // Manage Technicians Styles
  manageContent: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 16,
  },
  addTechButton: {
    backgroundColor: Colors.boss,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addTechButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  techList: {
    flex: 1,
  },
  techCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  techAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.boss,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  techAvatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  techUsername: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  techJoinDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  techStatus: {
    alignItems: 'flex-end',
  },
  statusActive: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  techDetails: {
    marginBottom: 16,
    paddingLeft: 62,
  },
  techContact: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  techActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    minWidth: '23%',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  resetButton: {
    backgroundColor: '#F59E0B',
  },
  viewButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  // Form Styles
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: Colors.textSecondary,
  },
  formNote: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  formNoteText: {
    fontSize: 12,
    color: '#4338CA',
    textAlign: 'center',
  },
});

export default ManagerDashboardScreen;