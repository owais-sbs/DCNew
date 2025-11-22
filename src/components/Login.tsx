import React, { useState, useEffect } from 'react'; // Import useEffect
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from './axiosInstance'; // Assuming this path is correct
import { useAuth } from './AuthContext'; // Assuming this path is correct

// Interface for the expected API response
interface LoginResponse {
  IsSuccess?: boolean;
  Success?: boolean;
  success?: boolean;
  Data?: {
    Token?: string;
    token?: string;
    UserId?: number;
    Email?: string;
    Name?: string;
    Role?: string;
    RoleId?: number;
    roleId?: number;
  };
  Token?: string;
  token?: string;
  UserId?: number;
  userId?: number;
  Id?: number;
  id?: number;
  Email?: string;
  email?: string;
  Name?: string;
  name?: string;
  Role?: string;
  role?: string;
  RoleId?: number;
  roleId?: number;
  Message?: string;
  message?: string;
}

// Assuming your useAuth hook returns the user object
// If it returns isAuthenticated, you can change 'user' to 'isAuthenticated'
interface AuthContextType {
  user: any; // Replace 'any' with your actual user type if available
  login: (userData: any) => void;
  // Add other properties from your context if needed
}

export default function Login() {
  const navigate = useNavigate();
  // Get 'user' from useAuth. This assumes your AuthContext provides it.
  const { login, user } = useAuth() as AuthContextType; 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // This effect runs when the component mounts and when 'user' or 'navigate' changes
  useEffect(() => {
    // If the user is already authenticated (user object exists), redirect them.
    if (user) {
      console.log('User is already authenticated, redirecting to /dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]); // Dependencies for the effect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { Email: email, Password: '***' });
      
      const response = await axiosInstance.post<LoginResponse>('/Account/Login', {
        Email: email,
        Password: password
      });

      console.log('Full API response:', response);
      const data = response.data;
      
      // Structure 1: IsSuccess with Data object
      if (data.IsSuccess && data.Data) {
        // Check if Data contains token (your API structure)
        if ((data.Data as any).token || data.Data.Token) {
          const token = (data.Data as any).token || data.Data.Token;
          
          localStorage.setItem('token', token);
          
          // Extract user details from JWT token
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('JWT payload:', payload);
              
              const userId = payload.UserId || payload.userId || payload.sub || '1';
              const branchId = payload.BranchId;
              const userEmail = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || email;
              const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User';
              const userName = userEmail.split('@')[0] || 'User';
              
              const roleId = payload.RoleId || payload.roleId || 
                           (userRole === 'Admin' ? 1 : 2) || 1;
              
              localStorage.setItem('userID', userId.toString());
              if (branchId) {
                localStorage.setItem('branchId', branchId);
              }
              localStorage.setItem('roleId', roleId.toString());

              const userData = {
                id: parseInt(userId),
                name: userName,
                email: userEmail,
                role: userRole,
                roleId: parseInt(roleId),
                branchId: branchId,
                isActive: true 
              };
              
              localStorage.setItem('userInfo', JSON.stringify(userData));
              console.log('User logged in successfully (JWT extracted):', userData);
              
              login(userData);
              navigate('/dashboard');
            } else {
              throw new Error('Invalid JWT token format');
            }
             } catch (jwtError) {
            console.error('Error parsing JWT token:', jwtError);
            setError('Error processing authentication token');
          }
        } else {
          // Original structure with full user data
          const { Token, UserId, Email, Name, Role, RoleId } = data.Data;
          
//           localStorage.setItem('token', Token);
//           localStorage.setItem('userID', UserId.toString());

          const roleId = RoleId || (Role === 'Admin' ? 1 : 2) || 1;
          localStorage.setItem('roleId', roleId.toString());
          
          const userData = {
            id: UserId,
            name: Name,
            email: Email,
            role: Role,
            roleId: roleId,
            isActive: true
          };
          
          localStorage.setItem('userInfo', JSON.stringify(userData));
          console.log('User logged in successfully:', userData);
          
          login(userData);
          navigate('/'); // Navigate to dashboard/home
        }
      }
      // Structure 2: Direct data object
      else if (data.Token || data.token) {
        const token = data.Token || data.token;
        const userId = data.UserId || data.userId || data.Id || data.id;
        const userEmail = data.Email || data.email;
        const userName = data.Name || data.name;
        const userRole = data.Role || data.role || 'User';
        const roleId = data.RoleId || data.roleId || (userRole === 'Admin' ? 1 : 2) || 1;
        
        if (!token || !userId || !userEmail || !userName) {
          setError('Invalid response: Missing required user data');
          setLoading(false); // Stop loading
          return;
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('userID', userId.toString());
        localStorage.setItem('roleId', roleId.toString());
        
        const userData = {
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole,
          roleId: roleId,
          isActive: true
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userData));
        console.log('User logged in successfully (structure 2):', userData);
        
        login(userData);
        navigate('/'); // Navigate to dashboard/home
      }
      // Structure 3: Success boolean
      else if (data.success || data.Success) {
        const token = data.Token || data.token;
        const userId = data.UserId || data.userId || data.Id || data.id;
        const userEmail = data.Email || data.email;
        const userName = data.Name || data.name;
        const userRole = data.Role || data.role || 'User';
        const roleId = data.RoleId || data.roleId || (userRole === 'Admin' ? 1 : 2) || 1;
        
        if (!token || !userId || !userEmail || !userName) {
          setError('Invalid response: Missing required user data');
          setLoading(false); // Stop loading
          return;
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('userID', userId.toString());
        localStorage.setItem('roleId', roleId.toString());
        
        const userData = {
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole,
          roleId: roleId,
          isActive: true
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userData));
        console.log('User logged in successfully (structure 3):', userData);
        
        login(userData);
        navigate('/'); // Navigate to dashboard/home
     }
      else {
        console.error('Unexpected response structure:', data);
        setError(data.Message || data.message || 'Login failed. Unexpected response format.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.data?.Message) {
        setError(err.response.data.Message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 400) {
        setError('Please check your input and try again');
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If the user is authenticated, render a simple loading/redirecting message
  // This prevents the login form from flashing before the redirect happens
  if (user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-blue-100 grid place-items-center p-4">
        <p className="text-gray-700">Already logged in. Redirecting to dashboard...</p>
      </div>
    );
  }

  // If not authenticated, render the login form
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-blue-100 grid place-items-center p-4">
      <div className="w-full max-w-sm sm:w-[380px]">
        {/* Logo */}
        <div className="mb-5 grid place-items-center">
          <div className="h-14 rounded-2xl border border-gray-200 bg-white px-5 grid place-items-center shadow-sm">
            {/* Using the logo path from your second component */}
            <img src="/src/assets/logo.webp" alt="Teach 'n Go" className="h-9" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 sm:px-8 pt-8 pb-6">
            <h1 className="text-xl font-semibold text-gray-800 text-center">Log into your account</h1>
            <p className="mt-2 text-sm text-gray-600 text-center">Welcome back! Please enter your details.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
                <input
                  type="email" // Added type for validation
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder=""
                  required // Added required
                  disabled={loading} // Added disabled state
              />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                   type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required // Added required
                    disabled={loading} // Added disabled state
              />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                {/* Changed to Link component */}
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">
                 I forgot my password
                </Link>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading} // Added disabled state
              >
               {/* Added loading text */}
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
           Don’t have an account? <button className="text-indigo-600 hover:text-indigo-700">Sign up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}