import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosWithRefresh";
import EditActionButtons from "../edit/EditActionButtons";

const GenratedImageGallery = () => {
  const [tab, setTab] = useState("generated");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const [genRes, procRes] = await Promise.all([
          api.get("/api/generated-images/"),
          api.get("/api/processed-images/"),
        ]);
        setGeneratedImages(genRes.data);
        setProcessedImages(procRes.data);
      } catch (err) {
        console.error("Failed to fetch images", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const imagesToShow = tab === "generated" ? generatedImages : processedImages;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 bg-gray-50 min-h-screen">
      {/* LEFT SIDE: Tabs + Thumbnails */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Images</h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {/* <button
            onClick={() => {
              setTab("generated");
              setSelectedImage(null);
            }}
            className={`px-4 py-2 rounded ${
              tab === "generated" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            Generated Images
          </button> */}
          <button
            onClick={() => {
              setTab("processed");
              setSelectedImage(null);
            }}
            // className={`px-4 py-2 rounded ${
            //   tab === "processed" ? "bg-indigo-600 text-white" : "bg-gray-200"
            // }`}
          >
            {/* Processed Images */}
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {loading ? (
            <p className="text-gray-500 text-sm col-span-3">Loading gallery...</p>
          ) : imagesToShow.length === 0 ? (
            <p className="text-gray-400 text-sm col-span-3">No images found.</p>
          ) : (
            imagesToShow.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt="Preview"
                onClick={() => setSelectedImage(img)}
                className={`rounded cursor-pointer object-cover aspect-square border-2 transition ${
                  selectedImage?.id === img.id
                    ? "border-indigo-500 shadow-lg"
                    : "border-transparent hover:border-gray-400"
                }`}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Selected Image + Edit Buttons */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Selected Image</h3>
        <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow text-center flex items-center justify-center">
          {selectedImage ? (
            <div
              onDoubleClick={() => window.open(selectedImage.image_url, "_blank")}
              className="cursor-pointer"
              title="Double click to open in new tab"
            >
              <img
                src={selectedImage.image_url}
                alt="Selected"
                className="max-h-[500px] object-contain"
              />
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No image selected</p>
          )}
        </div>

        {selectedImage && (
          <EditActionButtons
            outputImageUrl={selectedImage.image_url}
            imageId={selectedImage.id}
          />
        )}
      </div>
    </div>
  );
};

export default GenratedImageGallery;
