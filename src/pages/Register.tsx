import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { saveToken } from '../lib/auth'
import FormInput from '../components/FormInput'
import Button from '../components/Button'
import { CheckCircle2 } from 'lucide-react'

const CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined

type BizType = { id: number; category: string; sub_category: string; business_type: string }

export default function Register() {
    const nav = useNavigate()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirm_password: '',
        whatsapp_number: '',
        business_name: '',
        industry_type: '',
        sub_industry: ''
    })
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(false)
    const gsiBtnRef = useRef<HTMLDivElement>(null)
    const [bizTypes, setBizTypes] = useState<BizType[]>([])
    const [search, setSearch] = useState('')
    const [openSuggest, setOpenSuggest] = useState(false)
    const suggestRef = useRef<HTMLDivElement>(null)

    const requestOtp = async () => {
        await api.post('/auth/request-otp', { phone_number: form.whatsapp_number })
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
            try {
            if (!form.business_name) throw new Error('Business name is required')
            if (!form.sub_industry) throw new Error('Please select a business type')
                await requestOtp()
                nav('/verify-otp', { state: { phone: form.whatsapp_number, pendingForm: form } })
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? 'Failed to request OTP')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let cancelled = false

        const onCredentialResponse = async (res: any) => {
            if (!res?.credential) {
                setErr('Google sign-in failed')
                return
            }
            try {
                setErr('')
                const { data } = await api.post('/auth/sso/google', { id_token: res.credential })
                try { console.log('SSO /auth/sso/google response (register):', data) } catch {}
                if (!data?.token) throw new Error('Missing token in response')
                saveToken(data.token)
                // Redirect to mobile verification for Google SSO users
                nav('/verify-mobile', {
                    replace: true,
                    state: {
                        ssoData: {
                            token: data.token,
                            user_id: data.user_id,
                            user: {
                                name: data.user?.name || '',
                                email: data.user?.email || ''
                            }
                        }
                    }
                })
            } catch (e: any) {
                const msg = e?.response?.data?.error || e?.message || 'Google sign-in failed'
                try { console.error('SSO register error:', e?.response?.data || e) } catch {}
                setErr(String(msg))
            }
        }

        function initGsi() {
            if (cancelled || !CLIENT_ID) return
            const g = (window as any).google?.accounts?.id
            if (!g) return
            g.initialize({ client_id: CLIENT_ID, callback: onCredentialResponse })
            if (gsiBtnRef.current) {
                g.renderButton(gsiBtnRef.current, { theme: 'outline', size: 'large', text: 'signup_with', shape: 'rectangular' })
            }
            try { g.prompt() } catch {}
        }

        initGsi()
        const iv = setInterval(() => {
            if ((window as any).google?.accounts?.id) {
                clearInterval(iv)
                initGsi()
            }
        }, 200)

        return () => { cancelled = true; clearInterval(iv) }
    }, [nav])

    // Load all business types once for searchable sub-category input
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

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!suggestRef.current) return
            const target = e.target as Node
            if (!suggestRef.current.contains(target)) setOpenSuggest(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const businessTypeOptions = useMemo(() => {
        // Unique business_type -> representative BizType
        const map = new Map<string, BizType>()
        for (const it of bizTypes) {
            if (!map.has(it.business_type)) map.set(it.business_type, it)
        }
        let opts = Array.from(map.keys())
        if (search.trim()) {
            const q = search.toLowerCase()
            opts = opts.filter(s => s.toLowerCase().includes(q))
        }
        return { list: opts.slice(0, 50), map }
    }, [bizTypes, search])

    const selectBusinessType = (bt: string) => {
        const item = businessTypeOptions.map.get(bt)
        const cat = item?.category || ''
        setForm(prev => ({ ...prev, sub_industry: bt, industry_type: cat }))
        setSearch(bt)
        setOpenSuggest(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl font-bold">S</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Scalingwolf AI</h1>
                    <p className="text-gray-600 text-sm">Create your account to get started</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>

                    <form onSubmit={onSubmit} className="grid gap-4">
                        <div>
                            <FormInput
                                label="Full Name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <FormInput
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <FormInput
                                label="Password"
                                type="password"
                                placeholder="Enter a strong password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <FormInput
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={form.confirm_password}
                                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <FormInput
                                label="WhatsApp Number"
                                placeholder="+1 (555) 000-0000"
                                value={form.whatsapp_number}
                                onChange={e => setForm({ ...form, whatsapp_number: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <FormInput
                                label="Business Name"
                                placeholder="Your company name"
                                value={form.business_name}
                                onChange={e => setForm({ ...form, business_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative" ref={suggestRef}>
                            <label className="grid gap-1.5">
                                <span className="text-xs opacity-75">Business Type *</span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value) }}
                                    onClick={() => setOpenSuggest(true)}
                                    placeholder="Type to search e.g., Footwear Manufacturing"
                                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                    aria-autocomplete="list"
                                />
                            </label>
                            {/* hidden required input bound to actual value */}
                            <input type="text" value={form.sub_industry} onChange={() => {}} required hidden />
                            {openSuggest && businessTypeOptions.list.length > 0 && (
                                <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow">
                                    {businessTypeOptions.list.map((bt) => {
                                        return (
                                        <button
                                            key={bt}
                                            type="button"
                                            onClick={() => selectBusinessType(bt)}
                                            className={`w-full text-left px-4 py-2 hover:bg-purple-50 ${search === bt ? 'bg-purple-50' : ''}`}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-900">{bt}</span>
                                            </div>
                                        </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {err && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                                <span className="text-red-600 text-sm">{err}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={loading}
                            size="lg"
                            className="w-full mt-2"
                        >
                            Continue with OTP
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-gray-500 text-sm font-medium">or sign up with</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google Sign Up */}
                    <div className="space-y-3">
                        {!CLIENT_ID && (
                            <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                                Missing VITE_GOOGLE_CLIENT_ID. Set it in your environment.
                            </p>
                        )}
                        <div
                            ref={gsiBtnRef}
                            id="google-signup-btn"
                            className="flex justify-center w-full"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '56px',
                                width: '100%'
                            }}
                        ></div>
                        {/* Fallback button if Google doesn't load */}
                        {CLIENT_ID && (
                            <p className="text-xs text-center text-gray-500 mt-2">
                                Google button should appear above
                            </p>
                        )}
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center">
                        <div className="bg-purple-50 rounded-lg p-3 mb-2 flex justify-center">
                            <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Secure</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-blue-50 rounded-lg p-3 mb-2 flex justify-center">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Fast Setup</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-cyan-50 rounded-lg p-3 mb-2 flex justify-center">
                            <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Support</p>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4">
                    <p className="text-gray-700 text-sm">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-semibold text-purple-600 hover:text-blue-600 transition-colors duration-200 underline underline-offset-2"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
