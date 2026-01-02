import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import CreateTicket from "./pages/CreateTicket";
import Contacts from "./pages/Contacts";
import ClientCompanies from "./pages/ClientCompanies";
import Reports from "./pages/Reports";
import Automations from "./pages/Automations";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import AuditLogs from "./pages/admin/AuditLogs";
import TeamsManagement from "./pages/admin/TeamsManagement";
import RolePermissions from "./pages/admin/RolePermissions";
import ReportBuilder from "./pages/admin/ReportBuilder";
import AgentManagement from "./pages/admin/AgentManagement";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="tickets/:id" element={<TicketDetail />} />
                <Route path="tickets/new" element={<CreateTicket />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="companies" element={<ClientCompanies />} />
                <Route path="reports" element={<Reports />} />
                <Route path="automations" element={<Automations />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/settings" element={<AdminSettings />} />
                <Route path="admin/audit-logs" element={<AuditLogs />} />
                <Route path="admin/teams" element={<TeamsManagement />} />
                <Route path="admin/permissions" element={<RolePermissions />} />
                <Route path="admin/reports" element={<ReportBuilder />} />
                <Route path="admin/agents" element={<AgentManagement />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
