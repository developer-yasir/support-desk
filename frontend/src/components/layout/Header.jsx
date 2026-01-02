import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Menu,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  Keyboard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NotificationsDropdown from "../NotificationsDropdown";
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from "../KeyboardShortcuts";

export default function Header({ onMenuClick, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const { shortcuts } = useKeyboardShortcuts({
    onShowHelp: () => setShowShortcuts(true),
    onEscape: () => {
      setShowShortcuts(false);
      setShowMobileSearch(false);
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-background px-3 md:px-4">
      {/* Left side */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-9"
            />
          </div>
        </form>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="absolute inset-0 bg-background z-50 flex items-center px-3 md:hidden">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9"
                autoFocus
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileSearch(true)}
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* Keyboard shortcuts - hide on mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowShortcuts(true)}
          className="hidden md:inline-flex"
        >
          <Keyboard className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1 md:gap-2 px-2 md:px-3">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs md:text-sm font-medium text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden lg:inline max-w-[100px] truncate">{user?.name}</span>
              <ChevronDown className="h-4 w-4 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 lg:hidden">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="lg:hidden" />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <KeyboardShortcutsHelp shortcuts={shortcuts} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
