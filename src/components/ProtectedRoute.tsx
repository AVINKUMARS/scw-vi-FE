import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken, clearToken } from '../lib/auth'
import { api } from '../lib/api'


export default function ProtectedRoute({ children, skipValidate }: { children: ReactNode; skipValidate?: boolean }) {
    const token = getToken()

    // If no token at all, go to login immediately
    if (!token) return <Navigate to="/login" replace />

    // For certain routes (e.g., first-time setup) we can skip pre-validation
    if (skipValidate) return <>{children}</>

    // Validate token by calling /api/me once
    const [ok, setOk] = useState<boolean | null>(null)
    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                await api.get('/me')
                if (mounted) setOk(true)
            } catch {
                clearToken()
                if (mounted) setOk(false)
            }
        })()
        return () => { mounted = false }
    }, [])

    if (ok === null) return null
    if (ok === false) return <Navigate to="/login" replace />
    return <>{children}</>
}
