import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';

export const LogoutButton = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-white/10 rounded text-white hover:bg-white/20 transition-colors ${className}`}
    >
      Logout
    </button>
  );
}; 