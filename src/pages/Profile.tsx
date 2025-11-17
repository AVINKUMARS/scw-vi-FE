import { useEffect, useState } from 'react'
import { Mail, Phone, Building2, Briefcase, Users, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'

type UserProfile = {
  id: number
  name: string
  business_name: string
  email: string
  phone: string
  is_whatsapp_verified: boolean
  industry_type?: string
  sub_industry?: string
  core_processes?: string[]
  monthly_revenue?: number
  employees?: number
  goal_amount?: number
  goal_years?: number
}

export default function Profile() {
  const [me, setMe] = useState<UserProfile | null>(null)
  const [err, setErr] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/me')
        setMe(data)
        setErr('')
      } catch (e: any) {
        setErr(e?.response?.data?.error ?? 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950/50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-48 mb-8 animate-pulse"></div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950/50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-1">Error Loading Profile</h3>
                <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!me) return null

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return '—'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account information and business details</p>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-6 pb-20">
            <div className="flex items-end gap-6">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-lg border-4 border-white dark:border-neutral-700">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{getInitials(me.name)}</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{me.name}</h2>
                <p className="text-blue-100">{me.business_name || 'No business name'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information Grid */}
          <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 -mt-12 relative">
            {/* Email Card */}
            <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-gray-900 dark:text-white break-all">{me.email}</p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">WhatsApp</p>
                  {me.is_whatsapp_verified ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <p className="text-gray-900 dark:text-white">{me.phone}</p>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  {me.is_whatsapp_verified ? '✓ Verified' : '⚠ Not verified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Industry Information */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Industry</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type</p>
                <p className="text-gray-900 dark:text-white">{me.industry_type || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Sub-industry</p>
                <p className="text-gray-900 dark:text-white">{me.sub_industry || '—'}</p>
              </div>
              {me.core_processes && me.core_processes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Core Processes</p>
                  <div className="flex flex-wrap gap-2">
                    {me.core_processes.map((process, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {process}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Metrics */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Metrics</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(me.monthly_revenue)}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees</p>
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{me.employees ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Goals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-lg p-4 border border-orange-100 dark:border-orange-900/30">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Target Amount</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">{formatCurrency(me.goal_amount)}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">Timeline</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">{me.goal_years ? `${me.goal_years} year${me.goal_years !== 1 ? 's' : ''}` : '—'}</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>User ID: <span className="font-mono text-gray-900 dark:text-gray-300">#{me.id}</span></p>
        </div>
      </div>
    </div>
  )
}
