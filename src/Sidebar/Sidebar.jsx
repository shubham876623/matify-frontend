import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FaMagic, FaImage, FaQuestionCircle, FaCog, FaEdit,
  FaChevronDown, FaChevronRight, FaTshirt, FaEraser, FaPlus,
  FaPalette, FaImages, FaLevelUpAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [aiEditingOpen, setAiEditingOpen] = useState(false);
  const [editToolsOpen, setEditToolsOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center  gap-3 px-4 py-2 rounded-lg  transition-all duration-200 ${
      isActive
        ? 'bg-gray-200 text-black'
        : 'text-black hover:bg-gray-100 hover:text-black'
    }`;

  // Automatically expand dropdown if current page is inside the group
  useEffect(() => {
    if (['/', '/generated-images'].includes(location.pathname)) {
      setAiEditingOpen(true);
    }
    if (
      [
        '/object-removal',
        '/add-accessories',
        '/outfit-swap',
        '/bg-removal',
        '/upscale',
        '/color-correction'
      ].includes(location.pathname)
    ) {
      setEditToolsOpen(true);
    }
  }, [location.pathname]);

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4 font-sans shadow">
      {/* Main Navigation */}
      <nav className="space-y-1 flex-1 overflow-auto">
        {/* AI Photoshoot Dropdown */}
        <div>
          <button
            onClick={() => setAiEditingOpen(!aiEditingOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition"
          >
            <div className="flex items-center  gap-3">
              <FaMagic />
              AI Photoshoot
            </div>
            {aiEditingOpen ? <FaChevronDown /> : <FaChevronRight />}
          </button>
          {aiEditingOpen && (
            <div className="ml-6 mt-2  space-y-2">
              <NavLink to="/" className={navLinkClass}>Generate</NavLink>
              <NavLink to="/generated-images" className={navLinkClass}>Generated Images</NavLink>
            </div>
          )}
        </div>

        {/* Edit Tools Dropdown */}
        <div>
          <button
            onClick={() => setEditToolsOpen(!editToolsOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition"
          >
            <div className="flex items-center  gap-3">
              <FaEdit />
              AI Editing Tools
            </div>
            {editToolsOpen ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {editToolsOpen && (
            <div className="ml-6 mt-2 space-y-2">
              <NavLink to="/object-removal" className={navLinkClass}><FaEraser />Object Removal</NavLink>
              <NavLink to="/add-accessories" className={navLinkClass}><FaPlus />Add Accessories</NavLink>
              <NavLink to="/outfit-swap" className={navLinkClass}><FaTshirt />Outfit Swap</NavLink>
              <NavLink to="/bg-removal" className={navLinkClass}><FaImages />Background Replace</NavLink>
              <NavLink to="/upscale" className={navLinkClass}><FaLevelUpAlt />Upscale</NavLink>
              <NavLink to="/color-correction" className={navLinkClass}><FaPalette />Color Correction</NavLink>
            </div>
          )}
        </div>

        {/* Other Nav Links */}
        <NavLink to="/gallery" className={navLinkClass}>
          <FaImage />
          Gallery
        </NavLink>
        <NavLink to="/help" className={navLinkClass}>
          <FaQuestionCircle />
          Help
        </NavLink>
        <NavLink to="/settings" className={navLinkClass}>
          <FaCog />
          Billing
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="border-t pt-4 text-xs text-gray-500 text-center">
        <p>Version 1.0.1</p>
      </div>
    </aside>
  );
};

export default Sidebar;
