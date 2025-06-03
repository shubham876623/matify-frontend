import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { uploadToGallery } from "../Gallery/uploadToGallery";
import { deleteFromGallery } from "../Gallery/deleteFromGallery";
import { toast } from 'react-toastify';
const EditActionButtons = ({ outputImageUrl, imageId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");
  const [clickedButton, setClickedButton] = useState("");

  const handleAddToGallery = async () => {
    if (!outputImageUrl) {
      toast.error("No image to upload.");
      return;
    }

    try {
      const uploadedUrl = await uploadToGallery(outputImageUrl);
      toast.success("✅ Image added to gallery!");
      console.log("Uploaded URL:", uploadedUrl);
    } catch (err) {
      toast.error("❌ Failed to upload image to gallery.");
    }
  };

  const handleDeleteFromGallery = async () => {
    if (!imageId) {
      toast.error("❌ No image  to delete.");
      return;
    }

    try {
      const success = await deleteFromGallery(imageId);
      if (success) {
        toast.success("🗑️ Image deleted from gallery.");
        window.location.reload(); // or use callback to update parent
      }
    } catch (err) {
      toast.error("❌ Failed to delete image from gallery.");
    }
  };

  const goToEditor = (path, label) => {
    if (!outputImageUrl) {
      toast.error("No image to edit");
      return;
    }

    setClickedButton(label);

    setTimeout(() => {
      navigate(path, {
        state: {
          inputImage: outputImageUrl,
        },
      });
    }, 100);
  };

  const getButtonClass = (label) =>
    `border px-3 py-1 rounded transition ${
      clickedButton === label ? "bg-blue-100" : "hover:bg-gray-100"
    }`;

  return (
    <div className="grid grid-cols-3 gap-3 text-sm mt-6">
      {/* {currentPath !== "/face-retouch" && (
        <button
          onClick={() => goToEditor("/face-retouch", "Face Retouch")}
          className={getButtonClass("Face Retouch")}
        >
          Face Retouch
        </button>
      )} */}
      {currentPath !== "/object-removal" && (
        <button
          onClick={() => goToEditor("/object-removal", "Object Removal")}
          className={getButtonClass("Object Removal")}
        >
          Object Removal
        </button>
      )}
      {currentPath !== "/add-accessories" && (
        <button
          onClick={() => goToEditor("/add-accessories", "Add Accessories")}
          className={getButtonClass("Add Accessories")}
        >
          Add Accessories
        </button>
      )}
      {currentPath !== "/outfit-swap" && (
        <button
          onClick={() => goToEditor("/outfit-swap", "Outfit Swap")}
          className={getButtonClass("Outfit Swap")}
        >
          Outfit Swap
        </button>
      )}
      {currentPath !== "/bg-removal" && (
        <button
          onClick={() => goToEditor("/bg-removal", "BG Swap")}
          className={getButtonClass("BG Swap")}
        >
          BG Swap
        </button>

      )}

      {currentPath !== "/color-correction" && (
  <button
    onClick={() => goToEditor("/color-correction", "Color Correction")}
    className={getButtonClass("Color Correction")}
  >
    Color Correction
  </button>
)}

      {currentPath !== "/upscale" && (
        <button
          onClick={() => goToEditor("/upscale", "Upscale")}
          className={getButtonClass("Upscale")}
        >
          Upscale
        </button>
      )}

      <button
        className="border px-3 py-1 rounded hover:bg-gray-100"
        onClick={handleAddToGallery}
      >
        Add to Gallery
      </button>

      <button
        className="col-span-3 border px-3 py-1 rounded text-black-600 border-black-400 hover:bg-red-50"
        onClick={handleDeleteFromGallery}
      >
        Delete
      </button>
      
    </div>
  );
};

export default EditActionButtons;
