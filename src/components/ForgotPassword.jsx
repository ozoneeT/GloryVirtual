import { useState } from 'react';
import { supabase } from '../supabase/config'; // Adjust the import based on your project structure
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      setMessage('Check your email for the password reset link!');
      setEmail('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
        {message && <div className="mb-4 text-red-500">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Remembered your password?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword; 