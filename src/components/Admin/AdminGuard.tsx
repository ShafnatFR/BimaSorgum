import React, { useEffect } from 'react'
import { useAuth } from '../../lib/AuthProvider'
import { navigateToSlug, RouteSlugs } from '../../utils/slugRouter'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigateToSlug(RouteSlugs.home())
    }
  }, [loading, isAdmin])

  if (loading) {
    return null
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}

export default AdminGuard
