import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables } from '@/integrations/supabase/types'

type Profile = Tables<'profiles'>
type UserRole = 'admin' | 'kasir' | 'user'

export const useAuth = () => {
  const [user, setUser] = useState(supabase.auth.getUser())
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (allowedRoles: UserRole[]) => {
    return profile && allowedRoles.includes(profile.role as UserRole)
  }

  return {
    user,
    profile,
    loading,
    isUser: () => hasRole(['user', 'kasir', 'admin']),
    isKasir: () => hasRole(['kasir', 'admin']),
    isAdmin: () => hasRole(['admin']),
  }
}