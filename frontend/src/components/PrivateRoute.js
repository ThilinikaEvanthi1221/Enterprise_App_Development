import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Validate token format (basic check)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Invalid JWT format
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }

    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Your session has expired. Please login again.");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // If token is malformed, clear it and redirect to login
    console.error("Invalid token format:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page or their default dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
