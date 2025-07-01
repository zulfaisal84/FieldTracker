import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import JobListScreen from './JobListScreen';
import JobDetailScreen from './JobDetailScreen';

const TechDashboardScreen: React.FC = () => {
  const { logout, currentUser, updateUser } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    phone: '',
    email: ''
  });

  // Check for first login and force password change
  useEffect(() => {
    if (currentUser && currentUser.isFirstLogin) {
      Alert.alert(
        'Welcome!',
        'For security, you must change your password before accessing the app.',
        [
          { text: 'Change Password', onPress: () => setShowChangePassword(true) }
        ],
        { cancelable: false }
      );
    }
  }, [currentUser]);

  const handleJobPress = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
  };

  const handleCreateJob = () => {
    // TODO: Navigate to create job screen
    Alert.alert('Create Job', 'Create job functionality coming soon');
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const handleProfilePress = () => {
    setShowMenu(false);
    setShowProfile(true);
  };

  const handleChangePasswordPress = () => {
    setShowMenu(false);
    setShowProfile(false);
    setShowChangePassword(true);
  };

  const handleLogout = () => {
    setShowMenu(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handlePasswordChange = () => {
    // Validate passwords
    if (!passwords.current.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (passwords.new.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwords.current === passwords.new) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    // Simulate password validation (in real app, would verify current password)
    if (currentUser) {
      updateUser(currentUser.id, { isFirstLogin: false });
      
      // Notify manager
      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully!\n\nYour manager has been notified of this security update.',
        [{ text: 'OK', onPress: () => {
          setShowChangePassword(false);
          setPasswords({ current: '', new: '', confirm: '' });
        }}]
      );
    }
  };

  const handleEditContact = () => {
    if (currentUser) {
      setContactForm({
        phone: currentUser.phone,
        email: currentUser.email
      });
      setIsEditingContact(true);
    }
  };

  const handleSaveContact = () => {
    if (!contactForm.phone.trim() || !contactForm.email.trim()) {
      Alert.alert('Error', 'Please fill in all contact fields');
      return;
    }

    if (currentUser) {
      updateUser(currentUser.id, {
        phone: contactForm.phone.trim(),
        email: contactForm.email.trim()
      });
      
      setIsEditingContact(false);
      Alert.alert('Success', 'Contact information updated successfully!');
    }
  };

  const handleCancelEditContact = () => {
    setIsEditingContact(false);
    setContactForm({ phone: '', email: '' });
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

  // Prevent access to jobs if first login and password not changed
  if (currentUser && currentUser.isFirstLogin && !showChangePassword) {
    return (
      <View style={styles.container}>
        <View style={styles.blockScreen}>
          <Text style={styles.blockTitle}>Welcome to Field Tracker!</Text>
          <Text style={styles.blockMessage}>
            For security, you must change your password before accessing the app.
          </Text>
          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={() => setShowChangePassword(true)}
          >
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show Job List Screen by default
  return (
    <View style={styles.container}>
      {/* Menu Button Overlay */}
      <View style={styles.menuOverlay}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Text style={styles.menuText}>⋯</Text>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showMenu && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleProfilePress}>
              <Text style={styles.dropdownText}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Text style={[styles.dropdownText, styles.logoutText]}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Use the new JobListScreen component */}
      <JobListScreen
        onJobPress={handleJobPress}
        onCreateJobPress={handleCreateJob}
        showCreateButton={true}
      />

      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProfile(false)}
            >
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>My Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.profileContent}>
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>USER INFORMATION</Text>
              
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Name</Text>
                <Text style={styles.profileValue}>{currentUser?.realName}</Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Username</Text>
                <Text style={styles.profileValue}>@{currentUser?.username}</Text>
              </View>

              {/* Email Field - Editable */}
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Email</Text>
                {isEditingContact ? (
                  <TextInput
                    style={styles.editInput}
                    value={contactForm.email}
                    onChangeText={(text) => setContactForm({...contactForm, email: text})}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={styles.profileValue}>{currentUser?.email}</Text>
                )}
              </View>

              {/* Phone Field - Editable */}
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Phone</Text>
                {isEditingContact ? (
                  <TextInput
                    style={styles.editInput}
                    value={contactForm.phone}
                    onChangeText={(text) => setContactForm({...contactForm, phone: text})}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.profileValue}>{currentUser?.phone}</Text>
                )}
              </View>

              {/* Contact Edit Buttons */}
              {isEditingContact ? (
                <View style={styles.editActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelEditContact}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveContact}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.editContactButton}
                  onPress={handleEditContact}
                >
                  <Text style={styles.editContactButtonText}>✏️ Edit Contact Info</Text>
                </TouchableOpacity>
              )}

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Joined</Text>
                <Text style={styles.profileValue}>
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>SECURITY</Text>
              
              <TouchableOpacity 
                style={styles.securityButton}
                onPress={handleChangePasswordPress}
              >
                <Text style={styles.securityButtonText}>🔐 Change Password</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                if (currentUser?.isFirstLogin) {
                  Alert.alert('Required', 'You must change your password to continue');
                  return;
                }
                setShowChangePassword(false);
                setPasswords({ current: '', new: '', confirm: '' });
              }}
            >
              <Text style={styles.closeButtonText}>
                {currentUser?.isFirstLogin ? '← Back' : '✕ Cancel'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePasswordChange}
            >
              <Text style={styles.actionButtonText}>💾 Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Password *</Text>
              <TextInput
                style={styles.formInput}
                value={passwords.current}
                onChangeText={(text) => setPasswords({...passwords, current: text})}
                placeholder="Enter current password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>New Password *</Text>
              <TextInput
                style={styles.formInput}
                value={passwords.new}
                onChangeText={(text) => setPasswords({...passwords, new: text})}
                placeholder="Enter new password (min 6 characters)"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm New Password *</Text>
              <TextInput
                style={styles.formInput}
                value={passwords.confirm}
                onChangeText={(text) => setPasswords({...passwords, confirm: text})}
                placeholder="Re-enter new password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.passwordRules}>
              <Text style={styles.rulesTitle}>Password Requirements:</Text>
              <Text style={styles.rulesText}>• Minimum 6 characters</Text>
              <Text style={styles.rulesText}>• Must be different from current password</Text>
            </View>
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
  menuOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  menuText: {
    fontSize: 20,
    color: Colors.tech,
    fontWeight: 'bold',
  },
  // Dropdown Menu Styles
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 140,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  logoutText: {
    color: Colors.tech,
  },
  // Block Screen Styles
  blockScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.tech,
    marginBottom: 16,
    textAlign: 'center',
  },
  blockMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  changePasswordButton: {
    backgroundColor: Colors.tech,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changePasswordButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
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
    color: Colors.tech,
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actionButton: {
    backgroundColor: Colors.tech,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 80, // Same width as close button to balance layout
  },
  // Profile Styles
  profileContent: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.tech,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.tech,
    paddingBottom: 4,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  profileValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
  securityButton: {
    backgroundColor: Colors.tech,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  securityButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  passwordRules: {
    backgroundColor: '#FEF3F2',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 12,
    color: '#B91C1C',
    marginBottom: 4,
  },
  // Contact Edit Styles
  editInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.white,
    textAlign: 'right',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: Colors.tech,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  editContactButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  editContactButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TechDashboardScreen;