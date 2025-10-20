'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search,
  Edit2,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  credits: number
  createdAt: string
  updatedAt: string
  _count: {
    lessons: number
    quizResults: number
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  
  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Search & filters
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  // Edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ credits: 0, role: 'user' })
  const [saving, setSaving] = useState(false)

  // Fetch users when page or search changes
  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      if (searchQuery) params.append('search', searchQuery)
      
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      } else if (res.status === 403) {
        alert('Access denied. Admin role required.')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      credits: Number(user.credits),
      role: user.role
    })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (res.ok) {
        alert('User updated successfully')
        setEditingUser(null)
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user: ${user.email}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('User deleted successfully')
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const adjustCredits = (amount: number) => {
    setEditForm(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits + amount)
    }))
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
      {/* Header - Compact on Mobile */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">User Management</h1>
        <p className="text-xs sm:text-sm text-zinc-400">View, edit, and manage all platform users</p>
      </div>

      {/* Search Bar - Mobile Optimized */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-transparent border-none outline-none text-white w-full text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users Content */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Role</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Credits</th>
                    <th className="text-center py-3 px-4 text-zinc-400 font-medium">Activity</th>
                    <th className="text-center py-3 px-4 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{user.name || 'No Name'}</p>
                          <p className="text-sm text-zinc-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-orange-400 font-semibold">
                          {Number(user.credits).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-4 text-sm text-zinc-400">
                          <div className="text-center">
                            <p className="font-semibold text-white">{user._count.lessons}</p>
                            <p className="text-xs">Courses</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-white">{user._count.quizResults}</p>
                            <p className="text-xs">Quizzes</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors group"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4 text-zinc-400 group-hover:text-orange-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors group"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 text-zinc-400 group-hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Hidden on Desktop */}
            <div className="lg:hidden space-y-3">
              {users.map((user) => (
                <div key={user.id} className="bg-zinc-800/30 border border-zinc-800/50 rounded-lg p-3">
                  {/* Header: Name + Role */}
                  <div className="flex items-start justify-between mb-3 pb-3 border-b border-zinc-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate mb-1">{user.name || 'No Name'}</p>
                      <p className="text-zinc-400 text-xs truncate">{user.email}</p>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                          <Phone className="w-3 h-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded text-[10px] font-medium flex-shrink-0 ${
                      user.role === 'admin' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-zinc-500 mb-0.5">Credits</p>
                      <p className="text-sm font-bold text-orange-400">{Number(user.credits).toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-zinc-500 mb-0.5">Courses</p>
                      <p className="text-sm font-bold text-zinc-300">{user._count.lessons}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-zinc-500 mb-0.5">Quizzes</p>
                      <p className="text-sm font-bold text-zinc-300">{user._count.quizResults}</p>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-3 justify-center">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Compact on Mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-zinc-800">
              <p className="text-xs sm:text-sm text-zinc-400">
                Showing {users.length} of {total} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-800 rounded-lg text-xs sm:text-sm text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit User Modal - Mobile Optimized */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Edit User</h3>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-400 mb-2">Email</label>
                <p className="text-white text-sm sm:text-base truncate">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-400 mb-2">Credits</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => adjustCredits(-100)}
                    className="p-1.5 sm:p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <input
                    type="number"
                    value={editForm.credits}
                    onChange={(e) => setEditForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-center text-sm sm:text-base"
                  />
                  <button
                    onClick={() => adjustCredits(100)}
                    className="p-1.5 sm:p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2">
                  <button
                    onClick={() => adjustCredits(500)}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs sm:text-sm transition-colors"
                  >
                    +500
                  </button>
                  <button
                    onClick={() => adjustCredits(1000)}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs sm:text-sm transition-colors"
                  >
                    +1K
                  </button>
                  <button
                    onClick={() => adjustCredits(5000)}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs sm:text-sm transition-colors"
                  >
                    +5K
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-400 mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setEditingUser(null)}
                disabled={saving}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

