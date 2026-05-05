import React, { useEffect, useState } from 'react'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const response = await Axios({
        ...SummaryAPI.get_dashboard
      })
      if (response.data.success) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) return <div className="text-center mt-10">Loading dashboard...</div>

  if (!dashboardData) return <div className="text-center mt-10">No data available.</div>

  return (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.totalProjects || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.totalTasks || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium">Overdue Tasks</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{dashboardData.overdueTasks || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium">Completion Rate</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                    {dashboardData.completionRate ? `${dashboardData.completionRate}%` : '0%'}
                </p>
            </div>
        </div>

        {/* Can add more charts or lists here later based on backend return data */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
            <p className="text-gray-500 text-sm">Activity feed will be displayed here.</p>
        </div>
    </div>
  )
}

export default Dashboard
