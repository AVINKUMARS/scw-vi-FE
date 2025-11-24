import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { saveToken } from '../lib/auth'
import FormInput from '../components/FormInput'
import Button from '../components/Button'
import { MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'

type PendingForm = {
  name: string
  email: string
  password: string
  confirm_password: string
  whatsapp_number: string
  monthly_revenue?: number | ''
  employees?: number | ''
}

type BizType = { id: number; category: string; sub_category: string; business_type: string }

export default function VerifyOtp() {
    const nav = useNavigate()
    const { state } = useLocation() as any
    const pending: PendingForm | undefined = state?.pendingForm
    const phone: string = state?.phone
    const [otp, setOtp] = useState('')
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(false)
    const [stage, setStage] = useState<'otp' | 'biz'>('otp')

    // Business details states (post-OTP)
    const [businessName, setBusinessName] = useState('')
    const [goalAmount, setGoalAmount] = useState<number | ''>('')
    const [goalYears, setGoalYears] = useState<number | ''>('')
    const [monthlyRevenue, setMonthlyRevenue] = useState<number | ''>('')
    const [employees, setEmployees] = useState<number | ''>('')
    const CORE_ALL = useMemo(() => (["manufacturing", "purchasing", "inventory", "sales", "delivery", "customer operation"]), [])
    const [selected, setSelected] = useState<string[]>([])
    const toggle = (c: string) => setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])

    // Business Type search
    const [bizTypes, setBizTypes] = useState<BizType[]>([])
    const [bizSearch, setBizSearch] = useState('')
    const [bizOpen, setBizOpen] = useState(false)
    const [bizSelected, setBizSelected] = useState<BizType | null>(null)
    const suggestRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let cancelled = false
        api.get('/business-types')
            .then(({ data }) => {
                if (cancelled) return
                const items: BizType[] = Array.isArray(data?.data) ? data.data : []
                setBizTypes(items)
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [])

    // Pre-fill monthly revenue and employees from register step, if available
    useEffect(() => {
        if (pending) {
            try {
                if (pending.monthly_revenue !== undefined && pending.monthly_revenue !== '') {
                    setMonthlyRevenue(Number(pending.monthly_revenue as any))
                }
                if (pending.employees !== undefined && pending.employees !== '') {
                    setEmployees(Number(pending.employees as any))
                }
            } catch {}
        }
    }, [pending])

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!suggestRef.current) return
            if (!suggestRef.current.contains(e.target as any)) setBizOpen(false)
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [])

    const onVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
        try {
            await api.post('/auth/verify-otp', { phone_number: phone, otp })
            setStage('biz')
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? 'OTP verification failed')
        } finally {
            setLoading(false)
        }
    }

    const onCompleteBusiness = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
        try {
            if (!pending) throw new Error('Missing registration data')
            if (!businessName) throw new Error('Business name is required')
            if (!bizSelected) throw new Error('Please select a business type')
            if (goalAmount === '' || goalYears === '') throw new Error('Please fill goals')

            const industryType = String(bizSelected.category || '').toLowerCase()
            const subIndustry = bizSelected.business_type

            const registerBody = {
                name: pending.name,
                email: pending.email,
                password: pending.password,
                confirm_password: pending.confirm_password,
                whatsapp_number: pending.whatsapp_number,
                business_name: businessName,
                industry_type: industryType,
                sub_industry: subIndustry,
            }
            const { data } = await api.post('/auth/register', registerBody)
            if (!data?.token) throw new Error('Registration failed')
            saveToken(data.token)

            await api.post('/company/setup', {
                business_name: businessName,
                monthly_revenue: monthlyRevenue === '' ? 0 : Number(monthlyRevenue),
                employees: employees === '' ? 0 : Number(employees),
                goal_amount: Number(goalAmount),
                goal_years: Number(goalYears),
                industry_type: industryType,
                sub_industry: subIndustry,
                core_processes: selected.length ? selected : CORE_ALL,
            })

            nav('/new-chat')
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? (e?.message || 'Failed to complete registration'))
        } finally {
            setLoading(false)
        }
    }

    if (!pending) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <p className="text-gray-600 mb-6">Missing registration data.</p>
                        <Button
                            onClick={() => nav('/register')}
                            variant="primary"
                            size="lg"
                            className="w-full"
                        >
                            Go back to Register
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <MessageCircle className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{stage === 'otp' ? 'Verify Your OTP' : 'Business Details'}</h1>
                    <p className="text-gray-600 text-sm">{stage === 'otp' ? 'We sent a code to your WhatsApp' : 'Tell us about your business'}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                    {/* OTP Stage */}
                    {stage === 'otp' && (
                        <>
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100">
                                <p className="text-sm text-gray-600 mb-1">WhatsApp Number</p>
                                <p className="text-xl font-semibold text-gray-900">{phone}</p>
                            </div>
                            <form onSubmit={onVerify} className="grid gap-4">
                                <div>
                                    <FormInput
                                        label="Enter OTP Code"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code we sent to your WhatsApp</p>
                                </div>
                                {err && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                                        <span className="text-red-600 text-sm">{err}</span>
                                    </div>
                                )}
                                <Button type="submit" loading={loading} size="lg" className="w-full mt-2">Verify & Continue</Button>
                            </form>
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center mb-4">Didn't receive the code?</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErr('')
                                        api.post('/auth/request-otp', { phone_number: phone })
                                            .then(() => alert('OTP sent again to your WhatsApp'))
                                            .catch(e => setErr(e?.response?.data?.error ?? 'Failed to resend OTP'))
                                    }}
                                    className="w-full text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-80 transition"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </>
                    )}

                    {/* Business Details Stage */}
                    {stage === 'biz' && (
                        <form onSubmit={onCompleteBusiness} className="grid gap-4">
                            <div>
                                <FormInput
                                    label="Business Name"
                                    placeholder="Your company name"
                                    value={businessName}
                                    onChange={e => setBusinessName(e.target.value)}
                                    required
                                />
                            </div>
                            <div ref={suggestRef}>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Business Type (search)</label>
                                <input
                                    type="text"
                                    value={bizSearch}
                                    onChange={e => { setBizSearch(e.target.value); setBizSelected(null); setBizOpen(true) }}
                                    onFocus={() => setBizOpen(true)}
                                    placeholder="e.g., Footwear Manufacturing"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                />
                                {bizOpen && (
                                    <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow divide-y divide-gray-100">
                                        {bizTypes
                                            .filter(b => !bizSearch || b.business_type.toLowerCase().includes(bizSearch.toLowerCase()))
                                            .slice(0, 12)
                                            .map(b => (
                                                <button
                                                    type="button"
                                                    key={b.id}
                                                    onClick={() => { setBizSelected(b); setBizSearch(b.business_type); setBizOpen(false) }}
                                                    className="w-full text-left px-4 py-2 hover:bg-purple-50"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{b.business_type}</span>
                                                        <span className="text-xs text-gray-500">{b.category} • {b.sub_category}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        {bizTypes.length > 0 && bizTypes.filter(b => !bizSearch || b.business_type.toLowerCase().includes(bizSearch.toLowerCase())).length === 0 && (
                                            <div className="px-4 py-3 text-sm text-gray-500">No matches found</div>
                                        )}
                                    </div>
                                )}
                                {bizSelected && (
                                    <p className="text-xs text-gray-600 mt-1">Selected: <span className="font-medium">{bizSelected.business_type}</span> <span className="text-gray-400">({bizSelected.category})</span></p>
                                )}
                            </div>
                            {/* Monthly Revenue and Employees (same UI as setup) */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Monthly Revenue</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={monthlyRevenue}
                                        onChange={e => setMonthlyRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="e.g., 10000"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">No. of Employees</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={employees}
                                        onChange={e => setEmployees(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="e.g., 25"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Core Processes</label>
                                <div className="flex flex-wrap gap-2">
                                    {CORE_ALL.map(cp => (
                                        <button
                                            key={cp}
                                            type="button"
                                            onClick={() => toggle(cp)}
                                            className={`px-4 py-2 rounded-full border-2 font-semibold transition-all capitalize ${selected.includes(cp) ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className={`w-4 h-4 ${selected.includes(cp) ? 'opacity-100' : 'opacity-30'}`} />
                                                {cp}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Revenue Goal *</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={goalAmount}
                                        onChange={e => setGoalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="e.g., 250000"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Years to Achieve *</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={goalYears}
                                        onChange={e => setGoalYears(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="e.g., 3"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                    />
                                </div>
                            </div>
                            {err && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                                    <span className="text-red-600 text-sm">{err}</span>
                                </div>
                            )}
                            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">Complete Registration</Button>
                        </form>
                    )}
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => nav('/register')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Register
                    </button>
                </div>
            </div>
        </div>
    )
}
