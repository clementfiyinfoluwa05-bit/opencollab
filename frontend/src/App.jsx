import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages (we'll build these next)
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import SingleProject from './pages/SingleProject';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import ViewApplicants from './pages/ViewApplicants';
import UserProfile from './pages/UserProfile';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    // AuthProvider wraps everything so all pages can access user info
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                          element={<Feed />} />
          <Route path="/login"                     element={<Login />} />
          <Route path="/register"                  element={<Register />} />
          <Route path="/projects/:id"              element={<SingleProject />} />
          <Route path="/projects/new"              element={<CreateProject />} />
          <Route path="/projects/:id/edit"         element={<EditProject />} />
          <Route path="/projects/:id/applications" element={<ViewApplicants />} />
          <Route path="/users/:id"                 element={<UserProfile />} />
          <Route path="/auth/callback"             element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
