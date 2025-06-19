// src/components/Authentication.jsx
import { useEffect, useState } from "react";

const Authentication = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    if (!isAuthenticated && window.location.pathname !== "/login") {
      window.location.href = "/login";
    } else {
      setIsVerifying(false);
    }
  }, []);

  if (isVerifying) {
    return null; 
  }

  return children;
};

export default Authentication;
