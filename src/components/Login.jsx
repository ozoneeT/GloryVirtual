import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const checkUserRole = async () => {
    try {
      // First check if profile exists, if not create one
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { id: user.id, role: 'user' }
          ]);
        
        if (insertError) throw insertError;
        navigate('/'); // New users are regular users by default
        return;
      }

      if (fetchError) throw fetchError;

      if (profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking role:', error);
      navigate('/'); // Default to explore if role check fails
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Role check will happen in useEffect when user is set
      if (data.user) {
        checkUserRole(data.user); // Pass the user object to checkUserRole
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 rounded-lg p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white/70 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 text-white focus:border-white/30 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 text-white focus:border-white/30 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-white/50 text-center text-sm">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-white hover:text-white/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}; 