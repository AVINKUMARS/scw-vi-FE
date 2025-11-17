import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../lib/api'
import { saveToken } from '../lib/auth'
import FormInput from '../components/FormInput'
import Button from '../components/Button'
import { MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'

type PendingForm = { name: string; email: string; password: string; confirm_password: string; whatsapp_number: string }

export default function VerifyOtp() {
    const nav = useNavigate()
    const { state } = useLocation() as any
    const pending: PendingForm | undefined = state?.pendingForm
    const phone: string = state?.phone
    const [otp, setOtp] = useState('')
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(false)

    const onVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setErr('')
        setLoading(true)
        try {
            await api.post('/auth/verify-otp', { phone_number: phone, otp })
            const { data } = await api.post('/auth/register', pending)
            saveToken(data.token)
            nav('/setup')
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? 'OTP verification failed')
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your OTP</h1>
                    <p className="text-gray-600 text-sm">We sent a code to your WhatsApp</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
                    {/* Phone Number Display */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100">
                        <p className="text-sm text-gray-600 mb-1">WhatsApp Number</p>
                        <p className="text-xl font-semibold text-gray-900">{phone}</p>
                    </div>

                    {/* OTP Form */}
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

                        <Button
                            type="submit"
                            loading={loading}
                            size="lg"
                            className="w-full mt-2"
                        >
                            Verify & Continue
                        </Button>
                    </form>

                    {/* Resend Code */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Didn't receive the code?
                        </p>
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
