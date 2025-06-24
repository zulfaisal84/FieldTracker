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

export interface Photo {
  id: string;
  uri: string;
  description: string;
  type: 'before' | 'during' | 'after';
  timestamp: string;
  taskId: string;
}

export interface Task {
  id: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  beforePhoto?: Photo;
  duringPhoto?: Photo;
  afterPhoto?: Photo;
  isCompleted: boolean;
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
  pendingTasks: string[];
  bossComments?: string;
  rejectionReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'job_assigned' | 'job_started' | 'task_added' | 'job_submitted' | 'job_approved' | 'job_rejected';
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