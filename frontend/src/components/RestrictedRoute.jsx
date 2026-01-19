import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RestrictedRoute({ children, forbiddenRoles = [] }) {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (forbiddenRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
