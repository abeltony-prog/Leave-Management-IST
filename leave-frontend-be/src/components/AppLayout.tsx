
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  User,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      name: 'Leave Requests',
      path: '/leave-requests',
      icon: <Calendar className="h-5 w-5" />,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      name: 'All Requests',
      path: '/admin/leave-requests',
      icon: <FileText className="h-5 w-5" />,
      roles: ['ADMIN'],
    },
  ];

  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || 'STAFF')
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white shadow-sm md:block">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-primary">LeaveFlow</h1>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors hover:bg-primary hover:text-white ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-700'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Navigation */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="md:hidden">
            <h1 className="text-xl font-bold text-primary">LeaveFlow</h1>
          </div>

          {/* User Menu */}
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {user?.role || 'STAFF'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex w-full items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-gray-800/50 md:hidden">
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <h1 className="text-xl font-bold text-primary">LeaveFlow</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors hover:bg-primary hover:text-white ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
