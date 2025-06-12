import { client, urlFor } from '@/utils/sanityClient'
import { NextAuthOptions, Session, User } from 'next-auth'
import { SanityAdapter } from 'next-auth-sanity'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { v4 as uuidv4 } from 'uuid'

interface ExtendedUser extends User {
  role?: string
  karmaPoints?: number
  credits?: number
  adFree?: boolean
  username?: string
  isNewUser?: boolean
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {}
        if (!email || !password) return null

        const user = await client.fetch(
          `*[_type == "user" && email == $email][0]`,
          { email }
        )

        if (!user || !user.hashedPassword) return null

        const bcrypt = require('bcryptjs')
        const isValid = await bcrypt.compare(password, user.hashedPassword)

        if (!isValid) return null

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.profileImage
            ? user.profileImage.asset?._ref
              ? user.profileImage
              : null
            : null,
        }
      },
    }),
  ],

  adapter: SanityAdapter(client),

  session: {
    strategy: 'jwt',
  },


  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      const sanityUser = await client.fetch(
        `*[_type == "user" && email == $email][0]`,
        { email: user.email }
      )

      if (!sanityUser) {
        const randomUsername = `user-${uuidv4().slice(0, 8)}`

        await client.create({
          _type: 'user',
          name: user.name || 'Unnamed User',
          email: user.email,
          image: user.image || null,
          username: randomUsername,
          karmaPoints: 0,
          subscriptionCredits: 5,
          subscriptionActive: true, 
          subscriptionStartDate: new Date().toISOString(),
          freeTrialClaimed: true,
          role: 'normal',
          adFree: false,
          likedImages: [],
          isNewUser: true,
        })
      }
      return true
    },

    async jwt({ token }: { token: JWT }) {
      if (token?.email) {
        const sanityUser = await client.fetch(
          `*[_type == "user" && email == $email][0]`,
          { email: token.email }
        )

        if (sanityUser?._id) {
          token.id = sanityUser._id
          token.username = sanityUser.username || null
          token.isNewUser = sanityUser.isNewUser ?? false
          token.subscriptionActive = sanityUser.subscriptionActive ?? false

          // ✅ Add image from profileImage (if available)
          token.image = sanityUser.profileImage
          ? urlFor(sanityUser.profileImage, { width: 80, height: 80 })
          : null

          const validRoles = ['admin', 'normal', 'editor', 'moderator']
          token.role = validRoles.includes(sanityUser.role)
            ? sanityUser.role
            : 'normal'
        }
      }

      return token
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).username = token.username || null
        ;(session.user as any).isNewUser = token.isNewUser || false
        ;(session.user as any).role = token.role || 'normal'
        ;(session.user as any).subscriptionActive = token.subscriptionActive || false

        // ✅ Inject image into session.user
        ;(session.user as any).image = token.image || null
      }
      return session
    },
  },
}
