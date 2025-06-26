import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { User, Job, Notification, AppState, UserRole, JobStatus } from '../types';

interface AppContextType extends AppState {
  // Authentication
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  
  // User Management
  createTech: (username: string, realName: string, phone: string, email: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  
  // Job Management
  createJob: (title: string, siteLocation: string, description: string, assignedTechs: string[]) => string;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  startJob: (jobId: string) => void;
  completeJob: (jobId: string) => boolean;
  submitJob: (jobId: string) => void;
  approveJob: (jobId: string) => void;
  rejectJob: (jobId: string, reason: string) => void;
  
  // Task Management
  addTask: (jobId: string, description: string, date: string, startTime: string, endTime: string) => string;
  updateTask: (jobId: string, taskId: string, updates: any) => void;
  
  // Notifications
  addNotification: (userId: string, title: string, message: string, type: any, jobId?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  
  // Utility
  getJobsForUser: (userId: string) => Job[];
  getAllJobs: () => Job[];
  getUsersByRole: (role: UserRole) => User[];
}

const AppContext = createContext<AppContextType | null>(null);

// Mock Data for Demo
const createMockData = () => {
  const users = {
    'boss1': {
      id: 'boss1',
      username: 'manager',
      role: 'boss' as UserRole,
      realName: 'John Manager',
      phone: '+1234567890',
      email: 'manager@company.com',
      createdAt: '2024-01-01',
      isFirstLogin: false,
    },
    'tech1': {
      id: 'tech1',
      username: 'tech1',
      role: 'tech' as UserRole,
      realName: 'Mike Technician',
      phone: '+1234567891',
      email: 'mike@company.com',
      createdAt: '2024-01-02',
      isFirstLogin: false,
    },
    'tech2': {
      id: 'tech2',
      username: 'tech2',
      role: 'tech' as UserRole,
      realName: 'Sarah Tech',
      phone: '+1234567892',
      email: 'sarah@company.com',
      createdAt: '2024-01-03',
      isFirstLogin: false,
    },
  };

  // Mock Jobs for Demo
  const jobs = {
    'job1': {
      id: 'job1',
      title: 'KLCC Tower 1 - Machine 1 Electrical Works',
      siteLocation: 'KLCC Tower 1, Level 23',
      description: 'Routine maintenance and inspection of electrical systems in machine room 1. Check wiring, replace faulty components, and update maintenance logs.',
      status: 'Created' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech1', 'tech2'],
      createdAt: '2024-12-25T09:00:00.000Z',
      tasks: [],
      pendingTasks: [],
    },
    'job2': {
      id: 'job2',
      title: 'Pavilion Mall - HVAC System Repair',
      siteLocation: 'Pavilion Mall, Basement 2',
      description: 'Emergency repair of HVAC unit in main server room. System overheating reported by facility management.',
      status: 'In Progress' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech1'],
      createdAt: '2024-12-24T14:30:00.000Z',
      startedAt: '2024-12-25T08:00:00.000Z',
      tasks: [
        {
          id: 'task1',
          description: 'Diagnosed cooling system failure',
          startTime: '08:00 AM',
          endTime: '09:30 AM',
          date: '25/12/2024',
          isCompleted: true,
          beforePhoto: 'mock_photo_1.jpg',
          afterPhoto: 'mock_photo_2.jpg',
        }
      ],
      pendingTasks: ['Replace damaged cooling coils'],
    },
    'job3': {
      id: 'job3',
      title: 'Suria KLCC - Fire Safety System Check',
      siteLocation: 'Suria KLCC, Multiple Floors',
      description: 'Monthly fire safety system inspection and testing. Verify all smoke detectors, fire alarms, and emergency exits are functioning properly.',
      status: 'Submitted' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech2'],
      createdAt: '2024-12-23T10:00:00.000Z',
      startedAt: '2024-12-24T09:00:00.000Z',
      completedAt: '2024-12-24T16:00:00.000Z',
      submittedAt: '2024-12-24T16:30:00.000Z',
      tasks: [
        {
          id: 'task2',
          description: 'Tested Level 1-5 smoke detectors',
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          date: '24/12/2024',
          isCompleted: true,
          beforePhoto: 'mock_photo_3.jpg',
          afterPhoto: 'mock_photo_4.jpg',
        },
        {
          id: 'task3',
          description: 'Checked emergency exit lighting',
          startTime: '01:00 PM',
          endTime: '04:00 PM',
          date: '24/12/2024',
          isCompleted: true,
          beforePhoto: 'mock_photo_5.jpg',
          afterPhoto: 'mock_photo_6.jpg',
        }
      ],
      pendingTasks: [],
    },
    'job4': {
      id: 'job4',
      title: 'TRX Tower - Network Infrastructure Setup',
      siteLocation: 'TRX Tower, IT Floor 45',
      description: 'Install and configure new network switches and routers for expanded office space. Cable management and testing required.',
      status: 'Rejected' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech1'],
      createdAt: '2024-12-22T11:00:00.000Z',
      startedAt: '2024-12-23T08:00:00.000Z',
      completedAt: '2024-12-23T17:00:00.000Z',
      submittedAt: '2024-12-23T17:30:00.000Z',
      rejectionReason: 'Cable management not up to standard. Please redo cable routing and labeling according to company guidelines.',
      tasks: [
        {
          id: 'task4',
          description: 'Installed network switches',
          startTime: '08:00 AM',
          endTime: '05:00 PM',
          date: '23/12/2024',
          isCompleted: true,
          beforePhoto: 'mock_photo_7.jpg',
          afterPhoto: 'mock_photo_8.jpg',
        }
      ],
      pendingTasks: [],
    },
  };

  return { users, jobs, notifications: {} };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mockData = createMockData();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState(mockData.users);
  const [jobs, setJobs] = useState<{ [key: string]: Job }>(mockData.jobs);
  const [notifications, setNotifications] = useState<{ [key: string]: Notification }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Authentication
  const login = (username: string, password: string, role: UserRole): boolean => {
    // For demo purposes: any non-empty username and password combination works
    if (username.trim() && password.trim()) {
      // Check if user exists, if not create a demo user
      let user = Object.values(users).find(u => u.username === username && u.role === role);
      
      if (!user) {
        // Create demo user on the fly
        const newUser: User = {
          id: `${role}_${Date.now()}`,
          username: username.trim(),
          role: role,
          realName: role === 'boss' ? 'Demo Manager' : 'Demo Technician',
          phone: '+1234567890',
          email: `${username}@demo.com`,
          createdAt: new Date().toISOString(),
          isFirstLogin: false,
        };
        
        setUsers(prev => ({ ...prev, [newUser.id]: newUser }));
        user = newUser;
      }
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // User Management
  const createTech = (username: string, realName: string, phone: string, email: string) => {
    const newTech: User = {
      id: `tech_${Date.now()}`,
      username,
      role: 'tech',
      realName,
      phone,
      email,
      createdAt: new Date().toISOString(),
      isFirstLogin: true,
    };
    
    setUsers(prev => ({ ...prev, [newTech.id]: newTech }));
    
    // Notify the new tech
    addNotification(
      newTech.id,
      'Welcome to Field Tracker',
      'Your account has been created. Please change your password on first login.',
      'job_assigned'
    );
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => ({
      ...prev,
      [userId]: { ...prev[userId], ...updates }
    }));
  };

  // Job Management
  const createJob = (title: string, siteLocation: string, description: string, assignedTechs: string[]): string => {
    const jobId = `job_${Date.now()}`;
    const newJob: Job = {
      id: jobId,
      title,
      siteLocation,
      description,
      status: 'Created',
      createdBy: currentUser?.id || '',
      assignedTechs,
      createdAt: new Date().toISOString(),
      tasks: [],
      pendingTasks: [],
    };

    setJobs(prev => ({ ...prev, [jobId]: newJob }));

    // Notify assigned techs
    assignedTechs.forEach(techId => {
      addNotification(
        techId,
        'New Job Assigned',
        `You have been assigned to: ${title}`,
        'job_assigned',
        jobId
      );
    });

    return jobId;
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], status }
    }));
  };

  const startJob = (jobId: string) => {
    const job = jobs[jobId];
    if (job && job.status === 'Created') {
      setJobs(prev => ({
        ...prev,
        [jobId]: {
          ...prev[jobId],
          status: 'In Progress',
          startedAt: new Date().toISOString()
        }
      }));

      // Notify boss and other techs
      addNotification(
        job.createdBy,
        'Job Started',
        `${job.title} has been started`,
        'job_started',
        jobId
      );

      Alert.alert('Success', 'Job started successfully!');
    }
  };

  const completeJob = (jobId: string): boolean => {
    const job = jobs[jobId];
    if (!job) return false;

    // Validate all tasks have required photos
    const incompleteTasks = job.tasks.filter(task => 
      !task.beforePhoto || !task.afterPhoto || !task.description || !task.endTime
    );

    if (incompleteTasks.length > 0) {
      Alert.alert(
        'Incomplete Tasks',
        `Please complete all required fields for ${incompleteTasks.length} task(s)`
      );
      return false;
    }

    setJobs(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        status: 'Completed',
        completedAt: new Date().toISOString()
      }
    }));

    return true;
  };

  const submitJob = (jobId: string) => {
    const job = jobs[jobId];
    if (job && job.status === 'Completed') {
      setJobs(prev => ({
        ...prev,
        [jobId]: {
          ...prev[jobId],
          status: 'Submitted',
          submittedAt: new Date().toISOString()
        }
      }));

      // Notify boss
      addNotification(
        job.createdBy,
        'Job Submitted',
        `${job.title} has been submitted for approval`,
        'job_submitted',
        jobId
      );

      Alert.alert('Success', 'Job submitted for approval!');
    }
  };

  const approveJob = (jobId: string) => {
    const job = jobs[jobId];
    if (job) {
      setJobs(prev => ({
        ...prev,
        [jobId]: {
          ...prev[jobId],
          status: 'Approved',
          approvedAt: new Date().toISOString()
        }
      }));

      // Notify all assigned techs
      job.assignedTechs.forEach(techId => {
        addNotification(
          techId,
          'Job Approved',
          `${job.title} has been approved`,
          'job_approved',
          jobId
        );
      });

      Alert.alert('Success', 'Job approved successfully!');
    }
  };

  const rejectJob = (jobId: string, reason: string) => {
    const job = jobs[jobId];
    if (job) {
      setJobs(prev => ({
        ...prev,
        [jobId]: {
          ...prev[jobId],
          status: 'Rejected',
          rejectionReason: reason
        }
      }));

      // Notify all assigned techs
      job.assignedTechs.forEach(techId => {
        addNotification(
          techId,
          'Job Rejected',
          `${job.title} was rejected: ${reason}`,
          'job_rejected',
          jobId
        );
      });

      Alert.alert('Job Rejected', 'Technicians have been notified');
    }
  };

  // Task Management
  const addTask = (jobId: string, description: string, date: string, startTime: string, endTime: string): string => {
    const taskId = `task_${Date.now()}`;
    const task = {
      id: taskId,
      description,
      startTime,
      endTime,
      date,
      isCompleted: false,
    };

    setJobs(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        tasks: [...prev[jobId].tasks, task]
      }
    }));

    return taskId;
  };

  const updateTask = (jobId: string, taskId: string, updates: any) => {
    setJobs(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        tasks: prev[jobId].tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      }
    }));
  };

  // Notifications
  const addNotification = (userId: string, title: string, message: string, type: any, jobId?: string) => {
    const notificationId = `notif_${Date.now()}_${Math.random()}`;
    const notification: Notification = {
      id: notificationId,
      userId,
      title,
      message,
      type,
      jobId,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => ({ ...prev, [notificationId]: notification }));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => ({
      ...prev,
      [notificationId]: { ...prev[notificationId], isRead: true }
    }));
  };

  // Utility functions
  const getJobsForUser = (userId: string): Job[] => {
    return Object.values(jobs).filter(job => 
      job.assignedTechs.includes(userId) || job.createdBy === userId
    );
  };

  const getAllJobs = (): Job[] => {
    return Object.values(jobs);
  };

  const getUsersByRole = (role: UserRole): User[] => {
    return Object.values(users).filter(user => user.role === role);
  };

  const contextValue: AppContextType = {
    currentUser,
    users,
    jobs,
    notifications,
    isLoggedIn,
    login,
    logout,
    createTech,
    updateUser,
    createJob,
    updateJobStatus,
    startJob,
    completeJob,
    submitJob,
    approveJob,
    rejectJob,
    addTask,
    updateTask,
    addNotification,
    markNotificationRead,
    getJobsForUser,
    getAllJobs,
    getUsersByRole,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};