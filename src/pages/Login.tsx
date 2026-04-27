import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, LogIn } from 'lucide-react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect them
  React.useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/shop";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
      // Navigation happens in useEffect once user state updates
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="font-serif font-bold text-4xl tracking-tight text-warm-dark">
            Welcome <span className="text-warm-accent italic">Patron</span>
          </span>
          <p className="text-warm-dark/60 mt-3 font-medium uppercase tracking-widest text-sm text-center">
            Sign in to track your jars of heritage
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl border-2 border-warm-dark text-center relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-warm-accent/20 border border-warm-dark/20 transform rotate-1"></div>
          
          <h2 className="text-2xl font-serif font-bold text-warm-dark mb-6 italic">Member Access</h2>
          
          <p className="text-warm-dark/60 mb-8 font-serif">
            Join our community to view your order history and manage your delivery preferences.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-warm-dark border-2 border-warm-dark py-4 rounded-2xl font-bold tracking-wide uppercase text-sm hover:bg-warm-bg transition-all shadow-[4px_4px_0px_#3A2A22] disabled:opacity-70 disabled:cursor-not-allowed group"
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

          <div className="mt-8 pt-6 border-t-2 border-dashed border-warm-dark/10">
            <Link to="/shop" className="text-warm-accent font-bold uppercase tracking-widest text-[10px] hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Back to Pantry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
