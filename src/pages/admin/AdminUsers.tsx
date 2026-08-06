import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Trash2, Shield, ShieldOff, Loader2, CheckCircle2, AlertTriangle, Mail, Crown } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { usePopups } from '../../context/PopupContext';

interface AdminUser {
  email: string;
  name?: string;
  addedAt?: any;
  addedBy?: string;
  active: boolean;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { showAlert, showToast, showConfirm } = usePopups();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [togglingEmail, setTogglingEmail] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'admins'));
      const adminList: AdminUser[] = snapshot.docs.map(d => ({
        email: d.id,
        ...(d.data() as Omit<AdminUser, 'email'>)
      }));
      adminList.sort((a, b) => a.email.localeCompare(b.email));
      setAdmins(adminList);
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setSuccess(null);
    setTimeout(() => setError(null), 4000);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }
    if (admins.find(a => a.email === email)) {
      showError('This email is already an admin.');
      return;
    }

    setIsAdding(true);
    try {
      await setDoc(doc(db, 'admins', email), {
        name: newName.trim() || '',
        active: true,
        addedAt: serverTimestamp(),
        addedBy: user?.email || 'unknown'
      });
      setNewEmail('');
      setNewName('');
      showSuccess(`${email} has been added as an admin.`);
      await fetchAdmins();
    } catch (err: any) {
      showError(err.message || 'Failed to add admin.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (email: string, currentActive: boolean) => {
    setTogglingEmail(email);
    try {
      await setDoc(doc(db, 'admins', email), { active: !currentActive }, { merge: true });
      setAdmins(prev => prev.map(a => a.email === email ? { ...a, active: !currentActive } : a));
      showSuccess(`${email} has been ${!currentActive ? 'enabled' : 'disabled'}.`);
    } catch (err: any) {
      showError(err.message || 'Failed to update admin.');
    } finally {
      setTogglingEmail(null);
    }
  };

  const handleDelete = async (email: string) => {
    if (email === user?.email) {
      showError("You cannot remove yourself as an admin.");
      return;
    }
    const confirmed = await showConfirm(`Remove ${email} from admin access? They will immediately lose access.`, "Remove Admin Access");
    if (!confirmed) return;

    setDeletingEmail(email);
    try {
      await deleteDoc(doc(db, 'admins', email));
      setAdmins(prev => prev.filter(a => a.email !== email));
      showSuccess(`${email} has been removed.`);
    } catch (err: any) {
      showError(err.message || 'Failed to remove admin.');
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-warm-dark">Admin Access Control</h2>
          <p className="text-sm text-warm-dark/60 mt-1 font-serif">
            Manage who can access the admin portal. Only listed emails can sign in.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-warm-accent/10 text-warm-accent px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5" />
          {admins.filter(a => a.active).length} Active
        </div>
      </div>

      {/* Feedback banners */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-2xl text-sm font-serif"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-2xl text-sm font-serif"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Admin Form */}
      <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
        <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-warm-dark" />
          <h3 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Add New Admin</h3>
        </div>
        <form onSubmit={handleAddAdmin} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">
                Google Email Address <span className="text-warm-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/30" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="employee@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">
                Name (optional)
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Employee Name"
                className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors text-sm"
              />
            </div>
          </div>
          <p className="text-xs font-serif text-warm-dark/50 mb-4">
            The person must sign in using this exact Google account. They'll have full admin access immediately after being added.
          </p>
          <button
            type="submit"
            disabled={isAdding || !newEmail.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-warm-dark hover:bg-warm-accent disabled:bg-warm-dark/40 text-white font-heading uppercase tracking-wider text-xs rounded-xl transition-colors cursor-pointer shadow-sm disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</>
            ) : (
              <><UserPlus className="w-3.5 h-3.5" /> Add Admin</>
            )}
          </button>
        </form>
      </div>

      {/* Admins List */}
      <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
        <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-warm-dark" />
          <h3 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">
            Current Admins ({admins.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-warm-accent animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-12 h-12 text-warm-dark/20 mx-auto mb-3" />
            <p className="font-serif italic text-warm-dark/50">No admins configured yet.</p>
            <p className="text-xs text-warm-dark/40 mt-1 font-heading uppercase tracking-widest">Add your email above first</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-dark/5">
            {admins.map(admin => (
              <motion.div
                key={admin.email}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex items-center justify-between p-5 gap-4 ${!admin.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${admin.active ? 'bg-warm-accent/10' : 'bg-warm-dark/5'}`}>
                    {admin.email === user?.email ? (
                      <Crown className={`w-4 h-4 ${admin.active ? 'text-warm-accent' : 'text-warm-dark/30'}`} />
                    ) : (
                      <Shield className={`w-4 h-4 ${admin.active ? 'text-warm-accent' : 'text-warm-dark/30'}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-bold text-warm-dark text-sm truncate">{admin.name || admin.email}</p>
                      {admin.email === user?.email && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-warm-accent text-white px-2 py-0.5 rounded-full flex-shrink-0">You</span>
                      )}
                      {!admin.active && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-warm-dark/10 text-warm-dark/50 px-2 py-0.5 rounded-full flex-shrink-0">Disabled</span>
                      )}
                    </div>
                    {admin.name && (
                      <p className="text-xs text-warm-dark/50 font-serif truncate">{admin.email}</p>
                    )}
                    {admin.addedBy && (
                      <p className="text-[10px] text-warm-dark/30 font-heading uppercase tracking-wider mt-0.5">
                        Added by {admin.addedBy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Enable/Disable toggle */}
                  {admin.email !== user?.email && (
                    <button
                      onClick={() => handleToggleActive(admin.email, admin.active)}
                      disabled={togglingEmail === admin.email}
                      title={admin.active ? 'Disable access' : 'Enable access'}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        admin.active
                          ? 'border-warm-dark/10 text-warm-dark/50 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {togglingEmail === admin.email ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : admin.active ? (
                        <ShieldOff className="w-4 h-4" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Remove button */}
                  {admin.email !== user?.email && (
                    <button
                      onClick={() => handleDelete(admin.email)}
                      disabled={deletingEmail === admin.email}
                      title="Remove admin"
                      className="p-2 rounded-xl border border-warm-dark/10 text-warm-dark/40 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      {deletingEmail === admin.email ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Warning note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800 mb-1">Important</p>
          <p className="text-xs font-serif text-amber-700 leading-relaxed">
            Make sure to add <strong>your own email</strong> to this list before logging out. 
            If no admins are configured, no one will be able to sign in to the admin portal.
            Admins must use their Google account with the exact email listed here.
          </p>
        </div>
      </div>
    </div>
  );
}
