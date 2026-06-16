import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, Shield, User, UserCog, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

import { api } from "../lib/api";
import { AdminUsersSkeleton } from "@/components/ui/page-skeletons";

// Helper to get initials
const getInitials = (name) => {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const RoleBadge = ({ role }) => {
  const config = {
    superadmin: { label: "Super Admin", icon: Shield, className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    company_manager: { label: "Manager", icon: User, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    agent: { label: "Agent", icon: UserCog, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  };
  const { label, icon: Icon, className } = config[role] || { label: role, icon: User, className: "" };

  return (
    <Badge variant="secondary" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent",
  });

  const fetchUsers = useCallback(async (overrides = {}) => {
    const nextPage = overrides.page ?? pagination.page;
    const nextLimit = overrides.limit ?? pagination.limit;
    const nextSearch = overrides.search ?? search;
    const nextRole = overrides.roleFilter ?? roleFilter;

    try {
      setLoading(true);
      const params = {
        page: nextPage,
        limit: nextLimit,
        search: nextSearch.trim(),
      };

      if (nextRole !== "all") {
        params.role = nextRole;
      }

      const res = await api.getUsers(params);
      const usersData = res.data.users || [];
      setUsers(usersData);
      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination({
          total: usersData.length,
          page: nextPage,
          pages: 1,
          limit: nextLimit,
        });
      }
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleToggleFullAccess = async (user) => {
    if (user.role !== 'agent') return;

    const hasAccess = user.permissions?.includes('view_all_tickets');
    let newPermissions = user.permissions || [];

    if (hasAccess) {
      newPermissions = newPermissions.filter(p => p !== 'view_all_tickets');
    } else {
      newPermissions = [...newPermissions, 'view_all_tickets'];
    }

    try {
      const res = await api.updateUser(user._id, { permissions: newPermissions });
      // Update local state
      setUsers(prev => prev.map(u => u._id === user._id ? res.data.user : u));
      toast.success(`Permissions updated for ${user.name}`);
    } catch (err) {
      toast.error("Failed to update permissions");
    }
  };

  const filteredUsers = users;

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await api.createUser(formData);
      await fetchUsers({ page: 1 });
      toast.success("User created successfully!");
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", password: "", role: "agent" }); // Reset
    } catch (err) {
      toast.error(err.message || "Failed to create user");
    }
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === 'manager') {
      return [
        { value: 'agent', label: 'Agent' },
        { value: 'customer', label: 'Customer' }
      ];
    }
    // Superadmin / Admin
    return [
      { value: 'superadmin', label: 'Super Admin' },
      { value: 'company_manager', label: 'Company Manager' },
      { value: 'agent', label: 'Agent' },
      { value: 'customer', label: 'Customer' }
    ];
  };

  if (loading) {
    return <AdminUsersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage agents, admins, and customer accounts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to your support team
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRoles().map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="superadmin">Super Admins</SelectItem>
            <SelectItem value="company_manager">Company Managers</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    {user.role === 'agent' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 text-xs border",
                          user.permissions?.includes('view_all_tickets')
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        )}
                        onClick={() => handleToggleFullAccess(user)}
                      >
                        {user.permissions?.includes('view_all_tickets') ? 'Full Access' : 'Restricted'}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        {user.role === 'agent' && (
                          <DropdownMenuItem onClick={() => handleToggleFullAccess(user)}>
                            {user.permissions?.includes('view_all_tickets') ? 'Restrict Access' : 'Grant Full Access'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination.total > 0
            ? `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )} of ${pagination.total}`
            : "0 users"}
        </p>
        <Pagination className="w-auto ml-auto sm:ml-0">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.pages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
