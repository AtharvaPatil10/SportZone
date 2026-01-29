import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import VenueList from './pages/VenueList';
import VenueDetails from './pages/VenueDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import UserBookings from './pages/UserBookings';
import VenueOwnerDashboard from './pages/VenueOwnerDashboard';
import VenueDashboard from './pages/VenueDashboard';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<VenueList />} />
          <Route path="/venues/:id" element={<VenueDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/my-bookings" element={<UserBookings />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner-dashboard" 
            element={
              <ProtectedRoute role="VENUE_OWNER">
                <VenueOwnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/venue-dashboard/:id" 
            element={
              <ProtectedRoute role="VENUE_OWNER">
                <VenueDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
