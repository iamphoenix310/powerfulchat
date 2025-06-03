import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      profileImage?: string | null
      role?: string
      subscriptionActive?: boolean
      isNewUser?: boolean
      id?: string
    }
  }

  interface User {
    username?: string | null
    profileImage?: string | null
    role?: string
    subscriptionActive?: boolean
    isNewUser?: boolean
    id?: string
  }
}
