import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import { FiMail, FiCheckCircle } from 'react-icons/fi'

const VerifyEmail = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await Axios({
        ...SummaryAPI.verify_email,
        data: {
          token: data.token
        }
      })
      if (response.data.success) {
        toast.success(response.data.message || 'Email verified successfully!')
        navigate('/login')
      } else {
        toast.error(response.data.message || 'Verification failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Verify Your Email</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Enter the verification token sent to your email address.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verification Token</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCheckCircle className="text-gray-400" />
            </div>
            <input 
              type="text" 
              {...register("token", { required: "Token is required" })}
              className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Paste token here"
            />
          </div>
          {errors.token && <p className="text-red-500 text-xs mt-1">{errors.token.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
      </div>
    </div>
  )
}

export default VerifyEmail
