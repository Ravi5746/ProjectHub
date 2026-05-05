import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AuthLayout = () => {
    const { userId, isLoading } = useSelector(state => state.user)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (userId) {
        return <Navigate to="/dashboard" replace />
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">ProjectHub</h1>
                    <p className="text-gray-500 mt-2">Manage your projects efficiently</p>
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export default AuthLayout
