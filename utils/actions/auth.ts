'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function SignOut() {
    await createClient().auth.signOut()
    redirect('/sign-in')
}
