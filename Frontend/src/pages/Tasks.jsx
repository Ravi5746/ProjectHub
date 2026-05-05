import React, { useEffect, useState } from 'react'
import Axios from '../utils/Custom_Axios'
import SummaryAPI from '../common/summaryAPI'
import toast from 'react-hot-toast'
import { FiClock, FiCheckCircle, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { useSelector } from 'react-redux'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const user = useSelector(state => state.user)

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
      id: '', projectId: '', title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '', assigneeId: ''
  })
  const [projects, setProjects] = useState([])
  const [projectMembers, setProjectMembers] = useState([])

  const isAdmin = user?.role === 'SUPER_ADMIN'

  const fetchTasks = async () => {
    try {
      const response = await Axios({
        ...SummaryAPI.list_tasks
      })
      if (response.data.success) {
        setTasks(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
      try {
          const response = await Axios({ ...SummaryAPI.list_projects })
          if (response.data.success) {
              setProjects(response.data.data)
          }
      } catch (error) {
          console.error(error)
      }
  }

  const fetchProjectMembers = async (projectId) => {
      try {
          const response = await Axios({
              url: SummaryAPI.get_project.url.replace(':id', projectId),
              method: SummaryAPI.get_project.method
          })
          if (response.data.success && response.data.data.members) {
              setProjectMembers(response.data.data.members)
          }
      } catch (error) {
          console.error(error)
      }
  }

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [])

  const handleOpenModal = (task = null) => {
      if (task) {
          setIsEditing(true)
          setFormData({
              id: task.id,
              projectId: task.projectId,
              title: task.title,
              description: task.description || '',
              status: task.status,
              priority: task.priority || 'MEDIUM',
              deadline: task.deadline ? task.deadline.split('T')[0] : '',
              assigneeId: task.assigneeId || ''
          })
          fetchProjectMembers(task.projectId)
      } else {
          setIsEditing(false)
          setFormData({
              id: '', projectId: projects.length > 0 ? projects[0].id : '', title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '', assigneeId: ''
          })
          if (projects.length > 0) fetchProjectMembers(projects[0].id)
      }
      setIsModalOpen(true)
  }

  const handleProjectChange = (e) => {
      const newProjectId = e.target.value
      setFormData({ ...formData, projectId: newProjectId, assigneeId: '' })
      fetchProjectMembers(newProjectId)
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      try {
          const apiCall = isEditing 
            ? { url: SummaryAPI.update_task.url.replace(':id', formData.id), method: SummaryAPI.update_task.method }
            : SummaryAPI.create_task

          const response = await Axios({
              ...apiCall,
              data: formData
          })

          if (response.data.success) {
              toast.success(response.data.message)
              setIsModalOpen(false)
              fetchTasks()
          } else {
              toast.error(response.data.message)
          }
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to save task')
      }
  }

  const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this task?')) return
      try {
          const response = await Axios({
              url: SummaryAPI.delete_task.url.replace(':id', id),
              method: SummaryAPI.delete_task.method
          })
          if (response.data.success) {
              toast.success('Task deleted')
              fetchTasks()
          } else {
              toast.error(response.data.message)
          }
      } catch (error) {
          toast.error('Failed to delete task')
      }
  }

  const handleStatusChange = async (taskId, newStatus) => {
      try {
          const response = await Axios({
              url: SummaryAPI.update_task.url.replace(':id', taskId),
              method: SummaryAPI.update_task.method,
              data: { status: newStatus }
          })
          if (response.data.success) {
              toast.success('Status updated')
              fetchTasks()
          } else {
              toast.error(response.data.message)
          }
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to update status')
      }
  }

  return (
    <div className="relative">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
            {isAdmin && (
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FiPlus /> Add Task
                </button>
            )}
        </div>

        {loading ? (
            <div className="text-center mt-10">Loading tasks...</div>
        ) : tasks.length === 0 ? (
            <div className="bg-white p-10 rounded-lg text-center border border-gray-200">
                <FiCheckCircle className="mx-auto text-gray-300 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900">You're all caught up!</h3>
                <p className="text-gray-500 mt-1">No tasks assigned to you right now.</p>
            </div>
        ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                    <div className="text-xs text-gray-500">{task.description?.substring(0, 30)}...</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{projects.find(p => p.id === task.projectId)?.name || task.projectId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${task.priority === 'URGENT' ? 'bg-red-100 text-red-800' : task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : task.priority === 'LOW' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {task.priority || 'MEDIUM'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select 
                                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border-0 cursor-pointer focus:ring-0
                                        ${task.status === 'DONE' ? 'bg-green-100 text-green-800' : 
                                          task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-gray-100 text-gray-800'}`}
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    >
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="DONE">DONE</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <FiClock /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isAdmin || user?.id === task.createdBy ? (
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => handleOpenModal(task)} className="text-blue-600 hover:text-blue-900"><FiEdit2 size={16} /></button>
                                            <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-900"><FiTrash2 size={16} /></button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Read-only</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Task Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                                <select 
                                    required
                                    value={formData.projectId}
                                    onChange={handleProjectChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value="" disabled>Select a project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input 
                                    type="text" required
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Task title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    rows="3" placeholder="Task description..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="DONE">DONE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select 
                                        value={formData.priority}
                                        onChange={e => setFormData({...formData, priority: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                        <option value="URGENT">URGENT</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input 
                                        type="date"
                                        value={formData.deadline}
                                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                                    <select 
                                        value={formData.assigneeId}
                                        onChange={e => setFormData({...formData, assigneeId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        disabled={!formData.projectId}
                                    >
                                        <option value="">Unassigned</option>
                                        {projectMembers.map(m => (
                                            <option key={m.user.id} value={m.user.id}>
                                                {m.user.name} ({m.user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-auto">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            form="task-form"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            {isEditing ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Tasks
