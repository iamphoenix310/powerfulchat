import { Session } from 'next-auth';

export default interface UserData {
   _id: string;
   name: string;
   email: string;
   karmaPoints?: number;
   role?: string;
   adFree?: boolean;
   createdAt?: string;
  }
  
  export default interface UserProfile {
    _id: string;
    username: string;
    email: string;
    image?: {
      asset: {
        _ref: string;
      };
    };
    karmaPoints?: number;
    role?: string;
  }


  // Extend the User type from NextAuth
  declare module 'next-auth' {
    interface Session {
      user: {
        type: any;
        _id: any;
        adFree: boolean;
        role: string;
        karmaPoints: number;
        username: any;
        image: string;
        id: string;
        name: string;
        email: string;
        // Add any other fields you expect in the user object
      }
    }
  }
  