import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EditActionButtons from "./EditActionButtons";
import api from "../api/axiosWithRefresh";
import { toast } from 'react-toastify';
import { FaUpload } from 'react-icons/fa';

const OutfitSwap = () => {
  const location = useLocation();
  const inputImageUrl = location.state?.inputImage || null;

  const [outfitImage, setOutfitImage] = useState(null);
  const [personImage, setPersonImage] = useState(null);
  const [outfitPreviewUrl, setOutfitPreviewUrl] = useState('');
  const [personPreviewUrl, setPersonPreviewUrl] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (inputImageUrl) {
      setPersonPreviewUrl(inputImageUrl);
    }
  }, [inputImageUrl]);

  const handleOutfitUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOutfitImage(file);
      setOutfitPreviewUrl(URL.createObjectURL(file));
      setOutput('');
    }
  };

  const handlePersonUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPersonImage(file);
      setPersonPreviewUrl(URL.createObjectURL(file));
      setOutput('');
    }
  };

  const handleGenerate = async () => {
    if (!outfitPreviewUrl || !personPreviewUrl) {
      toast.error("Please upload both outfit and person image.");
      return;
    }

    setLoading(true);
    setOutput('');
    setMessage('');

    try {
      const creditRes = await api.get("/api/credits/");
      const credits = creditRes.data.credits_remaining;

      if (credits < 2) {
        toast.error("Not enough credits to generate outfit swap.");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      if (personImage) {
        formData.append("person_image", personImage);
      } else if (personPreviewUrl) {
        formData.append("person_url", personPreviewUrl);
      }

      formData.append("outfit_image", outfitImage);


      const response = await api.post("/api/outfit-swap/", formData, {
        headers: { "Content-Type": "multipart/form-data" },

      });

      let data;
      try {
        data = await response.data;
      } catch (e) {
        const text = await response.text();
        console.error("Invalid JSON:", text);
        toast.error("❌ Server returned invalid response.");
        return;
      }

      if (data) {
        setOutput(`${data}`);
        toast.success("Outfit swap generated successfully.");
        await api.post("/api/dedctcredit/", { amount: 2 });
      } else {
        toast.error("No image returned.");
      }
    } catch (err) {
      console.error("Outfit Swap failed:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-10 bg-white min-h-screen text-gray-800">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-2xl font-bold text-black-600 mb-6">Outfit Swap</h2>

        {/* Outfit Image Upload */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-1">Outfit Image</p>
          <label className={`w-full block border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer text-gray-500 hover:bg-gray-50 transition p-4 ${outfitPreviewUrl ? '' : 'min-h-[180px]'}`}>
            {outfitPreviewUrl ? (
              <img src={outfitPreviewUrl} alt="Outfit Preview" className="w-full max-h-[450px] object-contain mx-auto rounded shadow" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 py-10">
                <FaUpload className="text-lg mb-2" />
                <span className="text-sm">Upload Outfit Image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleOutfitUpload} />
          </label>
        </div>

        {/* Person Image Upload */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-1">Person Image</p>
          <label className={`w-full block border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer text-gray-500 hover:bg-gray-50 transition p-4 ${personPreviewUrl ? '' : 'min-h-[180px]'}`}>
            {personPreviewUrl ? (
              <img src={personPreviewUrl} alt="Person Preview" className="w-full max-h-[450px] object-contain mx-auto rounded shadow" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 py-10">
                <FaUpload className="text-lg mb-2" />
                <span className="text-sm">Upload Person Image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handlePersonUpload} />
          </label>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Optional Status Message */}
        {message && (
          <p className={`mt-4 text-center text-sm ${message.toLowerCase().includes("fail") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Output</h3>

        <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow text-center flex items-center justify-center">
          {loading ? (
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          ) : output ? (
            <div
              onDoubleClick={() => window.open(output, "_blank")}
              className="cursor-pointer w-full h-full"
              title="Double click to open in new tab"
            >
              <img
                src={output}
                alt="Output"
                className="w-full h-full object-contain rounded-md"
              />
            </div>

          ) : (
            <p className="text-gray-400 text-sm">Output will appear here after generation</p>
          )}
        </div>

        {output && (
          <div className="mt-6">
            <EditActionButtons outputImageUrl={output} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitSwap;
