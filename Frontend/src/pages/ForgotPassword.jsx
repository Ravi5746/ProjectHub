import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import { FiMail } from 'react-icons/fi'

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await Axios({
        ...SummaryAPI.forgot_password,
        data: data
      })
      if (response.data.success) {
        toast.success(response.data.message || 'Reset link sent to your email')
        setIsSent(true)
      } else {
        toast.error(response.data.message || 'Failed to send reset link')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Forgot Password</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      {isSent ? (
          <div className="bg-green-50 text-green-700 p-4 rounded mb-4 text-sm text-center border border-green-200">
              Check your email for the reset link! You can close this page now.
          </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
                </div>
                <input 
                type="email" 
                {...register("email", { required: "Email is required" })}
                className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="you@example.com"
                />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
            {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
        </form>
      )}
      
      <p className="text-center text-sm text-gray-600 mt-6">
        Remembered your password? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </div>
  )
}

export default ForgotPassword
