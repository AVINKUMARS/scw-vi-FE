import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function ChatNew() {
  const nav = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post('/chat/new')
        const id = data?.chat_id || data?.id || data?.chat?.id
        if (!id) throw new Error('Invalid response from /chat/new')
        nav(`/chat/${id}`)
      } catch (e) {
        // If creation fails, fall back to dashboard
        nav('/dashboard')
      }
    })()
  }, [nav])

  return null
}
