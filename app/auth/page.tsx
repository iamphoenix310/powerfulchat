// app/auth/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/Auth/AuthForm'
import { client } from '@/app/utils/sanityClient'

export const metadata = {
  title: 'Login or Sign Up - Powerful',
  description: 'Access Powerful by signing in or creating a free account.',
}

export default async function AuthPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: session.user.email }
    )

    if (user?.username) {
      redirect(`/${user.username}`)
    } else {
      redirect('/onboarding') // only if they signed in with Google
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <AuthForm />
    </div>
  )
}
