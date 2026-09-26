import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
      department: string;
      avatar: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    status?: string;
    department?: string;
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    status?: string;
    department?: string;
    avatar?: string;
  }
}
