import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EditActionButtons from "./EditActionButtons";
import api from "../api/axiosWithRefresh";
import { toast } from 'react-toastify';
import { FaUpload } from 'react-icons/fa';

const Upscale = () => {
  const location = useLocation();
  const inputImageUrl = location.state?.inputImage || null;

  const [uploadedImage, setUploadedImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (inputImageUrl) {
      setHistory([inputImageUrl]);
      setCurrentIndex(0);
    }
  }, [inputImageUrl]);

  const currentImage = history[currentIndex] || '';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(file);
      setOutputImage(null);
      const newHistory = [url];
      setHistory(newHistory);
      setCurrentIndex(0);
    }
  };

  const handleUpscale = async () => {
    if (!currentImage) {
      toast.warn("Please upload or select an image to upscale.");
      return;
    }

    setLoading(true);
    setOutputImage(null);

    try {
      const creditRes = await api.get("/api/credits/");
      const credits = creditRes.data.credits_remaining;

      if (credits < 2) {
        toast.error("Not enough credits to upscale image.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      if (uploadedImage) {
        formData.append("image", uploadedImage);
      } else if (inputImageUrl) {
        formData.append("image_url", currentImage);
      }

      const response = await api.post("/api/upscale/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;

      if (data?.image) {
        const upscaledImage = `data:image/png;base64,${data.image}`;
        const newHistory = [...history.slice(0, currentIndex + 1), upscaledImage];
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
        setOutputImage(upscaledImage);
        toast.success("Upscaled successfully.");
        await api.post("/api/dedctcredit/", { amount: 2 });
      } else if (typeof data === "string") {
        const newHistory = [...history.slice(0, currentIndex + 1), data];
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
        setOutputImage(data);
        toast.success("Upscaled successfully.");
        await api.post("/api/dedctcredit/", { amount: 2 });
      } else {
        toast.error("No image returned.");
      }
    } catch (err) {
      toast.error("Upscale failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10 bg-white min-h-screen text-gray-800">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-2xl font-bold text-black-600 mb-6">Upscale Image</h2>

        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Upload or Choose Image</p>
          <label className={`w-full block  border-gray-300 rounded-lg text-center cursor-pointer text-gray-500 hover:bg-gray-50 transition  ${currentImage ? '' : 'min-h-[180px]'}`}>
            {currentImage ? (
              <img
                src={currentImage}
                alt="Preview"
                className="w-full max-h-[450px] object-contain mx-auto rounded shadow"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400 py-10">
                <FaUpload className="text-lg mb-2" />
                <span className="text-sm">Click to upload</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <button
          onClick={handleUpscale}
          disabled={loading}
          className="w-full md:w-auto bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
        >
          {loading ? 'Upscaling...' : 'Upscale'}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Output</h3>
        <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow text-center flex items-center justify-center">
          {loading ? (
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          ) : outputImage ? (
            <img
              src={outputImage}
              alt="Upscaled Output"
              onDoubleClick={() => window.open(outputImage, '_blank')}
              title="Double-click to open in new tab"
              className="w-full h-full object-contain rounded shadow cursor-zoom-in hover:scale-[1.01] transition"
            />
          ) : (
            <p className="text-gray-400 text-sm">Output will appear here after generation</p>
          )}
        </div>

        {outputImage && (
          <div className="mt-6">
            <EditActionButtons outputImageUrl={outputImage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Upscale;
