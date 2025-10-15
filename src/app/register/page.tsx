import { redirect } from 'next/navigation'

export default function RegisterRedirect() {
  // Redirect /register to /signup
  redirect('/signup')
}

