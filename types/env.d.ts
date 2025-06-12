// types/env.d.ts
declare namespace NodeJS {
    export interface ProcessEnv {
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      // ... other environment variables
    }
  }
  
  