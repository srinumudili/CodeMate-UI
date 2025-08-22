import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.user);

  if (!user?._id) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If user exists or token exists, render children
  return children;
};

export default ProtectedRoute;
