import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axiosInstance from './axiosInstance'; // Assuming this path is correct
import Swal from 'sweetalert2';

const VerifyOtp: React.FC = () => {
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  const [email] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError('Please enter the OTP.');
      Swal.fire({
        title: 'Error!',
        text: 'Please enter the OTP.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axiosInstance.post('/Account/VerifyOtp/verify-otp', { Email: email, Otp: otp });
      
      // Save email and OTP to localStorage for ResetPassword component
      localStorage.setItem('resetPasswordData', JSON.stringify({ email, otp }));
      
      setMessage('OTP verified successfully. You can now reset your password.');
      Swal.fire({
        title: 'Success!',
        text: 'OTP verified successfully. You can now reset your password.',
        icon: 'success',
        confirmButtonColor: '#4f46e5' // Matched to indigo button
      });

      setTimeout(() => navigate('/reset-password'), 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.Message || 'Failed to verify OTP. Please try again.';
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
            <h1 className="text-xl font-semibold text-gray-800 text-center">Verify OTP</h1>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Enter the OTP sent to {email ? `your email (${email})` : 'your email'}.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && !message && ( // Only show error if no success message
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              {message && ( // Show success message
                <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter the 6-digit OTP"
                  required
                  disabled={loading}
                  maxLength={6} // Often OTPs have a fixed length
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;