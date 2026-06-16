import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "@/components/ui/loading-screen";

export default function RestrictedRoute({ children, forbiddenRoles = [] }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4">
                <LoadingScreen
                    title="Checking permissions"
                    subtitle="Making sure the right tools and views are ready for you..."
                    className="min-h-[calc(100vh-2rem)]"
                />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (forbiddenRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
