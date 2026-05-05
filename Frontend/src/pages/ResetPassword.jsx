import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import { FiLock } from 'react-icons/fi'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const password = watch("newPassword", "")

  const onSubmit = async (data) => {
    if (!token) {
        toast.error("Invalid or missing reset token")
        return
    }
    setLoading(true)
    try {
      const response = await Axios({
        ...SummaryAPI.reset_password,
        data: {
            token: token,
            newPassword: data.newPassword
        }
      })
      if (response.data.success) {
        toast.success(response.data.message || 'Password reset successfully')
        navigate('/login')
      } else {
        toast.error(response.data.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
      return (
          <div className="text-center text-red-600">
              <p>Invalid Reset Link.</p>
              <Link to="/login" className="text-blue-600 underline text-sm mt-4 inline-block">Go to Login</Link>
          </div>
      )
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Reset Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input 
              type="password" 
              {...register("newPassword", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
              className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input 
              type="password" 
              {...register("confirmPassword", { 
                  validate: value => value === password || "Passwords do not match"
              })}
              className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50 mt-4"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

      </form>
    </div>
  )
}

export default ResetPassword
