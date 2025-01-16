import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { LogoutButton } from './LogoutButton';

export const Explore = () => {
  const [localBooks, setLocalBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch books from Supabase
  useEffect(() => {
    async function fetchLocalBooks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('books')
          .select('*');

        if (error) throw error;
        setLocalBooks(data || []);
      } catch (err) {
        console.error('Error fetching local books:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocalBooks();
  }, []);

  // Search books using Open Library API
  const searchBooks = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&fields=key,title,author_name,first_publish_year,cover_i,first_sentence,subject&limit=9`
      );
      const data = await response.json();
      
      const formattedResults = data.docs.map(book => ({
        id: book.key?.split('/').pop(),
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        publishYear: book.first_publish_year,
        coverUrl: book.cover_i 
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
          : '/placeholder-cover.jpg',
        firstSentence: book.first_sentence?.[0],
        subjects: book.subject?.slice(0, 3) || []
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Explore Books</h1>
          <LogoutButton />
        </div>
        
        
        {/* Available Books Section */}
        <section className="mb-16">
          <h2 className="text-white text-3xl font-bold mb-8">Available Books</h2>
          {loading ? (
            <div className="text-white">Loading available books...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {localBooks.map((book) => (
                <Link 
                  key={book.id} 
                  to={`/book/local/${book.id}`}
                  className="group"
                >
                  <div className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                    <div className="aspect-[4/3] mb-4 overflow-hidden rounded-lg">
                      <img
                        src={book.cover_image || '/placeholder-cover.jpg'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">{book.title}</h3>
                    <p className="text-white/70 mb-2">{book.author || 'Unknown Author'}</p>
                    <p className="text-white/50 text-sm line-clamp-2">{book.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <Link to="/request-book">
          <button className="bg-blue-600 text-white mb-10 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Request Book
          </button>
        </Link>
       
        {/* Search Section */}
        <section>
          <h2 className="text-white text-3xl font-bold mb-8">Search More Books</h2>
          <form onSubmit={searchBooks} className="max-w-4xl mb-12">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or subject..."
                className="flex-1 px-6 py-3 rounded-full bg-white/10 text-white border border-white/20 focus:border-white/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-8 py-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((book) => (
                <Link 
                  key={book.id} 
                  to={`/book/${book.id}`}
                  className="group"
                >
                  <div className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                    <div className="aspect-[3/4] mb-4 overflow-hidden rounded-lg">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/placeholder-cover.jpg';
                        }}
                      />
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">{book.title}</h3>
                    <p className="text-white/70 mb-2">{book.author}</p>
                    {book.publishYear && (
                      <p className="text-white/50 text-sm mb-2">Published: {book.publishYear}</p>
                    )}
                    {book.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {book.subjects.map((subject, index) => (
                          <span 
                            key={index}
                            className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/70"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      
      </div>
    </div>
  );
};

export default Explore;