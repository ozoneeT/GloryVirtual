import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import {Explore} from './components/Explore';
import { Login } from "./components/Login";
import { Admin } from "./components/Admin";
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { SignUp } from './components/SignUp';
import { AdminRoute } from './components/AdminRoute';
import BookView from './components/BookView';
import LocalBookView from './components/LocalBookView';
import PDFReader from './components/PDFReader';
import { ProfileScreen } from './components/ProfileScreen';
import ForgotPassword from './components/ForgotPassword'; 
import ContactAdmin from './components/ContactAdmin'; 
import RequestBook from './components/RequestBook';

// Component to handle auth-based redirects
const Root = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <>
      <UI />
      <Canvas className="canvas" shadows camera={{
        position: [-0.5, 1, window.innerWidth > 800 ? 4 : 9],
        fov: 25,
      }}>
        <group position-y={0.05} position-x={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Loader />
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Root />
            </ProtectedRoute>
          } />
          
          <Route path="/explore" element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          } />
          <Route path="/book/:id" element={<BookView />} />
          <Route path="/book/local/:id" element={<LocalBookView />} />
          <Route path="/read/:id" element={<PDFReader />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />

          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/contact-admin" element={<ContactAdmin />} />
          <Route path="/request-book" element={<RequestBook />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
