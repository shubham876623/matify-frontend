import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import EditActionButtons from "./EditActionButtons";
import api from "../api/axiosWithRefresh";
import { toast } from "react-toastify";
import { FaUpload } from "react-icons/fa";

const ColorCorrection = () => {
  const location = useLocation();
  const inputImageUrl = location.state?.inputImage || null;

  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [outputImage, setOutputImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (inputImageUrl) {
      setPreviewUrl(inputImageUrl);
    }
  }, [inputImageUrl]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOutputImage("");
    }
  };

  const handleColorCorrection = async () => {
    if (!uploadedImage && !previewUrl) {
      toast.error("Please upload or select an image.");
      return;
    }

    setLoading(true);
    setOutputImage("");
    setMessage("");

    try {
      const creditRes = await api.get("/api/credits/");
      const credits = creditRes.data.credits_remaining;

      if (credits < 2) {
        toast.error("Not enough credits to apply color correction.");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      if (uploadedImage) {
        formData.append("main_image", uploadedImage);
      } else {
        formData.append("image_url", inputImageUrl);
      }

      const response = await api.post("/api/color-correction/", formData ,{
         headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.data;

      if (result) {
        setOutputImage(`${result}`);
        toast.success("Image generated successfully.");
        await api.post("/api/dedctcredit/", { amount: 2 });
      } else {
        throw new Error("No output received.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply color correction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-10 bg-white min-h-screen text-gray-800">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-2xl font-bold text-black-600 mb-6">Color Correction</h2>

        <label className={`w-full block border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer text-gray-500 hover:bg-gray-50 transition p-4 ${previewUrl ? '' : 'min-h-[180px]'}`}>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full max-h-[450px] object-contain mx-auto rounded shadow" />
          ) : (
            <div className="flex flex-col items-center text-gray-400 py-10">
              <FaUpload className="text-lg mb-2" />
              <span className="text-sm">Upload Image / Choose from Gallery</span>
            </div>
          )}
          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
        </label>

        <div className="text-center mt-6">
          <button
            onClick={handleColorCorrection}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Apply Correction"}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.toLowerCase().includes("fail") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Output</h3>
        <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white p-4 shadow text-center flex items-center justify-center">
          {loading ? (
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          ) : outputImage ? (
            <div
              onDoubleClick={() => window.open(outputImage, "_blank")}
              className="cursor-pointer w-full h-full"
              title="Double click to open in new tab"
            >
              <img src={outputImage} alt="Output" className="w-full h-full object-contain rounded-md shadow" />
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Output will appear here after generation</span>
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

export default ColorCorrection;
