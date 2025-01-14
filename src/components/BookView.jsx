import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function BookPreview() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Fetch book details from multiple endpoints
        const [workResponse, editionsResponse] = await Promise.all([
          fetch(`https://openlibrary.org/works/${id}.json`),
          fetch(`https://openlibrary.org/works/${id}/editions.json?limit=1`)
        ]);

        const workData = await workResponse.json();
        const editionsData = await editionsResponse.json();

        // Get the first edition for additional details
        const firstEdition = editionsData.entries?.[0];
        const isbnList = firstEdition?.isbn_13 || firstEdition?.isbn_10 || [];
        const isbn = isbnList[0];

        // Fetch author details if available
        let authorData = null;
        if (workData.authors?.[0]?.author?.key) {
          const authorResponse = await fetch(`https://openlibrary.org${workData.authors[0].author.key}.json`);
          authorData = await authorResponse.json();
        }

        const formattedBook = {
          id: id,
          title: workData.title,
          subtitle: workData.subtitle,
          author: authorData?.name || workData.authors?.[0]?.name || 'Unknown Author',
          authorBio: authorData?.bio?.value || authorData?.bio || null,
          description: workData.description?.value || workData.description || 'No description available',
          cover: workData.covers?.[0] 
            ? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`
            : '/placeholder-cover.jpg',
          publishDate: firstEdition?.publish_date,
          publisher: firstEdition?.publishers?.[0],
          isbn: isbn,
          subjects: workData.subjects || [],
          readLink: firstEdition?.ia?.[0],
          goodreadsLink: isbn ? `https://www.goodreads.com/search?q=${isbn}` : null,
        };
        
        setBook(formattedBook);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8 flex items-center justify-center">
      <div className="text-white text-xl">Loading book details...</div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8 flex items-center justify-center">
      <div className="text-white text-xl">Book not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#5a47ce] to-[#232323] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link 
          to="/explore" 
          className="inline-block mb-8 text-white/70 hover:text-white transition-colors"
        >
          ← Back to Search
        </Link>

        <div className="bg-white/10 rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-cover.jpg';
                }}
              />
              
              {/* External Links */}
              <div className="mt-6 space-y-3">
                {book.readLink && (
                  <a
                    href={`https://archive.org/details/${book.readLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block text-center px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  >
                    Read on Internet Archive
                  </a>
                )}
                {book.goodreadsLink && (
                  <a
                    href={book.goodreadsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block text-center px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  >
                    View on Goodreads
                  </a>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <h1 className="text-white text-3xl font-bold mb-2">{book.title}</h1>
              {book.subtitle && (
                <h2 className="text-white/70 text-xl mb-4">{book.subtitle}</h2>
              )}
              <p className="text-white/70 mb-6">By {book.author}</p>
              
              {book.publishDate && (
                <p className="text-white/50 mb-4">Published: {book.publishDate}</p>
              )}
              
              {book.publisher && (
                <p className="text-white/50 mb-6">Publisher: {book.publisher}</p>
              )}

              <div className="prose prose-invert mb-8">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-white/90 leading-relaxed">{book.description}</p>
              </div>

              {book.authorBio && (
                <div className="prose prose-invert mb-8">
                  <h3 className="text-xl font-semibold mb-3">About the Author</h3>
                  <p className="text-white/90 leading-relaxed">{book.authorBio}</p>
                </div>
              )}

              {book.subjects?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.subjects.map((subject, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
