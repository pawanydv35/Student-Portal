import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, Bell, MapPin, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import IoSCBranding from '../common/IoSCBranding';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');

  // Mock data - will be replaced with real API data
  const user = {
    name: 'John Doe',
    studentId: 'CS2024001',
    semester: 6,
    department: 'Computer Science'
  };

  const courses = [
    {
      id: 1,
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      faculty: 'Dr. Sarah Smith',
      nextClass: 'Today 2:00 PM',
      room: 'Room 301',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      code: 'CS302',
      name: 'Database Management Systems',
      faculty: 'Prof. Michael Johnson',
      nextClass: 'Tomorrow 10:00 AM',
      room: 'Room 205',
      color: 'bg-green-500'
    },
    {
      id: 3,
      code: 'CS303',
      name: 'Web Development',
      faculty: 'Dr. Emily Wilson',
      nextClass: 'Monday 9:00 AM',
      room: 'Lab 101',
      color: 'bg-purple-500'
    }
  ];

  const todayClasses = [
    {
      id: 1,
      course: 'CS301',
      name: 'Data Structures',
      time: '2:00 PM - 3:30 PM',
      room: 'Room 301',
      status: 'present',
      attendanceOpen: false
    },
    {
      id: 2,
      course: 'CS304',
      name: 'Software Engineering',
      time: '4:00 PM - 5:30 PM',
      room: 'Room 402',
      status: 'pending',
      attendanceOpen: true
    }
  ];

  const assignments = [
    {
      id: 1,
      title: 'Database Design Project',
      course: 'CS302',
      dueDate: 'Due in 2 days',
      status: 'pending',
      type: 'project'
    },
    {
      id: 2,
      title: 'Algorithm Analysis Quiz',
      course: 'CS301',
      dueDate: 'Due tomorrow',
      status: 'pending',
      type: 'quiz'
    },
    {
      id: 3,
      title: 'Web Portfolio Submission',
      course: 'CS303',
      dueDate: 'Submitted',
      status: 'completed',
      type: 'assignment'
    }
  ];

  const announcements = [
    {
      id: 1,
      title: 'Mid-term Exam Schedule Released',
      content: 'Check your course pages for detailed exam timetable.',
      time: '2 hours ago',
      type: 'important'
    },
    {
      id: 2,
      title: 'Library Hours Extended',
      content: 'Library will remain open until 11 PM during exam week.',
      time: '1 day ago',
      type: 'info'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const tabs = [
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar className="w-5 h-5" /> },
    { id: 'assignments', label: 'Assignments', icon: <Clock className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.studentId} • Sem {user.semester}</p>
              </div>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
            {courses.map((course) => (
              <div key={course.id} className="card">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${course.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.code} • {course.faculty}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {course.nextClass}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {course.room}
                        </div>
                      </div>
                      <button className="btn-primary text-sm px-4 py-2">
                        Join Class
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Classes</h2>
            {todayClasses.map((classItem) => (
              <div key={classItem.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(classItem.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                      <p className="text-sm text-gray-600">{classItem.course} • {classItem.room}</p>
                      <p className="text-sm text-gray-500">{classItem.time}</p>
                    </div>
                  </div>
                  {classItem.attendanceOpen && (
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Mark Attendance
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Attendance Rate: 94%</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                You're doing great! Keep it up to maintain your excellent attendance record.
              </p>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignments</h2>
            {assignments.map((assignment) => (
              <div key={assignment.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.type === 'project' ? 'bg-purple-100 text-purple-800' :
                        assignment.type === 'quiz' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {assignment.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{assignment.course}</p>
                    <p className={`text-sm font-medium ${
                      assignment.status === 'completed' ? 'text-green-600' :
                      assignment.dueDate.includes('tomorrow') ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      {assignment.dueDate}
                    </p>
                  </div>
                  {assignment.status === 'pending' && (
                    <button className="btn-primary text-sm px-4 py-2">
                      Submit
                    </button>
                  )}
                  {assignment.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Announcements</h2>
            {announcements.map((announcement) => (
              <div key={announcement.id} className="card">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    announcement.type === 'important' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                    <p className="text-xs text-gray-500">{announcement.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with IoSC Branding */}
      <div className="mt-8 py-6 border-t border-gray-200 bg-white">
        <div className="px-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Powered by</span>
            <IoSCBranding variant="full" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;