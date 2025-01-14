import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

export const Admin = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    cover_image: '',
    pdf_url: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [useImageUrl, setUseImageUrl] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*');
    
    if (error) {
      console.error('Error fetching books:', error);
    } else {
      setBooks(data);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file');
      e.target.value = null;
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB in bytes
        alert('Image size should not exceed 500KB');
        e.target.value = null;
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        e.target.value = null;
        return;
      }
      setCoverFile(file);
    }
  };

  const uploadFile = async (file, bucket) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
            setUploadStatus(`Uploading ${bucket === 'pdfs' ? 'PDF' : 'cover image'}... ${Math.round(percent)}%`);
          },
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${bucket}:`, error);
      return null;
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Starting upload...');

    try {
      // Upload PDF
      const pdfUrl = await uploadFile(pdfFile, 'pdfs');
      if (!pdfUrl) throw new Error('Failed to upload PDF');

      // Upload or use cover image URL
      let coverImageUrl = newBook.cover_image;
      if (!useImageUrl && coverFile) {
        coverImageUrl = await uploadFile(coverFile, 'covers');
        if (!coverImageUrl) throw new Error('Failed to upload cover image');
      }

      // Create book record
      const { error } = await supabase
        .from('books')
        .insert([{
          ...newBook,
          pdf_url: pdfUrl,
          cover_image: coverImageUrl
        }]);

      if (error) throw error;

      setUploadStatus('Book added successfully!');
      
      // Reset form
      setNewBook({ title: '', author: '', description: '', cover_image: '', pdf_url: '' });
      setPdfFile(null);
      setCoverFile(null);
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
      fetchBooks();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);

    } catch (error) {
      console.error('Error adding book:', error);
      setUploadStatus('Error adding book. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteBook = async (id, pdfUrl, coverUrl) => {
    try {
      // Delete the PDF file from storage
      if (pdfUrl) {
        const pdfPath = pdfUrl.split('/').pop();
        await supabase.storage.from('pdfs').remove([pdfPath]);
      }

      // Delete the cover image if it's in our storage
      if (coverUrl && coverUrl.includes(supabase.storageUrl)) {
        const coverPath = coverUrl.split('/').pop();
        await supabase.storage.from('covers').remove([coverPath]);
      }

      // Delete the book record
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Books</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{books.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">PDFs Uploaded</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {books.filter(book => book.pdf_url).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">With Cover Images</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {books.filter(book => book.cover_image).length}
            </p>
          </div>
        </div>

        {/* Add Book Form */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Book</h2>
            <form onSubmit={handleAddBook} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter book title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    placeholder="Enter author name"
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter book description"
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={useImageUrl}
                    onChange={() => setUseImageUrl(!useImageUrl)}
                    id="useImageUrl"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useImageUrl" className="text-sm font-medium text-gray-700">
                    Use Image URL
                  </label>
                </div>

                {useImageUrl ? (
                  <input
                    type="text"
                    placeholder="Enter cover image URL"
                    value={newBook.cover_image}
                    onChange={(e) => setNewBook({...newBook, cover_image: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1z" />
                      </svg>
                      <span className="mt-2 text-base">Select cover image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12h2v-2h2V8h-2V6H9v2H7v2h2v2zm-7 0c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8-8 3.59-8 8zm16 0c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6z"/>
                  </svg>
                  <span className="mt-2 text-base">Select PDF file</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploading && (
                <div className="w-full">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {uploadStatus && (
                <div className={`p-4 rounded-md ${
                  uploadStatus.includes('Error') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : uploadStatus.includes('successfully')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {uploadStatus}
                </div>
              )}

              <button 
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {uploading ? 'Adding Book...' : 'Add Book'}
              </button>
            </form>
          </div>
        </div>

        {/* Books List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">By {book.author}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.pdf_url && (
                        <a 
                          href={book.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12h2v-2h2V8h-2V6H9v2H7v2h2v2zm-7 0c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8-8 3.59-8 8zm16 0c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6z"/>
                          </svg>
                          View PDF
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteBook(book.id, book.pdf_url, book.cover_image)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 