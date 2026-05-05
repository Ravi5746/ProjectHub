import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearUserDetail } from '../store/userSlice'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import toast from 'react-hot-toast'
import { FiLogOut } from 'react-icons/fi'

const Header = () => {
  const { name, role } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
        const response = await Axios({
            ...SummaryAPI.logout
        })
        if (response.data.success) {
            dispatch(clearUserDetail())
            toast.success('Logged out successfully')
            navigate('/login')
        }
    } catch (error) {
        toast.error('Failed to log out')
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
            {/* Can put a breadcrumb or page title here dynamically later */}
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{role ? role.replace('_', ' ') : 'Member'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 transition-colors ml-2 p-2 rounded-full hover:bg-gray-100"
                title="Logout"
            >
                <FiLogOut size={20} />
            </button>
        </div>
    </header>
  )
}

export default Header
