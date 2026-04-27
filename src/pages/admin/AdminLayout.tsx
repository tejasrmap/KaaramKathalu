import React, { useState } from 'react';
import { NavLink, Outlet, Link, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
    { to: '/admin/products', icon: <Package className="w-5 h-5" />, label: 'Products' },
    // Mock links for visually complete interface
    { to: '/admin/customers', icon: <Users className="w-5 h-5" />, label: 'Customers' },
    { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif font-bold text-xl tracking-tight text-white flex items-baseline gap-1">
            <span>Kaaram</span>
            <span className="text-warm-accent text-2xl leading-none ml-1">కథలు</span>
          </span>
          <span className="text-xs bg-warm-accent/20 text-warm-accent px-2 py-1 rounded-full font-medium ml-2">ADMIN</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-warm-accent text-white shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border-2 border-warm-accent/20" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-warm-accent/20 flex items-center justify-center text-warm-accent font-bold">
              {user?.displayName?.[0] || 'A'}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.displayName || 'Admin User'}</p>
            <p className="text-xs text-white/50 truncate">{user?.email || 'admin@kaaramkathalu.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );


  return (
    <div className="flex h-screen bg-warm-bg overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-warm-dark text-white flex-shrink-0 shadow-2xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-warm-dark text-white z-30 flex items-center justify-between px-4 shadow-md">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif font-bold text-lg tracking-tight flex items-baseline gap-1 text-white">
            <span>Kaaram</span>
            <span className="text-warm-accent text-xl ml-1">కథలు</span>
          </span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-white/10 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-warm-dark text-white z-50 flex flex-col shadow-2xl"
            >
              <div className="absolute top-4 right-4 md:hidden">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
