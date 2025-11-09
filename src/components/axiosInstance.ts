// src/pages/axiosInstance.js
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
   baseURL: 'https://dc.nuzum.tech/api', // Your API base URL
      //  baseURL: 'https://localhost:7027/api', // Your API base URL
     // baseURL: 'https://nmcapi.nuzum.tech/api', // Your API base URL
    // baseURL: 'https://alkanderiapi.nuzum.tech/api', // Your API base URL
    timeout: 1000000, // Optional timeout setting 
    headers: {
      'Content-Type': 'application/json',
    },
});

// Function to handle logout
export const handleLogout = () => {
  // Clear all authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('userID');
  localStorage.removeItem('userInfo');
  
  
  // Remove the redirect - let React Router handle navigation
  // window.location.href = '/login';
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization token to headers if available
    const token = localStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle successful responses (status code 2xx)
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response && error.response.status === 401) {
      // If the response is unauthorized (401), log the user out
      console.log('Unauthorized access detected, logging out user');
      handleLogout();
    } else if (error.response && error.response.status === 403) {
      // Forbidden access
      console.log('Forbidden access detected');
      handleLogout();
    } else if (error.response && error.response.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
