import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "@/components/ui/loading-screen";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <LoadingScreen
          title="Securing your session"
          subtitle="Verifying access and restoring your workspace..."
          className="min-h-[calc(100vh-2rem)]"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
