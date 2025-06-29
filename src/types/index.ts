// Field Tracker - Type Definitions

export type UserRole = 'tech' | 'boss';

export type JobStatus = 'Created' | 'In Progress' | 'Completed' | 'Submitted' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  realName: string;
  phone: string;
  email: string;
  createdAt: string;
  isFirstLogin: boolean;
}

export interface TaskPhoto {
  id: string;
  uri: string;
  description: string;
  category: 'before' | 'during' | 'after';
  timestamp: string;
  fileSize: number;
}

export interface WorkSession {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TaskActivity {
  startedBy?: string;
  startedAt?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  lastSavedBy?: string;
  lastSavedAt?: string;
  completedBy?: string;
  completedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  sessions: WorkSession[];
  photos: TaskPhoto[];
  remarks?: string;
  activity?: TaskActivity;
}

export interface Job {
  id: string;
  title: string;
  siteLocation: string;
  description: string;
  status: JobStatus;
  createdBy: string;
  assignedTechs: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  tasks: Task[];
  bossComments?: string;
  rejectionReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'job_assigned' | 'job_started' | 'task_added' | 'job_submitted' | 'job_approved' | 'job_rejected' | 'task_cancelled' | 'job_cancelled';
  jobId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface AppState {
  currentUser: User | null;
  users: { [key: string]: User };
  jobs: { [key: string]: Job };
  notifications: { [key: string]: Notification };
  isLoggedIn: boolean;
}