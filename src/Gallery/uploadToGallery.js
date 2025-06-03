import { toast } from 'react-toastify';
import api from '../api/axiosWithRefresh';

export const uploadToGallery = async (imageUrl) => {
  const token = localStorage.getItem("access_token");

  if (!token || !imageUrl) {
    alert("Missing token or image");
    return;
  }

  // ✅ Resolve proper URL
  let resolvedUrl = "";
  if (typeof imageUrl === "string") {
    resolvedUrl = imageUrl.startsWith("https") ? imageUrl : imageUrl;
  } else if (Array.isArray(imageUrl)) {
    resolvedUrl = imageUrl[0];  // use first image from array
  } else {
    toast.error("Invalid image URL format");
    return;
  }

  try {
   const res = await api.post("/api/gallery/", 
  { image_url: resolvedUrl }, 
  {
    headers: {
     
      "Content-Type": "application/json",
    },
  }
);


    const data = await res.data;

    if (res.ok) {
      
      toast.success(" Image added to your gallery!");
    } else {
      console.error("Error:", data);
      console.log(data?.error || "❌ Failed to add image");
    }
  } catch (err) {
    console.error("❌ Network error while uploading to gallery:", err);
  }
};
