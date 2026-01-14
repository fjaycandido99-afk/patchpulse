import { redirect } from 'next/navigation'

// Generic short URL: patchpulse.app/go
export default function GoRedirect() {
  redirect('/lp')
}
