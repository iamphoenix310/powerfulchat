import 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in types to include the username property for the user model.
   */
  interface User {
    username?: string;
  }

  interface Profile {
    username?: string;
  }

  interface Session {
    user: {
      username?: string;
    } & DefaultSession['user'];
  }
}
