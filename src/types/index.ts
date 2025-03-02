export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  difficulty: 'easy' | 'medium' | 'hard';
  verificationMethod: 'pose_detection' | 'quiz' | 'manual';
  status: 'pending' | 'completed' | 'missed';
  userId: string;
} 