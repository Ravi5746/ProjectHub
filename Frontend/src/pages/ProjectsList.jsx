import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import toast from 'react-hot-toast'
import { FiFolder, FiPlus } from 'react-icons/fi'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      const response = await Axios({
        ...SummaryAPI.list_projects
      })
      if (response.data.success) {
        setProjects(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    const name = window.prompt("Enter project name:")
    if (!name) return

    const description = window.prompt("Enter project description (optional):")

    try {
      const response = await Axios({
        ...SummaryAPI.create_project,
        data: { name, description }
      })
      if (response.data.success) {
        toast.success('Project created successfully')
        fetchProjects()
      } else {
        toast.error(response.data.message || 'Failed to create project')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
            <button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
                <FiPlus /> New Project
            </button>
        </div>

        {loading ? (
            <div className="text-center mt-10">Loading projects...</div>
        ) : projects.length === 0 ? (
            <div className="bg-white p-10 rounded-lg text-center border border-gray-200">
                <FiFolder className="mx-auto text-gray-300 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="text-gray-500 mt-1">Get started by creating a new project.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link to={`/projects/${project.id}`} key={project.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">{project.name}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">
                                {project.status || 'Active'}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {project.description || 'No description provided.'}
                        </p>
                        <div className="text-xs text-gray-500 flex justify-between">
                            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                    </Link>
                ))}
            </div>
        )}
    </div>
  )
}

export default ProjectsList
