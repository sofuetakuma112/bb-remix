export type SerializedNotifierUser = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedNotification = {
  id: string;
  notificationType: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  notifierUser: SerializedNotifierUser;
};
