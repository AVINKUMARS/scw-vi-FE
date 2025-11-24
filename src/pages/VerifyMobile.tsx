import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../lib/api'
import FormInput from '../components/FormInput'
import Button from '../components/Button'
import { CheckCircle2, Phone, ArrowLeft } from 'lucide-react'

interface GoogleSSoData {
  token: string
  user_id?: number
  user?: {
    name?: string
    email?: string
  }
}

export default function VerifyMobile() {
    const nav = useNavigate()
    const { state } = useLocation() as any
    const ssoData: GoogleSSoData | undefined = state?.ssoData
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(false)

    // Step 1: Link phone number to user account
    const linkPhoneNumber = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
        try {
            // Link phone to user account using JWT from SSO
            await api.post('/auth/link-phone', { phone_number: phoneNumber })

            // Then request OTP
            await api.post('/auth/request-otp', { phone_number: phoneNumber })
            setStep('otp')
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? 'Failed to link phone number')
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP
    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
        try {
            await api.post('/auth/verify-otp', { phone_number: phoneNumber, otp })
            // Phone is now verified, proceed to setup
            nav('/setup', { replace: true })
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? 'OTP verification failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <Phone className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Mobile</h1>
                    <p className="text-gray-600 text-sm">We need your phone number to complete setup</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                    {/* Step 1: Enter Phone Number */}
                    {step === 'phone' && (
                        <form onSubmit={linkPhoneNumber} className="grid gap-4">
                            <div>
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100">
                                    <p className="text-sm text-gray-600 mb-1">Welcome back</p>
                                    {ssoData?.user?.name && (
                                        <p className="text-xl font-semibold text-gray-900">{ssoData?.user?.name}</p>
                                    )}
                                    {ssoData?.user?.email && (
                                        <p className="text-xs text-gray-500 mt-1">{ssoData?.user?.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <FormInput
                                    label="WhatsApp Mobile Number"
                                    placeholder="+1 (555) 000-0000"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">We'll send an OTP to verify your number</p>
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
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 'otp' && (
                        <form onSubmit={verifyOtp} className="grid gap-4">
                            <div>
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100">
                                    <p className="text-sm text-gray-600 mb-1">WhatsApp Number</p>
                                    <p className="text-xl font-semibold text-gray-900">{phoneNumber}</p>
                                </div>
                            </div>

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

                            <Button
                                type="submit"
                                loading={loading}
                                size="lg"
                                className="w-full mt-2"
                            >
                                Verify & Continue
                            </Button>

                            {/* Resend Code */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center mb-4">
                                    Didn't receive the code?
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErr('')
                                        api.post('/auth/request-otp', { phone_number: phoneNumber })
                                            .then(() => alert('OTP sent again to your WhatsApp'))
                                            .catch(e => setErr(e?.response?.data?.error ?? 'Failed to resend OTP'))
                                    }}
                                    className="w-full text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-80 transition"
                                >
                                    Resend Code
                                </button>
                            </div>

                            {/* Change Number */}
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('phone')
                                    setOtp('')
                                    setErr('')
                                }}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Change number
                            </button>
                        </form>
                    )}
                </div>

                {/* Security Info */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 font-medium">Secure</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 font-medium">Verified</p>
                    </div>
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
