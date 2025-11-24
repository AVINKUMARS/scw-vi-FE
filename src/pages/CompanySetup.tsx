import { useEffect, useMemo, useState, useRef } from 'react'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Building2, TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react'

const CORE: Record<string, string[]> = {
    service: ["sales", "delivery", "customer operation"],
    manufacturing: ["manufacturing", "purchasing", "inventory", "sales", "delivery", "customer operation"],
    retail: ["inventory", "sales", "delivery", "customer operation"]
}

const SUBS: Record<string, string[]> = {
    service: ["IT Services", "Consulting", "Maintenance"],
    manufacturing: ["Automotive", "Electronics", "Textiles"],
    retail: ["Grocery", "Fashion", "Electronics Retail"]
}

const INDUSTRY_ICONS = {
    service: <Building2 className="w-5 h-5" />,
    manufacturing: <TrendingUp className="w-5 h-5" />,
    retail: <Users className="w-5 h-5" />
}

export default function CompanySetup() {
    const [step, setStep] = useState(1)
    const [industry, setIndustry] = useState<'service' | 'manufacturing' | 'retail' | 'none'>('none')
    const [sub, setSub] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [monthlyRevenue, setMonthlyRevenue] = useState<number | ''>('')
    const [employees, setEmployees] = useState<number | ''>('')
    const [goalAmount, setGoalAmount] = useState<number | ''>('')
    const [goalYears, setGoalYears] = useState<number | ''>('')
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const autoCore = useMemo(() => industry === 'none' ? [] : CORE[industry], [industry])
    const CORE_ALL = useMemo(() => (CORE['manufacturing']), [])
    const [selected, setSelected] = useState<string[]>([])
    const nav = useNavigate()

    // Business types (searchable) from /api/business-types
    type BizType = { id: number; category: string; sub_category: string; business_type: string }
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

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!suggestRef.current) return
            if (!suggestRef.current.contains(e.target as any)) setBizOpen(false)
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [])

    const normalizeIndustryFromCategory = (cat?: string): 'service' | 'manufacturing' | 'retail' | 'none' => {
        const c = String(cat || '').toLowerCase()
        if (c.startsWith('serv')) return 'service'
        if (c.startsWith('manu')) return 'manufacturing'
        if (c.startsWith('retail')) return 'retail'
        return 'none'
    }

    const toggle = (c: string) => setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])

    const onFinish = async () => {
        setErr('')
        setLoading(true)
        try {
            // Prefer industry/sub from selected business type
            const industryType = bizSelected ? String(bizSelected.category || '').toLowerCase() : industry
            const subIndustry = bizSelected ? bizSelected.business_type : sub
            // Auto core based on normalized industry (when custom not selected)
            const normalized = normalizeIndustryFromCategory(industryType)
            const coreDefault = normalized === 'none' ? [] : CORE[normalized]
            const core = selected.length ? selected : coreDefault
            await api.post('/company/setup', {
                business_name: businessName,
                monthly_revenue: monthlyRevenue === '' ? 0 : Number(monthlyRevenue),
                employees: employees === '' ? 0 : Number(employees),
                goal_amount: goalAmount === '' ? 0 : Number(goalAmount),
                goal_years: goalYears === '' ? 0 : Number(goalYears),
                industry_type: industryType,
                sub_industry: subIndustry,
                core_processes: core
            })
            nav('/new-chat')
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? 'Failed to complete setup')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* Progress Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Setup</h1>
                    <p className="text-gray-600 text-sm">Step {step} of 2 - Let's get to know your business</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 flex gap-2">
                    {[1, 2].map(s => (
                        <div
                            key={s}
                            className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">

                    {/* Step 1: Business Info */}
                    {step === 1 && (
                        <div className="grid gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Building2 className="w-6 h-6 text-purple-600" />
                                    Business Information
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Business Name *</label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={e => setBusinessName(e.target.value)}
                                    placeholder="Enter your company name"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                />
                            </div>

                            {/* Searchable Business Type */}
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
                                                    onClick={() => {
                                                        setBizSelected(b)
                                                        setBizSearch(b.business_type)
                                                        setBizOpen(false)
                                                        const norm = normalizeIndustryFromCategory(b.category)
                                                        if (norm !== 'none') setIndustry(norm)
                                                    }}
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

                            {/* Core Processes selection moved under Business Information */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Core Processes</label>
                                <div className="flex flex-wrap gap-2">
                                    {CORE_ALL.map(cp => (
                                        <button
                                            key={cp}
                                            type="button"
                                            onClick={() => toggle(cp)}
                                            className={`px-4 py-2 rounded-full border-2 font-semibold transition-all capitalize ${
                                                selected.includes(cp)
                                                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                                            }`}
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
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Monthly Revenue *</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={monthlyRevenue}
                                        onChange={e => setMonthlyRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="e.g., 50000"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Number of Employees *</label>
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

                            {err && step === 1 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <span className="text-red-600 text-sm">{err}</span>
                                </div>
                            )}

                            <Button
                                onClick={() => businessName && monthlyRevenue !== '' && employees !== '' ? setStep(2) : setErr('Please fill all required fields')}
                                size="lg"
                                className="w-full"
                            >
                                Continue
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Goals */}
                    {step === 2 && (
                        <div className="grid gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Target className="w-6 h-6 text-blue-600" />
                                    Goals
                                </h2>
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

                            {err && step === 2 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <span className="text-red-600 text-sm">{err}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setStep(1)}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => (goalAmount !== '' && goalYears !== '') ? onFinish() : setErr('Please fill all required fields')}
                                    loading={loading}
                                    size="lg"
                                    className="flex-1"
                                >
                                    Complete Setup
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 removed; core processes selection moved to Step 1 */}
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 font-medium">Easy Setup</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 font-medium">Customizable</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 font-medium">No Hassle</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
