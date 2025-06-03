import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EditActionButtons from "./EditActionButtons";
import api from "../api/axiosWithRefresh";
import { toast } from "react-toastify";
import { FaUpload } from "react-icons/fa";

const BackgroundSwap = () => {
  const location = useLocation()
  const inputImageUrl = location.state?.inputImage || null;

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
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
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOutput("");
    }
  };

  const handleGenerate = async () => {
    if ((!image && !previewUrl) || !prompt) {
      toast.error("Please provide both image and background prompt.");
      return;
    }

    setLoading(true);
    setOutput("");
    setMessage("");

    try {
      const creditRes = await api.get("/api/credits/");
      const credits = creditRes.data.credits_remaining;

      if (credits < 2) {
        toast.error("Not enough credits to generate the image.");
        setLoading(false);
        return;
      }

      let response;

      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("prompt", prompt);

        response = await api.post("/api/background-remove/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post(
          "/api/background-remove/",
          { image_url: previewUrl, prompt },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await response.data;

      if (result) {
        setOutput(result);
        toast.success("Image generated successfully.");
        await api.post("/api/dedctcredit/", { amount: 2 });
      } else {
        throw new Error("No output returned");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 bg-white min-h-screen text-gray-800">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-2xl font-bold text-black-600 mb-6">Background Swap</h2>

        {/* Upload or Gallery Image */}
        <label className={`w-full block border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer text-gray-500 hover:bg-gray-50 transition p-4 ${previewUrl ? '' : 'min-h-[180px]'}`}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected"
              className="w-full max-h-[450px] object-contain mx-auto rounded shadow"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400 py-10">
              <FaUpload className="text-lg mb-2" />
              <span className="text-sm">Click to upload</span>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            onChange={handleImageUpload}
            accept="image/*"
          />
        </label>

        {/* Prompt Input */}
        <textarea
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
          rows="4"
          placeholder="Describe the background"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* Generate Button */}
        <div className="text-right">
          <button
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className={`mt-4 text-sm ${message.toLowerCase().includes("error") ? "text-red-600" : "text-green-600"}`}>
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
          ) : output ? (
            <div
              onDoubleClick={() => window.open(output, "_blank")}
              className="cursor-pointer w-full h-full"
              title="Double click to open in new tab"
            >
              <img
                src={output}
                alt="Output"
                className="w-full h-full object-contain rounded-md shadow"
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

export default BackgroundSwap;
