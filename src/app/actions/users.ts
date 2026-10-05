'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: {
  email: string
  password: string
  first_name: string
  last_name: string
  role: string
}) {
  const supabase = createAdminClient()

  try {
    // Create auth user using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        first_name: formData.first_name,
        last_name: formData.last_name,
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (authData.user) {
      // Create or update profile using admin client (bypasses RLS)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
        })

      if (profileError) {
        return { success: false, error: profileError.message }
      }

      revalidatePath('/admin/users')
      return { success: true, data: authData.user }
    }

    return { success: false, error: 'Failed to create user' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUser(userId: string) {
  const adminClient = createAdminClient()

  try {
    // Delete profile first
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Delete auth user
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      return { success: false, error: authError.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  const adminClient = createAdminClient()

  try {
    const { error } = await adminClient
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
