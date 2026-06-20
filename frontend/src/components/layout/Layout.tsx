import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { LogOut, BookOpen, LayoutDashboard, Users, Moon, Sun, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'MENTOR' 
    ? [
        { label: 'Dashboard', path: '/mentor', icon: Users },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Courses', path: '/courses', icon: BookOpen },
      ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 text-slate-900 dark:text-slate-50 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-full md:w-72 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-r border-white/20 dark:border-slate-800/50 flex flex-col z-20 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
        
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight"
            >
              Progressive
            </motion.h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
              Dashboard
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </Button>
        </div>
        
        {/* Navigation Section */}
        <nav className="flex-1 p-4 md:p-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-medium text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider">
            Menu
          </p>
          <AnimatePresence>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {/* Active Background Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {/* Hover state background */}
                    <div className="absolute inset-0 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative flex items-center space-x-3 z-10">
                      <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : 'group-hover:bg-white dark:group-hover:bg-slate-800'}`}>
                        <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`} />
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 md:p-6 mt-auto">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-md cursor-pointer group transition-all"
            onClick={handleLogout}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 font-semibold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[100px]">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {user?.role?.toLowerCase() || "Student"}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-colors">
              <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
            </div>
          </motion.div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative h-full overflow-y-auto p-4 md:p-8 lg:p-10 z-10 custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};
