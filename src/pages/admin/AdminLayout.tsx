import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-warm-accent/20 border-t-warm-accent rounded-full animate-spin mb-4" />
          <p className="font-serif italic text-warm-dark/60 text-sm">Verifying administrator session...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" />, label: 'Orders' },
    { to: '/admin/products', icon: <Package className="w-4 h-4" />, label: 'Products' },
    { to: '/admin/customers', icon: <Users className="w-4 h-4" />, label: 'Customers' },
    { to: '/admin/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
    { to: '/admin/users', icon: <UserCog className="w-4 h-4" />, label: 'Admins' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10">
        {/* Admin Navigation Header / Tabs */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-warm-accent/10 text-warm-accent px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3">
            Admin Portal
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-warm-dark mb-3">Store Dashboard</h1>
          <p className="text-sm font-serif italic text-warm-dark/60 max-w-md mx-auto mb-8">
            Manage transactions, update stock parameters, and adjust announcement configurations.
          </p>

          <div className="flex flex-wrap justify-center gap-2 border-b border-warm-dark/10 pb-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-3 rounded-full text-xs font-heading tracking-widest uppercase transition-all duration-200 border ${
                    isActive
                      ? 'bg-warm-accent text-white border-warm-accent font-semibold shadow-sm'
                      : 'bg-warm-light text-warm-dark/70 border-warm-dark/10 hover:border-warm-dark hover:text-warm-dark'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-heading tracking-widest uppercase transition-all duration-200 border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-warm-dark/5 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
}
