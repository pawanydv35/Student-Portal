import React, { useState } from 'react';
import { Users, BookOpen, TrendingUp, Settings, Download, Plus, Search, Filter, BarChart3, PieChart, Calendar } from 'lucide-react';
import IoSCBranding from '../common/IoSCBranding';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - will be replaced with real API data
  const stats = [
    { label: 'Total Students', value: '10,247', change: '+5.2%', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500' },
    { label: 'Active Courses', value: '156', change: '+2.1%', icon: <BookOpen className="w-6 h-6" />, color: 'bg-green-500' },
    { label: 'Faculty Members', value: '523', change: '+1.8%', icon: <Users className="w-6 h-6" />, color: 'bg-purple-500' },
    { label: 'Avg Attendance', value: '94.2%', change: '+0.8%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-orange-500' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@university.edu', role: 'Student', department: 'Computer Science', status: 'Active' },
    { id: 2, name: 'Dr. Sarah Smith', email: 'sarah@university.edu', role: 'Faculty', department: 'Computer Science', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@university.edu', role: 'Student', department: 'Mathematics', status: 'Inactive' },
    { id: 4, name: 'Prof. Emily Wilson', email: 'emily@university.edu', role: 'Faculty', department: 'Physics', status: 'Active' },
  ];

  const attendanceReports = [
    { course: 'CS301 - Data Structures', students: 45, avgAttendance: '96.2%', lastUpdated: '2 hours ago' },
    { course: 'MATH201 - Calculus II', students: 52, avgAttendance: '89.4%', lastUpdated: '4 hours ago' },
    { course: 'PHY101 - Physics I', students: 38, avgAttendance: '92.1%', lastUpdated: '1 hour ago' },
    { course: 'CS401 - Advanced Algorithms', students: 32, avgAttendance: '98.7%', lastUpdated: '3 hours ago' },
  ];

  const systemSettings = [
    { name: 'Geofence Radius', value: '100 meters', description: 'Default radius for attendance geofencing' },
    { name: 'Attendance Window', value: '60 minutes', description: 'Duration for which attendance remains open' },
    { name: 'Late Submission', value: '24 hours', description: 'Grace period for assignment submissions' },
    { name: 'Notification Frequency', value: 'Real-time', description: 'How often to send push notifications' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <PieChart className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
              <button className="btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      </div>
                    </div>
                    <div className={`${stat.color} text-white p-3 rounded-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Attendance chart will be displayed here</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">User distribution chart will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-900">New student registration: John Doe (CS Department)</span>
                  <span className="text-xs text-gray-500 ml-auto">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-900">Course created: Advanced Machine Learning (CS501)</span>
                  <span className="text-xs text-gray-500 ml-auto">15 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-900">Attendance session started for CS301</span>
                  <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="btn-secondary flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
                <button className="btn-primary flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'Faculty' ? 'bg-green-100 text-green-800' :
                            user.role === 'Student' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Attendance Reports</h2>
              <div className="flex items-center space-x-3">
                <button className="btn-secondary flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </button>
                <button className="btn-primary flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Attendance</h3>
                <div className="text-3xl font-bold text-green-600">94.2%</div>
                <p className="text-sm text-gray-600">+2.1% from last month</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h3>
                <div className="text-3xl font-bold text-blue-600">12</div>
                <p className="text-sm text-gray-600">Currently running</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Late Submissions</h3>
                <div className="text-3xl font-bold text-orange-600">8</div>
                <p className="text-sm text-gray-600">This week</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Attendance</h3>
              <div className="space-y-4">
                {attendanceReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{report.course}</h4>
                      <p className="text-sm text-gray-600">{report.students} students enrolled</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{report.avgAttendance}</div>
                      <p className="text-xs text-gray-500">Updated {report.lastUpdated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Settings</h3>
                <div className="space-y-4">
                  {systemSettings.map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{setting.name}</h4>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{setting.value}</div>
                        <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geofence Locations</h3>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Main Building</h4>
                        <p className="text-sm text-gray-600">Rooms 101-305</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Computer Lab</h4>
                        <p className="text-sm text-gray-600">Lab 101-103</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                    </div>
                  </div>
                  <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700">
                    + Add New Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with IoSC Branding */}
      <div className="mt-8 py-6 border-t border-gray-200 bg-white">
        <div className="px-6 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Powered by</span>
            <IoSCBranding variant="full" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;