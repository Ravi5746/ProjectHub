import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import { setUserDetail } from '../store/userSlice'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await Axios({
        ...SummaryAPI.login,
        data: data
      })
      if (response.data.success) {
        toast.success(response.data.message || 'Login successful')
        dispatch(setUserDetail(response.data.data))
        navigate('/dashboard')
      } else {
        toast.error(response.data.message || 'Login failed')
      }
    } catch (error) {
      const errData = error.response?.data
      if (errData?.isEmailNotVerified) {
        toast.error(errData.message)
        navigate('/otp-verification', { state: { email: errData.email } })
      } else {
        toast.error(errData?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>
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

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            {/* <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link> */}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
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
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
      </p>
    </div>
  )
}

export default Login
