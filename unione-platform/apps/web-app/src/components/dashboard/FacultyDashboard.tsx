import React, { useState } from 'react';
import { BookOpen, Users, Clock, Bell, Play, MapPin, CheckCircle, UserCheck, FileText, Plus } from 'lucide-react';
import IoSCBranding from '../common/IoSCBranding';

const FacultyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [attendanceSession, setAttendanceSession] = useState<any>(null);

  // Mock data - will be replaced with real API data
  const user = {
    name: 'Dr. Sarah Smith',
    employeeId: 'FAC001',
    department: 'Computer Science',
    designation: 'Associate Professor'
  };

  const courses = [
    {
      id: 1,
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      students: 45,
      nextClass: 'Today 2:00 PM',
      room: 'Room 301',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      code: 'CS401',
      name: 'Advanced Algorithms',
      students: 32,
      nextClass: 'Tomorrow 10:00 AM',
      room: 'Room 205',
      color: 'bg-green-500'
    },
    {
      id: 3,
      code: 'CS501',
      name: 'Machine Learning',
      students: 28,
      nextClass: 'Monday 9:00 AM',
      room: 'Lab 101',
      color: 'bg-purple-500'
    }
  ];

  const attendanceData = [
    {
      id: 1,
      studentName: 'John Doe',
      studentId: 'CS2024001',
      status: 'present',
      markedAt: '2:05 PM',
      method: 'auto'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      studentId: 'CS2024002',
      status: 'present',
      markedAt: '2:03 PM',
      method: 'auto'
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      studentId: 'CS2024003',
      status: 'absent',
      markedAt: '-',
      method: 'auto'
    }
  ];

  const assignments = [
    {
      id: 1,
      title: 'Binary Tree Implementation',
      course: 'CS301',
      dueDate: '2024-10-15',
      submissions: 35,
      totalStudents: 45,
      status: 'active'
    },
    {
      id: 2,
      title: 'Algorithm Analysis Report',
      course: 'CS401',
      dueDate: '2024-10-20',
      submissions: 28,
      totalStudents: 32,
      status: 'active'
    }
  ];

  const startAttendance = (courseId: number) => {
    setAttendanceSession({
      courseId,
      courseName: courses.find(c => c.id === courseId)?.name,
      startTime: new Date(),
      students: attendanceData
    });
  };

  const closeAttendance = () => {
    setAttendanceSession(null);
  };

  const toggleStudentAttendance = (studentId: number) => {
    if (attendanceSession) {
      const updatedStudents = attendanceSession.students.map((student: any) => 
        student.id === studentId 
          ? { ...student, status: student.status === 'present' ? 'absent' : 'present', method: 'manual' }
          : student
      );
      setAttendanceSession({ ...attendanceSession, students: updatedStudents });
    }
  };

  const tabs = [
    { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText className="w-5 h-5" /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.designation} • {user.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Plus className="w-6 h-6" />
              </button>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Attendance Session Banner */}
      {attendanceSession && (
        <div className="bg-green-600 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="font-medium">Attendance Active: {attendanceSession.courseName}</span>
            </div>
            <button 
              onClick={closeAttendance}
              className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded text-sm"
            >
              Close Session
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <button className="btn-primary text-sm px-4 py-2 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </button>
            </div>
            
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
                        <p className="text-sm text-gray-600">{course.code}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-1" />
                          {course.students} students
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {course.nextClass}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {course.room}
                        </div>
                      </div>
                      <button 
                        onClick={() => startAttendance(course.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Class
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Attendance Manager</h2>
              {!attendanceSession && (
                <button 
                  onClick={() => startAttendance(1)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Attendance
                </button>
              )}
            </div>

            {attendanceSession ? (
              <div className="space-y-4">
                <div className="card bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-900">Active Session</h3>
                      <p className="text-sm text-green-700">{attendanceSession.courseName}</p>
                      <p className="text-xs text-green-600">
                        Started at {attendanceSession.startTime.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-900">
                        {attendanceSession.students.filter((s: any) => s.status === 'present').length}
                      </div>
                      <div className="text-sm text-green-700">Present</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Student List</h3>
                  {attendanceSession.students.map((student: any) => (
                    <div key={student.id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            student.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                            <p className="text-sm text-gray-600">{student.studentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm text-gray-900">
                              {student.status === 'present' ? 'Present' : 'Absent'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.method === 'auto' ? 'Auto-marked' : 'Manual'}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleStudentAttendance(student.id)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              student.status === 'present' 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            Mark {student.status === 'present' ? 'Absent' : 'Present'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
                <p className="text-gray-600 mb-4">Start an attendance session to track student presence</p>
                <button 
                  onClick={() => startAttendance(1)}
                  className="btn-primary"
                >
                  Start Attendance Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
              <button className="btn-primary text-sm px-4 py-2 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </button>
            </div>

            {assignments.map((assignment) => (
              <div key={assignment.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{assignment.course}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      <span>{assignment.submissions}/{assignment.totalStudents} submitted</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="btn-secondary text-sm px-3 py-1">
                      View Submissions
                    </button>
                    <button className="btn-primary text-sm px-3 py-1">
                      Grade
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
              <button className="btn-primary text-sm px-4 py-2 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </button>
            </div>

            <div className="card">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Announcement</h3>
                <p className="text-gray-600 mb-4">Share important updates with your students or the entire university</p>
                <button className="btn-primary">
                  Create Announcement
                </button>
              </div>
            </div>
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

export default FacultyDashboard;