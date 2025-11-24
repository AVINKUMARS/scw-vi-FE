import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { extractTokenFromLocation, saveToken } from '../lib/auth'
import { api } from '../lib/api'

export default function SsoCallback() {
  const nav = useNavigate()
  const loc = useLocation()
  const [err, setErr] = useState('')

  useEffect(() => {
    try {
      const token = extractTokenFromLocation(window.location)
      if (token) {
        ;(async () => {
          try {
            saveToken(token)
            // Fetch profile to determine next step
            const { data: me } = await api.get('/me')
            const needsMobile = !me?.is_whatsapp_verified || !me?.phone
            const needsSetup = !me?.business_name || !me?.industry_type || !me?.sub_industry || (Array.isArray(me?.core_processes) && me.core_processes.length === 0)

            if (needsMobile) {
              nav('/verify-mobile', { replace: true })
              return
            }
            if (needsSetup) {
              nav('/setup', { replace: true })
              return
            }
            nav('/new-chat', { replace: true })
          } catch (e) {
            // If anything fails, still proceed to app
            nav('/new-chat', { replace: true })
          }
        })()
        return
      }
      setErr('Missing token in SSO callback')
    } catch (e) {
      setErr('Failed to process SSO callback')
    }
  }, [loc, nav])

  return (
    <div className="max-w-md mx-auto mt-24 px-4">
      <h2 className="text-xl font-semibold mb-2">Signing you in…</h2>
      {err && <p className="text-red-600 dark:text-red-400">{err}</p>}
      {!err && <p>Please wait while we complete the sign-in.</p>}
    </div>
  )
}
