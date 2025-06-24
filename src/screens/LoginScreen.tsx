import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('tech');
  const { login } = useApp();

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = login(username.trim(), password.trim(), selectedRole);
    if (success) {
      onLoginSuccess();
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };

  const getRoleButtonStyle = (role: UserRole) => [
    styles.roleButton,
    selectedRole === role ? styles.roleButtonActive : null,
    role === 'tech' ? styles.techButton : styles.bossButton,
    selectedRole === role && role === 'tech' ? styles.techButtonActive : null,
    selectedRole === role && role === 'boss' ? styles.bossButtonActive : null,
  ];

  const getRoleTextStyle = (role: UserRole) => [
    styles.roleText,
    selectedRole === role && role === 'tech' ? styles.techTextActive : null,
    selectedRole === role && role === 'boss' ? styles.bossTextActive : null,
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Field Tracker</Text>
        <Text style={styles.subtitle}>Professional Work Management</Text>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        
        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={getRoleButtonStyle('tech')}
            onPress={() => setSelectedRole('tech')}
          >
            <Text style={getRoleTextStyle('tech')}>
              👷 Technician
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getRoleButtonStyle('boss')}
            onPress={() => setSelectedRole('boss')}
          >
            <Text style={getRoleTextStyle('boss')}>
              👔 Manager
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor={Colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[
            styles.loginButton,
            selectedRole === 'tech' ? styles.techLoginButton : styles.bossLoginButton
          ]} 
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>
            Login as {selectedRole === 'tech' ? 'Technician' : 'Manager'}
          </Text>
        </TouchableOpacity>

        {/* Demo Credentials Hint */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintTitle}>Demo Credentials:</Text>
          <Text style={styles.hintText}>Tech: username "tech1" or "tech2", any password</Text>
          <Text style={styles.hintText}>Manager: username "manager", any password</Text>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    flex: 1,
    paddingHorizontal: 32,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  roleButtonActive: {
    // Active state handled by specific role colors
  },
  techButton: {
    // Base tech button style
  },
  bossButton: {
    // Base boss button style
  },
  techButtonActive: {
    backgroundColor: Colors.tech, // Red for tech
  },
  bossButtonActive: {
    backgroundColor: Colors.boss, // Black for boss
  },
  roleText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  techTextActive: {
    color: Colors.white, // White text on red background
  },
  bossTextActive: {
    color: Colors.white, // White text on black background
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  techLoginButton: {
    backgroundColor: Colors.tech, // Red for tech login
  },
  bossLoginButton: {
    backgroundColor: Colors.boss, // Black for boss login
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  hintContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});

export default LoginScreen;