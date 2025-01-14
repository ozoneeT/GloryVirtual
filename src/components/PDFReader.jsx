import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase/config';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFReader() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Book Info Header */}
        <div className="mb-8 text-white">
          <h1 className="text-3xl font-bold">{book?.title}</h1>
          <p className="text-gray-400">By {book?.author}</p>
        </div>

        {/* PDF Reader */}
        <div className="flex justify-center">
          <div className="relative">
            <HTMLFlipBook
              width={550}
              height={733}
              size="stretch"
              minWidth={315}
              maxWidth={1000}
              minHeight={400}
              maxHeight={1533}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              className="book-reader"
            >
              {/* Cover Page */}
              <div className="page cover-page">
                <img
                  src={book?.cover_image}
                  alt={book?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* PDF Pages */}
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="page">
                  <Document
                    file={book?.pdf_url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={index + 1}
                      width={550}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
              ))}
            </HTMLFlipBook>

            {/* Navigation Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/50 px-4 py-2 rounded-full">
              <button
                onClick={() => setPageNumber(prev => Math.max(1, prev - 2))}
                className="text-white hover:text-gray-300 disabled:opacity-50"
                disabled={pageNumber <= 1}
              >
                Previous
              </button>
              <span className="text-white">
                {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(prev => Math.min(numPages, prev + 2))}
                className="text-white hover:text-gray-300 disabled:opacity-50"
                disabled={pageNumber >= numPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 