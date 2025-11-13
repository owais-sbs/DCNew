import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from './axiosInstance'; // Assuming this path is correct
import Swal from 'sweetalert2';
import { Eye, EyeOff } from "lucide-react";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve email and OTP from localStorage
    const resetData = localStorage.getItem('resetPasswordData');
    if (resetData) {
      const { email, otp } = JSON.parse(resetData);
      setEmail(email);
      setOtp(otp);
    } else {
        // If no data, show an error and suggest starting over
        setError('Session expired. Please request a new password reset.');
        Swal.fire({
            title: 'Error!',
            text: 'Session expired. Please request a new password reset.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
          navigate('/forgot-password');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all fields.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axiosInstance.post('/Account/ResetPassword/reset-password', {
        Email: email,
        Otp: otp,
        NewPassword: newPassword,
      });
      
      // Clear the stored data after successful password reset
      localStorage.removeItem('resetPasswordData');
      
      setMessage('Password reset successful! Redirecting to login...');
      Swal.fire({
        title: 'Success!',
        text: 'Password reset successful! Redirecting to login...',
        icon: 'success',
        confirmButtonColor: '#4f46e5' // Matched to indigo button
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.Message || 'Failed to reset password. Please check your OTP and try again.';
      setError(errorMsg);
      Swal.fire({
        title: 'Error!',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-blue-100 grid place-items-center p-4">
      <div className="w-full max-w-sm sm:w-[380px]">
        {/* Logo */}
        <div className="mb-5 grid place-items-center">
          <div className="h-14 rounded-2xl border border-gray-200 bg-white px-5 grid place-items-center shadow-sm">
            <img src="/src/assets/logo.webp" alt="Teach 'n Go" className="h-9" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 sm:px-8 pt-8 pb-6">
            <h1 className="text-xl font-semibold text-gray-800 text-center">Reset Password</h1>
            <p className="mt-2 text-sm text-gray-600 text-center">Enter your new password.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && !message && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  readOnly
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Re-enter new password"
                    required
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;