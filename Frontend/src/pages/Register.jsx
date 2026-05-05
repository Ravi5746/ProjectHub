import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const PASSWORD_RULES = [
    { test: (pw) => pw.length >= 8, message: 'At least 8 characters' },
    { test: (pw) => /[A-Z]/.test(pw), message: 'At least one uppercase letter' },
    { test: (pw) => /[a-z]/.test(pw), message: 'At least one lowercase letter' },
    { test: (pw) => /[0-9]/.test(pw), message: 'At least one number' },
    { test: (pw) => /[@$!%*?&]/.test(pw), message: 'At least one special character (@$!%*?&)' }
]

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const password = watch("password", "")

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await Axios({
        ...SummaryAPI.signup,
        data: data
      })
      if (response.data.success) {
        toast.success(response.data.message || 'Registration successful. Please verify your email.')
        navigate('/otp-verification', { state: { email: data.email } })
      } else {
        toast.error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create an Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-400" />
            </div>
            <input 
              type="text" 
              {...register("name", { required: "Name is required" })}
              className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              {...register("password", { 
                  required: "Password is required",
                  validate: (value) => {
                      for (const rule of PASSWORD_RULES) {
                          if (!rule.test(value)) return rule.message;
                      }
                      return true;
                  }
              })}
              className="pl-10 pr-10 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••••"
            />
            <div 
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>
          {errors.password ? (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          ) : (
            <div className="text-gray-400 text-[10px] mt-1 leading-tight">
              <p>Format: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&).</p>
              <p>Example: <span className="font-mono">ShopVerse@2026</span></p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              {...register("confirmPassword", { 
                  validate: value => value === password || "Passwords do not match"
              })}
              className="pl-10 pr-10 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="••••••••"
            />
            <div 
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50 mt-4"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </div>
  )
}

export default Register
