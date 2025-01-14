import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

export const LocalBookView = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        
        // Fetch book details from Supabase
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setBook(data);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading book...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8 flex items-center justify-center">
        <div className="text-white text-xl">Book not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/explore" 
          className="inline-block mb-8 text-white/70 hover:text-white transition-colors"
        >
          ← Back to Books
        </Link>

        <div className="bg-white/10 rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              {book.cover_url && (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-cover.jpg';
                  }}
                />
              )}
              
              {book.pdf_url && (
                <a
                  href={book.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block text-center px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors mt-6"
                >
                  Read Book
                </a>
              )}
            </div>
            
            <div className="w-full md:w-2/3">
              <h1 className="text-white text-3xl font-bold mb-4">{book.title}</h1>
              <p className="text-white/70 mb-6">By {book.author}</p>
              <div className="prose prose-invert">
                <p className="text-white/90 leading-relaxed">{book.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};