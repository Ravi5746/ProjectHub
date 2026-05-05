import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const OtpVerification = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const inputRefs = useRef([])
    const [loading, setLoading] = useState(false)

    const email = location.state?.email

    useEffect(() => {
        if (!email) {
            toast.error("Please register first")
            navigate("/register")
        }
    }, [email, navigate])

    const isOtpComplete = otp.every(digit => digit !== "")

    const handleChange = (index, value) => {
        if (isNaN(value)) return // Only allow numbers

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1) // Take only the last character
        setOtp(newOtp)

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isOtpComplete) return

        setLoading(true)
        try {
            const response = await Axios({
                ...SummaryAPI.verify_email,
                data: {
                    otp: otp.join(""),
                    email: email
                }
            })

            if (response.data.success) {
                toast.success(response.data.message)
                navigate("/login")
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed")
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        try {
            const response = await Axios({
                ...SummaryAPI.resend_verify_email,
                data: { email }
            })
            if (response.data.success) {
                toast.success(response.data.message)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP")
        }
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Verify Your Email</h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
                We've sent a 6-digit OTP to <span className="font-semibold">{email}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={el => inputRefs.current[index] = el}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={!isOtpComplete || loading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                    Didn't receive the code?{' '}
                    <button 
                        onClick={handleResendOtp}
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        Resend OTP
                    </button>
                </p>
                <Link to="/register" className="block mt-4 text-gray-500 hover:text-gray-700">
                    Back to Register
                </Link>
            </div>
        </div>
    )
}

export default OtpVerification
