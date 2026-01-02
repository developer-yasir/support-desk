import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_STATE_KEY = "workdesks_sidebar_open";

export default function AppLayout() {
  const isMobile = useIsMobile();
  
  // Initialize from localStorage, default to true (expanded) for desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved !== null ? saved === "true" : true;
  });

  // On mobile, always start collapsed; persist desktop preference
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (saved !== null) {
        setSidebarOpen(saved === "true");
      }
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Persist preference (only meaningful on desktop)
    if (!isMobile) {
      localStorage.setItem(SIDEBAR_STATE_KEY, String(newState));
    }
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleSidebarClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          open={sidebarOpen} 
          onToggle={handleSidebarToggle}
          onNavigate={handleSidebarClose}
          isMobile={isMobile}
        />
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={handleSidebarToggle} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
