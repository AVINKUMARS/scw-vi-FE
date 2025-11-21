import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { extractTokenFromLocation, saveToken } from '../lib/auth'

export default function SsoCallback() {
  const nav = useNavigate()
  const loc = useLocation()
  const [err, setErr] = useState('')

  useEffect(() => {
    try {
      const token = extractTokenFromLocation(window.location)
      if (token) {
        saveToken(token)
        nav('/new-chat', { replace: true })
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
