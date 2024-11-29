export interface BlogJobData {
  postId: string;
  action: 'publish' | 'unpublish' | 'schedule' | 'process-images';
  scheduledDate?: Date;
  userId: string;
}

export interface BlogJobResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
} 