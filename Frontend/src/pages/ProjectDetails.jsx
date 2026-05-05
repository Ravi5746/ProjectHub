import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import toast from 'react-hot-toast'
import { FiClock, FiCheckCircle, FiEdit2, FiTrash2, FiUserMinus } from 'react-icons/fi'

const ProjectDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const user = useSelector(state => state.user)
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tasks, setTasks] = useState([])
    const [tasksLoading, setTasksLoading] = useState(true)

    const fetchProjectDetails = async () => {
        try {
            const response = await Axios({
                url: SummaryAPI.get_project.url.replace(':id', id),
                method: SummaryAPI.get_project.method
            })
            if (response.data.success) {
                setProject(response.data.data)
            }
        } catch (error) {
            toast.error('Failed to load project details')
        } finally {
            setLoading(false)
        }
    }

    const fetchProjectTasks = async () => {
        try {
            const response = await Axios({
                url: SummaryAPI.list_project_tasks.url.replace(':projectId', id),
                method: SummaryAPI.list_project_tasks.method
            })
            if (response.data.success) {
                setTasks(response.data.data)
            }
        } catch (error) {
            toast.error('Failed to load project tasks')
        } finally {
            setTasksLoading(false)
        }
    }

    useEffect(() => {
        fetchProjectDetails()
        fetchProjectTasks()
    }, [id])

    const handleCreateTask = async () => {
        const title = window.prompt("Enter task title:")
        if (!title) return

        try {
            const response = await Axios({
                ...SummaryAPI.create_task,
                data: { title, projectId: Number(id) }
            })
            if (response.data.success) {
                toast.success('Task created successfully')
                fetchProjectTasks()
            } else {
                toast.error(response.data.message || 'Failed to create task')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        }
    }

    const handleAddMember = async () => {
        const email = window.prompt("Enter user email to add:")
        if (!email) return

        try {
            const response = await Axios({
                url: SummaryAPI.add_member.url.replace(':id', id),
                method: SummaryAPI.add_member.method,
                data: { email, role: 'MEMBER' }
            })
            if (response.data.success) {
                toast.success('Member added successfully')
                fetchProjectDetails()
            } else {
                toast.error(response.data.message || 'Failed to add member')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        }
    }

    const handleRemoveMember = async (memberUserId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return

        try {
            const response = await Axios({
                url: SummaryAPI.remove_member.url.replace(':id', id).replace(':userId', memberUserId),
                method: SummaryAPI.remove_member.method
            })
            if (response.data.success) {
                toast.success('Member removed successfully')
                fetchProjectDetails()
            } else {
                toast.error(response.data.message || 'Failed to remove member')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        }
    }

    const handleEditProject = async () => {
        const newName = window.prompt("Enter new project name:", project.name)
        if (!newName) return
        const newDescription = window.prompt("Enter new project description:", project.description)

        try {
            const response = await Axios({
                url: SummaryAPI.update_project.url.replace(':id', id),
                method: SummaryAPI.update_project.method,
                data: { name: newName, description: newDescription }
            })
            if (response.data.success) {
                toast.success('Project updated successfully')
                fetchProjectDetails()
            } else {
                toast.error(response.data.message || 'Failed to update project')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        }
    }

    const handleDeleteProject = async () => {
        if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return

        try {
            const response = await Axios({
                url: SummaryAPI.delete_project.url.replace(':id', id),
                method: SummaryAPI.delete_project.method
            })
            if (response.data.success) {
                toast.success('Project deleted successfully')
                navigate('/projects')
            } else {
                toast.error(response.data.message || 'Failed to delete project')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        }
    }

    if (loading) return <div className="text-center mt-10">Loading project details...</div>
    if (!project) return <div className="text-center mt-10 text-red-500">Project not found</div>

    const userMembership = project.members?.find(m => m.userId === user.userId)
    const isCreator = project.createdBy === user.userId
    const isSuperAdmin = user.role === 'SUPER_ADMIN'
    const isProjectAdmin = userMembership?.role === 'PROJECT_ADMIN'

    const canEditAndDelete = isSuperAdmin || isCreator
    const canManageMembers = canEditAndDelete || isProjectAdmin

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <Link to="/projects" className="text-blue-600 hover:underline">&larr; Back to Projects</Link>
                {canEditAndDelete && (
                    <div className="flex gap-2">
                        <button onClick={handleEditProject} className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 text-sm font-medium">
                            <FiEdit2 size={14} /> Edit
                        </button>
                        <button onClick={handleDeleteProject} className="flex items-center gap-1 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 text-sm font-medium">
                            <FiTrash2 size={14} /> Delete
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                        <p className="text-gray-600 mt-2">{project.description}</p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded capitalize font-medium ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {project.status || 'Active'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Tasks</h3>
                        {/* <button onClick={handleCreateTask} className="text-blue-600 text-sm hover:underline font-medium">+ Add Task</button> */}
                    </div>
                    {tasksLoading ? (
                        <p className="text-gray-500 text-sm">Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <p className="text-gray-500 text-sm">No tasks assigned to this project.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded ${task.priority === 'URGENT' ? 'bg-red-100 text-red-800' : task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : task.priority === 'LOW' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {task.priority || 'MEDIUM'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FiClock /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Members</h3>
                        <button onClick={handleAddMember} className="text-blue-600 text-sm hover:underline font-medium">+ Add</button>
                    </div>
                    {project.members && project.members.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {project.members.map((member) => (
                                <li key={member.id} className="py-3 flex justify-between items-center group">
                                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{member.user?.name || `User ID: ${member.userId}`}</span>
                                            <span className="text-xs text-gray-500">{member.user?.role || member.role}</span>
                                        </div>
                                    </div>
                                    {canManageMembers && member.userId !== project.createdBy && (
                                        <button
                                            onClick={() => handleRemoveMember(member.userId)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove Member"
                                        >
                                            <FiUserMinus />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No members in this project.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProjectDetails
