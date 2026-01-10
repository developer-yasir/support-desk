import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  Settings,
  UserCog,
  PanelLeftClose,
  PanelLeft,
  Headphones,
  Zap,
  X,
  Shield,
  FileText,
  Building2,
  ClipboardList,
  Contact,
  UserPlus,
  LogOut,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: Ticket, roles: ["company_manager", "agent"] },
  { name: "Contacts", href: "/contacts", icon: Contact, roles: ["company_manager", "agent"] },
  { name: "Companies", href: "/companies", icon: Building2, roles: ["superadmin", "company_manager", "agent"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["superadmin", "company_manager"] },
];

const adminNavigation = [
  { name: "Teams", href: "/admin/teams", icon: Users, roles: ["superadmin"] },
  { name: "Permissions", href: "/admin/permissions", icon: Shield, roles: ["superadmin"] },
  { name: "Report Builder", href: "/admin/reports", icon: FileText, roles: ["superadmin"] },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList, roles: ["superadmin"] },
  { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["superadmin", "company_manager"] },
];

export default function Sidebar({ open, onToggle, onNavigate, isMobile }) {
  const { user, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = !open && !isMobile;

  const normalizeRole = (role) => {
    const r = String(role ?? "").trim().toLowerCase().replace(/\s+/g, "_");
    if (r === "manager" || r === "companymanager" || r === "company_manager") return "company_manager";
    if (r === "admin" || r === "super_admin" || r === "superadmin") return "superadmin";
    return r;
  };

  const effectiveRole = normalizeRole(user?.role);
  const isManager = effectiveRole === 'company_manager';
  const showAdminSection = isSuperAdmin || isManager;

  // Dashboard and Tickets should ALWAYS be visible regardless of role
  const alwaysVisibleNav = navigation.filter((item) => !item.roles);

  const roleBasedNav = navigation.filter(
    (item) => item.roles && item.roles.includes(effectiveRole)
  );

  const filteredAdminNav = adminNavigation.filter(
    (item) => !item.roles || item.roles.includes(effectiveRole)
  );

  // Combine: always-visible items + role-based items
  const filteredNav = [...alwaysVisibleNav, ...roleBasedNav];

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const renderNavItem = (item, section = "Main") => {
    const IconComponent = item.icon;

    // Collapsed rail: icons only (no Radix tooltip wrapper to avoid layout/render issues)
    if (isCollapsed) {
      return (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === "/"}
          onClick={handleNavClick}
          aria-label={item.name}
          title={`${section}: ${item.name}`}
          className={({ isActive }) =>
            cn(
              "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
              )}
              <IconComponent className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </>
          )}
        </NavLink>
      );
    }

    // Expanded sidebar
    const navLink = (
      <NavLink
        to={item.href}
        end={item.href === "/"}
        onClick={handleNavClick}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-lg font-medium transition-all duration-200 px-3 py-2.5",
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )
        }
      >
        <IconComponent className="h-5 w-5 flex-shrink-0" />
        <span>{item.name}</span>
      </NavLink>
    );

    return <div key={item.href}>{navLink}</div>;
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out h-full",
        isCollapsed ? "w-16" : "w-64",
        isMobile && "w-64"
      )}
    >
      {/* Logo Header */}
      <div className={cn(
        "flex h-14 items-center border-b border-sidebar-border shrink-0",
        isCollapsed ? "justify-center" : "justify-between px-4"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {user?.company?.logo ? (
            // Custom image logo
            <>
              <img
                src={user.company.logo}
                alt={user.company.name || "Company"}
                className={cn(
                  "object-contain",
                  isCollapsed ? "h-8 w-8 rounded-lg" : "h-8 w-auto max-w-[180px]"
                )}
              />
            </>
          ) : (
            // Default text logo with company name
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shrink-0">
                <span className="text-sm font-bold text-primary-foreground">
                  {user?.company?.name?.slice(0, 2).toUpperCase() ||
                    user?.name?.slice(0, 2).toUpperCase() ||
                    "WD"}
                </span>
              </div>
              {!isCollapsed && (
                <span className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                  {user?.company?.name || "WorkDesks"}
                </span>
              )}
            </>
          )}
        </div>

        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Toggle Button - Desktop only */}
      {!isMobile && (
        <div className={cn(
          "flex h-10 items-center border-b border-sidebar-border shrink-0",
          isCollapsed ? "justify-center" : "justify-end px-3"
        )}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {open ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {open ? "Collapse" : "Expand"}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden py-3",
        isCollapsed ? "px-3" : "px-3"
      )}>
        {/* Main Section */}
        {!isCollapsed && (
          <div className="mb-2 px-3">
            <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Main
            </span>
          </div>
        )}

        <div className={cn(
          "space-y-1",
          isCollapsed && "flex flex-col items-center"
        )}>
          {filteredNav.map((item) => renderNavItem(item, "Main"))}
        </div>

        {/* Admin Section */}
        {showAdminSection && (
          <>
            {/* Divider */}
            <div className={cn(
              "my-4",
              isCollapsed ? "flex justify-center" : "px-3"
            )}>
              {isCollapsed ? (
                <div className="w-6 h-px bg-sidebar-border" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    Admin
                  </span>
                  <div className="flex-1 h-px bg-sidebar-border" />
                </div>
              )}
            </div>

            <div className={cn(
              "space-y-1",
              isCollapsed && "flex flex-col items-center"
            )}>
              {filteredAdminNav.map((item) => renderNavItem(item, "Admin"))}
            </div>
          </>
        )}
      </nav>

      {/* User Profile - Clickable with dropdown */}
      <div className={cn(
        "border-t border-sidebar-border shrink-0",
        isCollapsed ? "p-2" : "p-3"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center rounded-lg cursor-pointer w-full transition-colors",
                isCollapsed
                  ? "justify-center p-1 hover:bg-sidebar-accent"
                  : "gap-3 p-2 hover:bg-sidebar-accent"
              )}
            >
              <div className={cn(
                "rounded-full bg-primary/90 flex items-center justify-center shrink-0",
                "h-8 w-8"
              )}>
                <span className="text-xs font-semibold text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              {!isCollapsed && user && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user.role === "superadmin"
                        ? "Super Admin"
                        : user.role === "company_manager"
                          ? "Manager"
                          : user.role === "customer"
                            ? "Customer"
                            : "Agent"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/40" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isCollapsed ? "right" : "top"}
            align={isCollapsed ? "start" : "end"}
            className="w-56"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                handleNavClick();
                navigate("/profile");
              }}
              className="cursor-pointer"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                handleNavClick();
                navigate("/admin/settings");
              }}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
