import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import VerifyOtp from '../pages/VerifyOtp'
import VerifyMobile from '../pages/VerifyMobile'
import SsoCallback from '../pages/SsoCallback'
import CompanySetup from '../pages/CompanySetup'
import Home from '../pages/Home'
import ChatNew from '../pages/ChatNew'
import ChatView from '../pages/ChatView'
import ChatHistory from '../pages/ChatHistory'
import Team from '../pages/Team'
import Finance from '../pages/Finance'
import Process from '../pages/Process'
import Sales from '../pages/Sales'
import Founder from '../pages/Founder'
import Profile from '../pages/Profile'
import Pricing from '../pages/Pricing'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'


export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/verify-mobile" element={<VerifyMobile />} />
            <Route path="/sso/callback" element={<SsoCallback />} />
            <Route path="/setup" element={<ProtectedRoute skipValidate><CompanySetup /></ProtectedRoute>} />
            {/* Protected + App layout (nested to ensure consistent sidebar) */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
                <Route path="dashboard" element={<Home />} />
                <Route path="new-chat" element={<ChatNew />} />
                <Route path="chat/:id" element={<ChatView />} />
                <Route path="chat-history" element={<ChatHistory />} />
                <Route path="team" element={<Team />} />
                <Route path="finance" element={<Finance />} />
                <Route path="process" element={<Process />} />
                <Route path="sales" element={<Sales />} />
                <Route path="founder" element={<Founder />} />
                <Route path="profile" element={<Profile />} />
                <Route path="pricing" element={<Pricing />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    )
}
