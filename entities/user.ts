interface ITimestamp {
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends ITimestamp {
  userId: string;
  email: string;
  name: {
    firstName: string;
    lastName: string;
  };
  phoneNumber: string;
  userName: string;
  emailVerified: boolean;
  userType: "user" | "admin";
  isSuspended: boolean;
}
