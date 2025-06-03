import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EditActionButtons from "./EditActionButtons";
import api from "../api/axiosWithRefresh";
import { toast } from 'react-toastify';

const FaceRetouch = () => {
  const location = useLocation();
  const inputImageUrl = location.state?.inputImage || null;

  const [inputImage, setInputImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage = history[currentIndex] || '';

  useEffect(() => {
    if (inputImageUrl) {
      setHistory([inputImageUrl]);
      setCurrentIndex(0);
    }
  }, [inputImageUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setInputImage(file);
      setHistory([url]);
      setCurrentIndex(0);
    }
  };

  const handleGenerate = async () => {
    if (!currentImage || !prompt) {
      toast.error("Please select an image and enter a prompt.");
      return;
    }

    setLoading(true);

    try {
      const creditRes = await api.get('/api/getcredits/');
      const credits = creditRes.data.credits;

      if (credits < 2) {
        toast.error("Not enough credits to retouch the face.");
        setLoading(false);
        return;
      }

      // Simulate API call
      setTimeout(async () => {
        const newHistory = [...history.slice(0, currentIndex + 1), currentImage];
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
        toast.success("Retouch complete.");
        await api.post('/api/dedctcredit/', { amount: 2 });
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Retouch failed:", err);
      toast.error("Failed to retouch the image.");
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReset = () => {
    if (history.length > 0) {
      setCurrentIndex(0);
      toast.info("Reset to original image.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 bg-gray-50 min-h-screen">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Face Retouch</h2>

        {/* Upload Image */}
        <label className="w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 mb-6 p-4 min-h-[180px] text-gray-400 text-center">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Selected"
              className="max-h-56 rounded object-contain"
            />
          ) : (
            <span className="text-sm">Upload Image / Choose from Gallery</span>
          )}
          <input
            type="file"
            className="hidden"
            onChange={handleImageChange}
            accept="image/*"
          />
        </label>

        {/* Prompt Input */}
        <label className="block font-medium text-gray-700 mb-2">Prompt</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
          rows="4"
          placeholder="Describe the retouch you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={handleUndo}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={currentIndex >= history.length - 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Redo
          </button>
          <button
            onClick={handleReset}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        {/* Generate Button */}
        <div className="text-right">
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Output</h3>
        <div className="w-full max-w-md border border-gray-200 rounded-lg mb-6 p-4 bg-white min-h-[300px] flex items-center justify-center shadow-sm">
          {loading ? (
            <span className="text-gray-500">Generating...</span>
          ) : currentImage ? (
            <img src={currentImage} alt="Output" className="max-w-full max-h-[400px] rounded object-contain" />
          ) : (
            <span className="text-gray-400">Output will appear here</span>
          )}
        </div>

        <EditActionButtons outputImageUrl={currentImage} />
      </div>
    </div>
  );
};

export default FaceRetouch;
