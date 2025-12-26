import { redirect } from 'next/navigation'

// Redirect /patches to /home - patches are now the main dashboard
export default function PatchesPage() {
  redirect('/home')
}
