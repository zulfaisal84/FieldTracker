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
  validateJobCompletion: (jobId: string) => { isValid: boolean; message: string };
  completeJob: (jobId: string) => boolean;
  submitJob: (jobId: string) => void;
  approveJob: (jobId: string) => void;
  rejectJob: (jobId: string, reason: string) => void;
  cancelJob: (jobId: string) => void;
  
  // Task Management
  addTask: (jobId: string, description: string, date: string, startTime: string, endTime: string) => string;
  updateTask: (jobId: string, taskId: string, updates: any) => void;
  addPendingTask: (jobId: string, description: string) => void;
  updateTaskStatus: (jobId: string, taskId: string, taskData: any) => void;
  cancelTask: (jobId: string, taskId: string, reason?: string) => void;
  
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

  // Mock Jobs for Demo - Fresh Set
  const jobs = {
    'job1': {
      id: 'job1',
      title: 'KLCC Tower 1 - Machine 1 Electrical Works',
      siteLocation: 'KLCC Tower 1, Level 23',
      description: 'Routine maintenance and inspection of electrical systems in machine room 1. Check wiring, replace faulty components, and update maintenance logs.',
      status: 'Created' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech1', 'tech2'],
      createdAt: '2024-12-26T09:00:00.000Z',
      tasks: [],
    },
    'job2': {
      id: 'job2',
      title: 'Pavilion Mall - HVAC System Repair',
      siteLocation: 'Pavilion Mall, Basement 2',
      description: 'Emergency repair of HVAC unit in main server room. System overheating reported by facility management.',
      status: 'Created' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech1'],
      createdAt: '2024-12-26T10:30:00.000Z',
      tasks: [],
    },
    'job3': {
      id: 'job3',
      title: 'Suria KLCC - Fire Safety System Check',
      siteLocation: 'Suria KLCC, Multiple Floors',
      description: 'Monthly fire safety system inspection and testing. Verify all smoke detectors, fire alarms, and emergency exits are functioning properly.',
      status: 'In Progress' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech2'],
      createdAt: '2024-12-25T10:00:00.000Z',
      startedAt: '2024-12-26T09:00:00.000Z',
      tasks: [
        {
          id: 'task1',
          description: 'Check emergency exit lighting',
          status: 'pending' as const,
          sessions: [],
        },
        {
          id: 'task2',
          description: 'Tested Level 1-5 smoke detectors',
          status: 'completed' as const,
          sessions: [
            {
              id: 'session1',
              date: '26/12/2024',
              startTime: '09:00 AM',
              endTime: '12:00 PM',
              isActive: false,
            }
          ],
          beforePhoto: 'mock_photo_3.jpg',
          afterPhoto: 'mock_photo_4.jpg',
        },
        {
          id: 'task3',
          description: 'Test fire alarm systems',
          status: 'pending' as const,
          sessions: [],
        }
      ],
    },
    'job4': {
      id: 'job4',
      title: 'TRX Tower - Network Infrastructure Setup',
      siteLocation: 'TRX Tower, IT Floor 45',
      description: 'Install and configure new network switches and routers for expanded office space. Cable management and testing required.',
      status: 'Submitted' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech1'],
      createdAt: '2024-12-24T11:00:00.000Z',
      startedAt: '2024-12-25T08:00:00.000Z',
      completedAt: '2024-12-25T17:00:00.000Z',
      submittedAt: '2024-12-25T17:30:00.000Z',
      tasks: [
        {
          id: 'task4',
          description: 'Installed network switches',
          status: 'completed' as const,
          sessions: [
            {
              id: 'session2',
              date: '25/12/2024',
              startTime: '08:00 AM',
              endTime: '12:00 PM',
              isActive: false,
            }
          ],
          beforePhoto: 'mock_photo_7.jpg',
          afterPhoto: 'mock_photo_8.jpg',
        },
        {
          id: 'task5',
          description: 'Configured router settings',
          status: 'completed' as const,
          sessions: [
            {
              id: 'session3',
              date: '25/12/2024',
              startTime: '01:00 PM',
              endTime: '05:00 PM',
              isActive: false,
            }
          ],
          beforePhoto: 'mock_photo_9.jpg',
          afterPhoto: 'mock_photo_10.jpg',
        }
      ],
    },
    'job5': {
      id: 'job5',
      title: 'Menara TM - Server Room Cooling',
      siteLocation: 'Menara TM, Level 12',
      description: 'Urgent repair of main server room air conditioning unit. Temperature monitoring shows overheating in critical server racks.',
      status: 'Created' as JobStatus,
      createdBy: 'boss1',
      assignedTechs: ['tech2'],
      createdAt: '2024-12-26T11:15:00.000Z',
      tasks: [],
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
      // Check if there's at least 1 pending task
      const pendingTasks = job.tasks.filter(task => task.status === 'pending');
      if (pendingTasks.length === 0) {
        Alert.alert(
          'Cannot Start Job',
          'Please add at least one task before starting the job. Use the "Add Task" button to add your first task.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

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

      Alert.alert('Success', 'Job started! You can now add tasks and track progress.');
    }
  };

  // New function to validate if all tasks are ready for submission (without changing job status)
  const validateJobCompletion = (jobId: string): { isValid: boolean; message: string } => {
    const job = jobs[jobId];
    if (!job) return { isValid: false, message: 'Job not found' };

    // Step 1: Get active (non-cancelled) tasks
    const activeTasks = job.tasks.filter(task => task.status !== 'cancelled');
    
    // Step 2: Block if no active tasks (all cancelled)
    if (activeTasks.length === 0) {
      return { 
        isValid: false, 
        message: 'All tasks cancelled. Please contact manager to cancel this job if no work is needed.' 
      };
    }
    
    // Step 3: Check if at least 1 active task is completed
    const completedActiveTasks = activeTasks.filter(task => task.status === 'completed');
    if (completedActiveTasks.length === 0) {
      return {
        isValid: false,
        message: 'At least one active task must be completed before job completion.'
      };
    }
    
    // Step 4: Check remaining active tasks
    const incompleteActiveTasks = activeTasks.filter(task => task.status !== 'completed');
    if (incompleteActiveTasks.length > 0) {
      return {
        isValid: false,
        message: `${incompleteActiveTasks.length} active task(s) still need completion.`
      };
    }

    // Step 5: Validate photos/sessions for completed tasks only
    const tasksWithMissingData = completedActiveTasks.filter(task => {
      const beforePhotos = task.photos?.filter(p => p.category === 'before') || [];
      const afterPhotos = task.photos?.filter(p => p.category === 'after') || [];
      const completedSessions = task.sessions?.filter(s => !s.isActive) || [];
      
      return beforePhotos.length === 0 || afterPhotos.length === 0 || completedSessions.length === 0;
    });

    if (tasksWithMissingData.length > 0) {
      return { 
        isValid: false, 
        message: `${tasksWithMissingData.length} completed task(s) are missing required photos or work sessions.` 
      };
    }

    return { isValid: true, message: 'All active tasks completed successfully!' };
  };

  const completeJob = (jobId: string): boolean => {
    const validation = validateJobCompletion(jobId);
    
    if (!validation.isValid) {
      Alert.alert('Cannot Complete Job', validation.message);
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

  const cancelJob = (jobId: string) => {
    const job = jobs[jobId];
    if (job) {
      // Remove the job completely
      setJobs(prev => {
        const newJobs = { ...prev };
        delete newJobs[jobId];
        return newJobs;
      });

      // Notify all assigned techs
      job.assignedTechs.forEach(techId => {
        addNotification(
          techId,
          'Job Cancelled',
          `${job.title} has been cancelled by management`,
          'job_cancelled',
          jobId
        );
      });

      Alert.alert('Job Cancelled', 'Job has been cancelled and technicians have been notified');
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

  const addPendingTask = (jobId: string, description: string) => {
    const newTask = {
      id: `task_${Date.now()}`,
      description,
      status: 'pending' as const,
      sessions: [],
    };
    
    setJobs(prev => {
      const currentJob = prev[jobId];
      const updatedTasks = [...currentJob.tasks, newTask];
      
      // Calculate new job status (adding pending task shouldn't change status from Created)
      const newJobStatus = calculateJobStatus(updatedTasks, currentJob.status);
      
      return {
        ...prev,
        [jobId]: {
          ...currentJob,
          tasks: updatedTasks,
          status: newJobStatus
        }
      };
    });

    // Notify manager and other assigned techs about the new pending task
    const job = jobs[jobId];
    if (job) {
      // Notify manager
      addNotification(
        job.createdBy,
        'New Pending Task Added',
        `New task added to ${job.title}: ${description}`,
        'task_added',
        jobId
      );

      // Notify other assigned techs
      job.assignedTechs.forEach(techId => {
        if (techId !== currentUser?.id) {
          addNotification(
            techId,
            'Pending Task Added',
            `Your colleague added a task to ${job.title}: ${description}`,
            'task_added',
            jobId
          );
        }
      });
    }
  };

  // Helper function to calculate job status based on tasks (excluding cancelled tasks)
  const calculateJobStatus = (tasks: any[], currentStatus: JobStatus): JobStatus => {
    // Filter out cancelled tasks for status calculation
    const activeTasks = tasks.filter(task => task.status !== 'cancelled');
    
    if (!activeTasks || activeTasks.length === 0) {
      return 'Created'; // No active tasks = revert to created (clean slate)
    }

    const hasInProgressTasks = activeTasks.some(task => task.status === 'in_progress');
    const hasCompletedTasks = activeTasks.some(task => task.status === 'completed');

    // If already submitted/approved/rejected, don't change status
    if (['Submitted', 'Approved', 'Rejected'].includes(currentStatus)) {
      return currentStatus;
    }

    // If already completed, keep it completed (only manual "Complete Work" or "Submit Job" should change this)
    if (currentStatus === 'Completed') {
      return currentStatus;
    }

    // Determine status based on active task progress - but NEVER auto-complete the job
    if (hasInProgressTasks || hasCompletedTasks) {
      return 'In Progress';  // Job stays "In Progress" even if all tasks completed
    } else {
      return 'Created'; // All active tasks are pending
    }
  };

  const updateTaskStatus = (jobId: string, taskId: string, taskData: any) => {
    setJobs(prev => {
      const currentJob = prev[jobId];
      const updatedTasks = currentJob.tasks.map(task => {
        if (task.id === taskId) {
          const now = new Date().toISOString();
          const currentUserId = currentUser?.id || '';
          
          // Update activity tracking
          const newActivity = { ...task.activity };
          
          // Track when task starts (status changes from pending to in_progress)
          if (task.status === 'pending' && taskData.status === 'in_progress') {
            newActivity.startedBy = currentUserId;
            newActivity.startedAt = now;
          }
          
          // Track when task is completed
          if (task.status !== 'completed' && taskData.status === 'completed') {
            newActivity.completedBy = currentUserId;
            newActivity.completedAt = now;
          }
          
          // Track last save (always when updateTaskStatus is called)
          newActivity.lastSavedBy = currentUserId;
          newActivity.lastSavedAt = now;
          
          // Track edit if content changed (photos, sessions, remarks)
          const contentChanged = 
            JSON.stringify(task.photos) !== JSON.stringify(taskData.photos) ||
            JSON.stringify(task.sessions) !== JSON.stringify(taskData.sessions) ||
            task.remarks !== taskData.notes;
            
          if (contentChanged) {
            newActivity.lastEditedBy = currentUserId;
            newActivity.lastEditedAt = now;
          }
          
          return { 
            ...task, 
            status: taskData.status,
            sessions: taskData.sessions,
            photos: taskData.photos || [],
            remarks: taskData.notes,
            activity: newActivity
          };
        }
        return task;
      });

      // Calculate new job status based on updated tasks
      const newJobStatus = calculateJobStatus(updatedTasks, currentJob.status);
      
      // Update timestamps based on status changes
      const updates: any = { tasks: updatedTasks };
      
      if (newJobStatus !== currentJob.status) {
        updates.status = newJobStatus;
        
        if (newJobStatus === 'In Progress' && !currentJob.startedAt) {
          updates.startedAt = new Date().toISOString();
        } else if (newJobStatus === 'Completed' && !currentJob.completedAt) {
          updates.completedAt = new Date().toISOString();
        }
      }

      return {
        ...prev,
        [jobId]: {
          ...currentJob,
          ...updates
        }
      };
    });
  };

  // Task Cancellation
  const cancelTask = (jobId: string, taskId: string, reason?: string) => {
    const job = jobs[jobId];
    if (!job) return;
    
    // 🚨 RISK CHECK: Block cancellation if job is submitted or later
    if (['Submitted', 'Approved', 'Rejected'].includes(job.status)) {
      Alert.alert(
        'Cannot Cancel Task', 
        'Tasks cannot be cancelled after job submission. Please contact your manager.',
        [{ text: 'OK' }]
      );
      return;
    }

    const task = job.tasks.find(t => t.id === taskId);
    if (!task) return;

    // 🚨 RISK CHECK: Prevent cancelling completed or cancelled tasks
    if (task.status === 'completed') {
      Alert.alert(
        'Cannot Cancel Completed Task', 
        'Completed tasks cannot be cancelled. Only pending and in-progress tasks can be cancelled.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (task.status === 'cancelled') {
      Alert.alert('Task Already Cancelled', 'This task has already been cancelled.');
      return;
    }

    setJobs(prev => {
      const updatedJob = { ...prev[jobId] };
      const updatedTasks = updatedJob.tasks.map(t => {
        if (t.id === taskId) {
          const now = new Date().toISOString();
          const currentUserId = currentUser?.id || '';
          
          return {
            ...t,
            status: 'cancelled' as const,
            activity: {
              ...t.activity,
              cancelledBy: currentUserId,
              cancelledAt: now,
              cancelReason: reason || 'No reason provided'
            }
          };
        }
        return t;
      });

      // Recalculate job status using updated calculateJobStatus (which handles cancelled tasks)
      const newJobStatus = calculateJobStatus(updatedTasks, updatedJob.status);

      return {
        ...prev,
        [jobId]: {
          ...updatedJob,
          tasks: updatedTasks,
          status: newJobStatus
        }
      };
    });

    // Notify manager and other assigned techs
    const techName = currentUser?.realName || 'Unknown';
    const cancelMessage = `${techName} cancelled task "${task.description}"${reason ? `: ${reason}` : ''}`;

    // Notify manager
    addNotification(
      job.createdBy,
      'Task Cancelled',
      cancelMessage,
      'task_cancelled',
      jobId
    );

    // Notify other assigned techs
    job.assignedTechs.forEach(techId => {
      if (techId !== currentUser?.id) {
        addNotification(
          techId,
          'Task Cancelled by Colleague',
          cancelMessage,
          'task_cancelled',
          jobId
        );
      }
    });

    Alert.alert('Task Cancelled', 'Task has been cancelled and team members have been notified.');
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
    validateJobCompletion,
    completeJob,
    submitJob,
    approveJob,
    rejectJob,
    cancelJob,
    addTask,
    updateTask,
    addPendingTask,
    updateTaskStatus,
    cancelTask,
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