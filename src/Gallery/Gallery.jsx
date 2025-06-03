import React, { useState, useEffect } from 'react';
import EditActionButtons from '../edit/EditActionButtons';
import api from "../api/axiosWithRefresh";


const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const res = await api.get("/api/gallery/", {
          headers: {


            'Content-Type': 'application/json',
          }
        });

        const data = await res.data;
        setImages(data);
      } catch (error) {
        console.error("Failed to load gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start p-6 bg-gray-50 min-h-screen">
      {/* LEFT: Gallery Thumbnails */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gallery</h2>
        <div className="grid grid-cols-3 gap-4 overflow-y-auto h-[500px] pr-2">
          {loading ? (
            <p className="text-gray-500 text-sm col-span-3">Loading gallery...</p>
          ) : images.length === 0 ? (
            <p className="text-gray-400 text-sm col-span-3">No images found.</p>
          ) : (
            images.map((img, idx) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={`Gallery ${idx}`}

                onClick={() => setSelectedImage(img)}

                className={`w-full h-auto rounded-lg cursor-pointer border-2 object-cover aspect-square transition duration-150 ${
                  selectedImage?.id === img.id ? 'border-indigo-500 shadow-md' : 'border-transparent hover:border-gray-300'
                }`}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Preview + Actions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Selected Image</h3>

        <div className="w-full max-w-lg mx-auto rounded-lg mb-6 flex items-center justify-center h-[500px] shadow-sm">
          {selectedImage ? (
            <div
              onDoubleClick={() => window.open(selectedImage.image_url, "_blank")}
              className="cursor-pointer w-full h-full"
              title="Double click to open in new tab"
            >
              <img
                src={selectedImage.image_url}
                alt="Selected"
                className="w-full h-full object-contain rounded-md shadow"
              />
            </div>

          ) : (
            <p className="text-gray-400 text-sm">No image selected</p>
          )}
        </div>

        {/* ✅ Now pass both URL and ID */}
        <EditActionButtons
          outputImageUrl={selectedImage?.image_url}
          imageId={selectedImage?.id}
        />
      </div>
    </div>
  );
};

export default Gallery;
