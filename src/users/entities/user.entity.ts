// src/users/entities/user.entity.ts
export class User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  }
  