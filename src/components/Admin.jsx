import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useNavigate } from 'react-router-dom';

export const Admin = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // New book form state
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    pdf_url: ''
  });

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        navigate('/login');
      }
    };
    checkAdmin();
  }, [navigate]);

  // Fetch books
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([newBook])
        .select();

      if (error) throw error;

      setBooks([...books, data[0]]);
      setNewBook({
        title: '',
        author: '',
        description: '',
        cover_url: '',
        pdf_url: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const { error } = await supabase
          .from('books')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setBooks(books.filter(book => book.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-white/10 rounded text-white hover:bg-white/20"
          >
            Sign Out
          </button>
        </div>

        {/* Add New Book Form */}
        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Book</h2>
          <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="px-4 py-2 rounded bg-white/5 border border-white/10 text-white"
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              className="px-4 py-2 rounded bg-white/5 border border-white/10 text-white"
            />
            <input
              type="text"
              placeholder="Cover URL"
              value={newBook.cover_url}
              onChange={(e) => setNewBook({ ...newBook, cover_url: e.target.value })}
              className="px-4 py-2 rounded bg-white/5 border border-white/10 text-white"
            />
            <input
              type="text"
              placeholder="PDF URL"
              value={newBook.pdf_url}
              onChange={(e) => setNewBook({ ...newBook, pdf_url: e.target.value })}
              className="px-4 py-2 rounded bg-white/5 border border-white/10 text-white"
            />
            <textarea
              placeholder="Description"
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              className="px-4 py-2 rounded bg-white/5 border border-white/10 text-white md:col-span-2"
              rows="3"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-white/20 rounded text-white hover:bg-white/30 md:col-span-2"
            >
              Add Book
            </button>
          </form>
        </div>

        {/* Books List */}
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Manage Books</h2>
          {loading ? (
            <p className="text-white">Loading books...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book.id} className="bg-white/5 rounded-lg p-4">
                  <img
                    src={book.cover_url || '/placeholder-cover.jpg'}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <h3 className="text-white font-semibold mb-2">{book.title}</h3>
                  <p className="text-white/70 text-sm mb-4">{book.author}</p>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 