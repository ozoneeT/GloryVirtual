import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { LogoutButton } from './LogoutButton';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/config';

const pictures = [
  "DSC00680",
  "DSC00933",
  "DSC00966",
  "DSC00983",
  "DSC01011",
  "DSC01040",
  "DSC01064",
  "DSC01071",
  "DSC01103",
  "DSC01145",
  "DSC01420",
  "DSC01461",
  "DSC01489",
  "DSC02031",
  "DSC02064",
  "DSC02069",
];

export const pageAtom = atom(0);
export const pages = [
  {
    front: "book-cover",
    back: pictures[0],
  },
];
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
  });
}

pages.push({
  front: pictures[pictures.length - 1],
  back: "book-back",
});

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/login'); // Redirect to login after logout
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white focus:outline-none"
      >
        {/* Hamburger Icon */}
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-2">
            <Link
              to="/profile"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              onClick={() => setIsOpen(false)} // Close menu on click
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);
  const scrollToExplore = () => {
    document.querySelector('.explore').scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 p-4">
        <div className=" container mx-auto flex justify-between items-center">
        <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
         
  

      {/* Admin Dashboard Button - Only visible to admins */}
      {user ? (
        user?.user_metadata?.role === 'admin' ? (
          <button
            onClick={() => navigate('/admin')}
            className="pointer-events-auto fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Admin Dashboard</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/contact-admin')}
            className="pointer-events-auto fixed bottom-8 right-8 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 3h18v18H3V3z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 9h6v6H9z"
              />
            </svg>
            <span>Contact Admin</span>
          </button>
        )
      ) : null}


          <div className="w-full flex justify-end p-10">
              <button
                className="pointer-events-auto border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border bg-black/30 text-white"
                onClick={() => navigate('/explore')}
              >
                Explore Books
              </button>
            </div>
            
            {/* <div className="absolute top-10 left-10">
              <a
                className="pointer-events-auto"
                href="https://lessons.wawasensei.dev/courses/react-three-fiber"
              >
                <img className="w-20" src="/images/wawasensei-white.png" />
              </a>
            </div> */}
              
          
            <div className=" w-full overflow-auto pointer-events-auto flex justify-center">
              <div className="overflow-auto flex items-center gap-4 max-w-full p-5">
                {[...pages].map((_, index) => (
                  <button
                    key={index}
                    className={`border-transparent hover:border-white transition-all duration-300  px-2 py-2 rounded-full  text-sm uppercase shrink-0 border ${
                      index === page
                        ? "bg-white/90 text-black"
                        : "bg-black/30 text-white"
                    }`}
                    onClick={() => setPage(index)}
                  >
                    {index === 0 ? "Cover" : `Page ${index}`}
                  </button>
                ))}
                <button
                  className={`border-transparent hover:border-white transition-all duration-300  px-2 py-2 rounded-full  text-sm uppercase shrink-0 border ${
                    page === pages.length
                      ? "bg-white/90 text-black"
                      : "bg-black/30 text-white"
                  }`}
                  onClick={() => setPage(pages.length)}
                >
                  Back Cover
                </button>
              
              </div>
            </div>
           
          </main>
              

          {/* <div className="fixed inset-0 flex items-center -rotate-2 select-none hidden">
            <div className="relative">
              <div className="bg-white/0  animate-horizontal-scroll flex items-center gap-8 w-max px-8">
                <h1 className="shrink-0 text-white text-10xl font-black ">
                  Wawa Sensei
                </h1>
                <h2 className="shrink-0 text-white text-8xl italic font-light">
                  React Three Fiber
                </h2>
                <h2 className="shrink-0 text-white text-12xl font-bold">
                  Three.js
                </h2>
                <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
                  Ultimate Guide
                </h2>
                <h2 className="shrink-0 text-white text-9xl font-medium">
                  Tutorials
                </h2>
                <h2 className="shrink-0 text-white text-9xl font-extralight italic">
                  Learn
                </h2>
                <h2 className="shrink-0 text-white text-13xl font-bold">
                  Practice
                </h2>
                <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
                  Creative
                </h2>
              </div>
              <div className="absolute top-0 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-8 px-8 w-max">
                <h1 className="shrink-0 text-white text-10xl font-black ">
                  Wawa Sensei
                </h1>
                <h2 className="shrink-0 text-white text-8xl italic font-light">
                  React Three Fiber
                </h2>
                <h2 className="shrink-0 text-white text-12xl font-bold">
                  Three.js
                </h2>
                <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
                  Ultimate Guide
                </h2>
                <h2 className="shrink-0 text-white text-9xl font-medium">
                  Tutorials
                </h2>
                <h2 className="shrink-0 text-white text-9xl font-extralight italic">
                  Learn
                </h2>
                <h2 className="shrink-0 text-white text-13xl font-bold">
                  Practice
                </h2>
                <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
                  Creative
                </h2>
              </div>
            </div>
          </div> */}
         
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-10 p-4  ">
        <div className="container mx-auto flex justify-between items-center">
          {/* <div className="flex gap-4 items-center">
            <Link 
              to="/explore" 
              className="px-4 py-2 bg-white/10 rounded text-white hover:bg-white/20 transition-colors"
            >
              Explore Books
            </Link>
          </div> */}
          {/* <LogoutButton className="shadow-lg" /> */}
         
          <HamburgerMenu/>
        </div>
      </div>
    </>
  );
};
