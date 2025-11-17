import { useMemo, useState } from 'react'
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
    const [selected, setSelected] = useState<string[]>([])
    const nav = useNavigate()

    const toggle = (c: string) => setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])

    const onFinish = async () => {
        setErr('')
        setLoading(true)
        try {
            const core = selected.length ? selected : autoCore
            await api.post('/company/setup', {
                business_name: businessName,
                monthly_revenue: monthlyRevenue === '' ? 0 : Number(monthlyRevenue),
                employees: employees === '' ? 0 : Number(employees),
                goal_amount: goalAmount === '' ? 0 : Number(goalAmount),
                goal_years: goalYears === '' ? 0 : Number(goalYears),
                industry_type: industry,
                sub_industry: sub,
                core_processes: core
            })
            nav('/home')
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
                    <p className="text-gray-600 text-sm">Step {step} of 3 - Let's get to know your business</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 flex gap-2">
                    {[1, 2, 3].map(s => (
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

                    {/* Step 2: Industry & Goals */}
                    {step === 2 && (
                        <div className="grid gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Target className="w-6 h-6 text-blue-600" />
                                    Industry & Goals
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Select Your Industry *</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {(['service', 'manufacturing', 'retail'] as const).map((ind) => (
                                        <button
                                            key={ind}
                                            onClick={() => {
                                                setIndustry(ind)
                                                setSub('')
                                            }}
                                            className={`p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                                                industry === ind
                                                    ? 'border-purple-600 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        >
                                            <span className={`text-xl ${industry === ind ? 'text-purple-600' : 'text-gray-600'}`}>
                                                {INDUSTRY_ICONS[ind]}
                                            </span>
                                            <span className={`font-semibold capitalize ${industry === ind ? 'text-purple-900' : 'text-gray-700'}`}>
                                                {ind}
                                            </span>
                                            {industry === ind && <CheckCircle2 className="w-5 h-5 text-purple-600 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {industry !== 'none' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Sub-Industry *</label>
                                        <select
                                            value={sub}
                                            onChange={e => setSub(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                        >
                                            <option value="">Select sub-industry</option>
                                            {SUBS[industry].map(x => <option key={x} value={x}>{x}</option>)}
                                        </select>
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
                                </>
                            )}

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
                                    onClick={() => industry !== 'none' && sub && goalAmount !== '' && goalYears !== '' ? setStep(3) : setErr('Please fill all required fields')}
                                    size="lg"
                                    className="flex-1"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Core Processes */}
                    {step === 3 && (
                        <div className="grid gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-cyan-600" />
                                    Core Processes
                                </h2>
                                <p className="text-gray-600 text-sm">Select the processes relevant to your business</p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-4">
                                    Auto-detected for <span className="text-purple-600 capitalize">{industry}</span> industry
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(autoCore).map(cp => (
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

                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">Ready to go!</p>
                                        <p className="text-gray-600 text-xs mt-1">You can change these settings anytime in your business profile.</p>
                                    </div>
                                </div>
                            </div>

                            {err && step === 3 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <span className="text-red-600 text-sm">{err}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setStep(2)}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={onFinish}
                                    loading={loading}
                                    size="lg"
                                    className="flex-1"
                                >
                                    Complete Setup
                                </Button>
                            </div>
                        </div>
                    )}
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
