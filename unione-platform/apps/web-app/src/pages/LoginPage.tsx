import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, BookOpen, ArrowLeft, User, Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import IoSCBranding from '../components/common/IoSCBranding';

interface LoginForm {
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const roles = [
    {
      id: 'student' as const,
      title: 'Student',
      description: 'Access courses, submit assignments, mark attendance',
      icon: <User className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700'
    },
    {
      id: 'faculty' as const,
      title: 'Faculty',
      description: 'Manage courses, create assignments, track attendance',
      icon: <Users className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      hoverColor: 'from-green-600 to-green-700'
    },
    {
      id: 'admin' as const,
      title: 'Administrator',
      description: 'System management, analytics, user administration',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700'
    }
  ];

  const onSubmit = async (data: LoginForm) => {
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }

    try {
      await login(data.email, data.password, selectedRole);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Uni<span className="text-blue-600">ONE</span>
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Role Selection */}
          {!selectedRole ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
                Choose your role
              </h2>
              
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full p-4 rounded-xl border-2 border-transparent bg-gradient-to-r ${role.color} hover:${role.hoverColor} text-white transform hover:scale-105 transition-all duration-200 shadow-lg`}
                >
                  <div className="flex items-center">
                    <div className="mr-4">
                      {role.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">{role.title}</div>
                      <div className="text-sm opacity-90">{role.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Selected Role Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} text-white mr-3`}>
                    {roles.find(r => r.id === selectedRole)?.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {roles.find(r => r.id === selectedRole)?.title}
                    </div>
                    <div className="text-sm text-gray-600">Selected Role</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change
                </button>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                IT Support
              </a>
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>Powered by</span>
            <IoSCBranding variant="full" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;