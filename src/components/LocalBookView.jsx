import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

export default function LocalBookView() {
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
              {book.cover_image && (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-cover.jpg';
                  }}
                />
              )}
              
              {book.pdf_url && (
                <>
                <a
                  href={book.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block text-center px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors mt-6"
                >
                  Read Book
                </a>

                <Link
    to={`/read/${book.id}`}
    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    <svg 
      className="mr-2 h-5 w-5" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
    Read Book Now
  </Link>
                </>
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