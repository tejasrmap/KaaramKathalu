import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login(true);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col justify-center items-center p-6 relative">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-warm-dark/60 hover:text-warm-dark font-medium transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Store
      </Link>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-2.5 rounded-full shadow-md border border-warm-accent/15 w-24 h-24 flex items-center justify-center overflow-hidden mb-4">
            <img 
              src="/logo_icon.jpg" 
              alt="Kaaram Kathalu Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <p className="text-warm-dark/60 font-medium uppercase tracking-widest text-sm text-center">
            Admin Portal
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl border border-warm-dark/5 text-center">
          <h2 className="text-2xl font-serif font-bold text-warm-dark mb-6">Administrator Access</h2>
          
          <p className="text-warm-dark/60 mb-8 font-serif italic">
            Please sign in with your authorized Google account to access the ledger and inventory.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-warm-dark border-2 border-warm-dark/10 py-4 rounded-2xl font-bold tracking-wide uppercase text-sm hover:bg-warm-bg hover:border-warm-dark/20 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              'Connecting...'
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <div className="mt-8 text-[10px] uppercase tracking-[0.2em] text-warm-dark/40 font-bold">
            Secure Heritage Access
          </div>
        </div>
      </div>
    </div>
  );
}

