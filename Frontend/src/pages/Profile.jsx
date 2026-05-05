import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import { setUserDetail } from '../store/userSlice'
import toast from 'react-hot-toast'
import { FiUser, FiMail } from 'react-icons/fi'

const Profile = () => {
  const { name, email, role } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
        name: name || '',
        email: email || ''
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await Axios({
        ...SummaryAPI.update_user,
        data: data
      })
      if (response.data.success) {
        toast.success('Profile updated successfully')
        dispatch(setUserDetail({ ...response.data.data, role })) // Keep role as it usually isn't updated here
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-blue-200">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                    <p className="text-gray-500">{email}</p>
                    <span className="inline-block mt-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded capitalize font-medium">
                        Role: {role ? role.replace('_', ' ') : 'Member'}
                    </span>
                </div>
            </div>

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
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Cannot be changed here)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" />
                        </div>
                        <input 
                            type="email" 
                            disabled
                            {...register("email")}
                            className="pl-10 w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-500 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Profile
