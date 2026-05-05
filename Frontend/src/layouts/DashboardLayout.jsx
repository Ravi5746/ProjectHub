import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const DashboardLayout = () => {
  const { userId, isLoading } = useSelector(state => state.user)

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen bg-gray-50">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      )
  }

  if (!userId) {
      return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full">
            <Header />
            <main className="flex-1 p-6 overflow-auto bg-gray-50">
                <Outlet />
            </main>
        </div>
    </div>
  )
}

export default DashboardLayout
