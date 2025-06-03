import { ImOffice } from "react-icons/im";
import api from "../api/axiosWithRefresh";
import { toast } from "react-toastify";


export const deleteFromGallery = async (id) => {
  const token = localStorage.getItem("access_token");

  try {
   const res = await api.delete("/api/gallery/", {
  data: { id },
  headers: {
    
    "Content-Type": "application/json",
  },
});

    if (res.status === 204) {
      toast.success("🗑️ Image deleted");
      return true;
    } else {
      const data = await res.json();
      toast.error(data?.error || "❌ Failed to delete image");
    }
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("❌ Network error");
  }
};
