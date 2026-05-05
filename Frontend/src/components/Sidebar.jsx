import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiHome, FiFolder, FiCheckSquare, FiUser, FiUsers } from 'react-icons/fi'

const Sidebar = () => {
  const user = useSelector(state => state.user)
  const activeClass = "bg-blue-800 text-white flex items-center gap-3 p-3 rounded-lg transition-colors"
  const defaultClass = "text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3 p-3 rounded-lg transition-colors"

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
            <h1 className="text-2xl font-bold tracking-wider text-blue-400">ProjectHub</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavLink to="/dashboard" className={({isActive}) => isActive ? activeClass : defaultClass}>
                <FiHome size={20} />
                <span className="font-medium">Dashboard</span>
            </NavLink>
            <NavLink to="/projects" className={({isActive}) => isActive ? activeClass : defaultClass}>
                <FiFolder size={20} />
                <span className="font-medium">Projects</span>
            </NavLink>
            <NavLink to="/tasks" className={({isActive}) => isActive ? activeClass : defaultClass}>
                <FiCheckSquare size={20} />
                <span className="font-medium">Tasks</span>
            </NavLink>
            {user.role === 'SUPER_ADMIN' && (
                <NavLink to="/users" className={({isActive}) => isActive ? activeClass : defaultClass}>
                    <FiUsers size={20} />
                    <span className="font-medium">Users</span>
                </NavLink>
            )}
            <NavLink to="/profile" className={({isActive}) => isActive ? activeClass : defaultClass}>
                <FiUser size={20} />
                <span className="font-medium">Profile</span>
            </NavLink>
        </nav>

        <div className="p-4 text-xs text-gray-500 text-center">
            &copy; 2026 ProjectHub
        </div>
    </aside>
  )
}

export default Sidebar
