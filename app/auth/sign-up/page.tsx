// app/auth/sign-up/page.tsx
import { redirect } from 'next/navigation'

export default function Page() {
  redirect('https://visitpowerful.com/auth?mode=signup')
}
