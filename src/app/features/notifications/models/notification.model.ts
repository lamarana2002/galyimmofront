export interface NotificationModel {
  id: number;
  category: 'contact' | 'lead' | 'visit' | 'payment' | 'system';
  title: string;
  description: string;
  source: string;
  status: 'new' | 'pending' | 'reviewed';
  created_at: string;
  read: boolean;
}
