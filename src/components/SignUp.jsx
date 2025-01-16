import { useState } from 'react';
import { supabase } from '../supabase/config';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [wantToBeAdmin, setWantToBeAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  
  const ADMIN_SECRET_CODE = "iamadmin";

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Admin code validation
    if (wantToBeAdmin && adminCode !== ADMIN_SECRET_CODE) {
      setError("Invalid admin code");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: wantToBeAdmin && adminCode === ADMIN_SECRET_CODE ? 'admin' : 'user'
          }
        }
      });

      if (error) throw error;

      if (data) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              role: wantToBeAdmin && adminCode === ADMIN_SECRET_CODE ? 'admin' : 'user'
            }
          ]);

        if (profileError) throw profileError;

        // Show success message
        alert('Check your email for the confirmation link!');
        navigate('/login');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 rounded-lg p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-6">
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

          <div>
            <label className="block text-white/70 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 text-white focus:border-white/30 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="adminCheckbox"
              type="checkbox"
              checked={wantToBeAdmin}
              onChange={(e) => setWantToBeAdmin(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-white/30 focus:ring-blue-500"
            />
            <label htmlFor="adminCheckbox" className="ml-2 text-white/70">
              Sign up as Admin
            </label>
          </div>

          {wantToBeAdmin && (
            <div>
              <label className="block text-white/70 mb-2" htmlFor="adminCode">
                Admin Code
              </label>
              <input
                id="adminCode"
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 text-white focus:border-white/30 focus:outline-none"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-white/50 text-center text-sm">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-white hover:text-white/80 transition-colors"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}; 