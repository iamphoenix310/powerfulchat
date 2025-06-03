// app/auth/login/page.tsx
import { redirect } from 'next/navigation'

export default function Page() {
  redirect('https://visitpowerful.com/auth?mode=login')
}
