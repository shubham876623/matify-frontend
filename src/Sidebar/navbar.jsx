import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../api/axiosWithRefresh'; // Make sure this handles token refresh

const Navbar = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUsername(token); // optionally decode for actual username
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleNotificationClick = async () => {
    setNotification(false);
    setShowDropdown(!showDropdown);

    // Optional: Fetch notifications only when dropdown opens
    if (!showDropdown) {
      try {
        const res = await api.get('/api/training/notifications/');
        if (res.data && res.data.length > 0) {
          setNotifications(res.data);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    }
  };

  return (
    <header className="w-full bg-white shadow border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-black">
        Matify Studio
      </Link>

      <div className="flex items-center gap-4 relative">
        {isLoggedIn && (
          <>
            <button onClick={handleNotificationClick} className="relative">
              <FaBell className="text-xl text-gray-700 hover:text-indigo-600" />
              {notification && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-10 top-10 bg-white border border-gray-200 shadow-lg rounded-md w-64 z-50 p-4">
                <h4 className="font-semibold mb-2">Notifications</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((note, idx) => (
                      <li key={idx} className="border-b pb-1">
                        {note.message}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No new notifications</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}

        {!isLoggedIn ? (
          <>
            <Link to="/login" className="text-sm text-indigo-600 hover:underline">
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="text-sm text-black hover:underline"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
