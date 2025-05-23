export type User = {
  id: number;
  fullName: string;
  email: string;
  isAdmin?: boolean | null;
  password: string;
};
