import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiShield, FiTrash2 } from 'react-icons/fi'

const UsersManagement = () => {
    const currentUser = useSelector(state => state.user)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const response = await Axios({
                ...SummaryAPI.list_users
            })
            if (response.data.success) {
                setUsers(response.data.data)
            }
        } catch (error) {
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await Axios({
                url: SummaryAPI.update_user_role.url.replace(':id', userId),
                method: SummaryAPI.update_user_role.method,
                data: { role: newRole }
            })
            if (response.data.success) {
                toast.success('User role updated')
                fetchUsers()
            } else {
                toast.error(response.data.message || 'Failed to update role')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return
        try {
            const response = await Axios({
                url: SummaryAPI.delete_user.url.replace(':id', userId),
                method: SummaryAPI.delete_user.method
            })
            if (response.data.success) {
                toast.success('User deleted successfully')
                fetchUsers()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user')
        }
    }

    if (loading) return <div className="text-center mt-10">Loading users...</div>

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                        ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                          user.role === 'PROJECT_ADMIN' ? 'bg-blue-100 text-blue-800' : 
                                          'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {user.id !== currentUser.userId ? (
                                        <select 
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="MEMBER">Member</option>
                                            <option value="PROJECT_ADMIN">Project Admin</option>
                                            <option value="SUPER_ADMIN">Super Admin</option>
                                        </select>
                                    ) : (
                                        <span className="text-gray-400 italic">Self (Admin)</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {user.id !== currentUser.userId && (
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900 ml-4"
                                            title="Delete User"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UsersManagement
