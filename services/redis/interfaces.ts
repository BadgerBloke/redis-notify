export interface NotificationEvent {
  userId: string;
  type: string;
  subject: string;
  content: Array<string>;
  createdAt: number;
}
