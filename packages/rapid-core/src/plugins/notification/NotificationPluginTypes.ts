export type RpdNotification = {
  id?: number;
  title: string;
  content?: string;
  details?: any;
};

export type SendNotificationOptions = {
  userId: number;
  title: string;
  content?: string;
  details?: any;
};
