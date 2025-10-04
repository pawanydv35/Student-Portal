import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleSwitcher: React.FC = () => {
  const { user, login } = useAuth();

  const switchRole = async (role: 'student' | 'faculty' | 'admin') => {
    await login('demo@university.edu', 'password', role);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="text-sm font-medium text-gray-900 mb-2">Demo: Switch Role</div>
      <div className="flex space-x-2">
        <button
          onClick={() => switchRole('student')}
          className={`px-3 py-1 text-xs rounded ${
            user.role === 'student' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Student
        </button>
        <button
          onClick={() => switchRole('faculty')}
          className={`px-3 py-1 text-xs rounded ${
            user.role === 'faculty' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Faculty
        </button>
        <button
          onClick={() => switchRole('admin')}
          className={`px-3 py-1 text-xs rounded ${
            user.role === 'admin' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcher;