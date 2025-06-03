import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import EditActionButtons from "./EditActionButtons";
import api from "../api/axiosWithRefresh";
import { toast } from "react-toastify";
import { FaUpload } from "react-icons/fa";

const AddAccessories = () => {
  const location = useLocation();
  const inputImageUrl = location.state?.inputImage || null;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [mainImage, setMainImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [referenceImage, setReferenceImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thickness, setThickness] = useState(20);
  const [drawing, setDrawing] = useState(false);
  const [showMaskSection, setShowMaskSection] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const scaleStep = 0.1;
  const maxDisplayHeight = 1024;

  useEffect(() => {
    if (inputImageUrl) {
      const img = new Image();
      img.onload = () => {
        setCanvasDimensions(img.naturalWidth, img.naturalHeight);
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        setPreviewUrl(inputImageUrl);
        setShowMaskSection(true);
      };
      img.src = inputImageUrl;
    }
  }, [inputImageUrl]);

  const setCanvasDimensions = (width, height) => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        setCanvasDimensions(img.naturalWidth, img.naturalHeight);
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        setPreviewUrl(URL.createObjectURL(file));
        setMainImage(file);
        setShowMaskSection(true);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleReferenceImageChange = (e) => {
    setReferenceImage(e.target.files[0]);
  };

  const startDrawing = (e) => {
    setDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setDrawing(false);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const displayScale = imageSize.height > maxDisplayHeight
      ? maxDisplayHeight / imageSize.height
      : 1;
    const x = (e.clientX - rect.left) / (scale * displayScale);
    const y = (e.clientY - rect.top) / (scale * displayScale);

    ctx.lineWidth = thickness / (scale * displayScale);
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    ctx.globalAlpha = 1.0;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const resetMask = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const getMaskBlob = () => {
    return new Promise((resolve) => {
      const originalCanvas = canvasRef.current;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = originalCanvas.width;
      tempCanvas.height = originalCanvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.fillStyle = "black";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(originalCanvas, 0, 0);

      tempCanvas.toBlob((blob) => resolve(blob), "image/png");
    });
  };

  const handleGenerate = async () => {
    if ((!mainImage && !previewUrl) || !referenceImage) {
      toast.error("Please upload/select all required images and draw the mask.");
      return;
    }

    setLoading(true);
    setOutputImage(null);

    try {
      const creditRes = await api.get("/api/credits/");
      if (creditRes.data.credits_remaining < 2) {
        toast.error("Not enough credits to generate the image.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      if (inputImageUrl) {
        formData.append("image_url", inputImageUrl);
      } else {
        formData.append("main_image", mainImage);
      }

      formData.append("reference_image", referenceImage);
      const maskBlob = await getMaskBlob();
      formData.append("mask_image", maskBlob, "mask.png");

      const response = await api.post("/api/add-accessories/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.data;
      if (data) {
        setOutputImage(data);
        toast.success("Image generated successfully.");
        await api.post("/api/dedctcredit/", { amount: 2 });
      } else {
        toast.error("No image returned.");
      }
    } catch (err) {
      console.error("Add Accessories failed:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const displayScale =
    imageSize.height > maxDisplayHeight
      ? maxDisplayHeight / imageSize.height
      : 1;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-50 min-h-screen">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Accessories</h2>

        {!showMaskSection && (
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Original Image</label>
            <label className="block border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400 hover:bg-gray-50 p-6 mb-4 cursor-pointer">
              {previewUrl ? (
                <img src={previewUrl} alt="Original" className="w-full max-h-[450px] object-contain mx-auto rounded" />
              ) : (
                <div className="flex flex-col items-center text-gray-400 py-10">
                  <FaUpload className="text-xl mb-2" />
                  <span className="text-sm">Upload Original Image</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
            </label>
          </div>
        )}

        {showMaskSection && (
          <>
            <div className="flex gap-2 mb-2 items-center">
              <button onClick={() => setScale((prev) => Math.max(0.5, prev - scaleStep))} className="px-3 py-1 bg-gray-200 rounded">
                -
              </button>
              <span className="text-sm">Zoom: {(scale * displayScale * 100).toFixed(0)}%</span>
              <button onClick={() => setScale((prev) => Math.min(3, prev + scaleStep))} className="px-3 py-1 bg-gray-200 rounded">
                +
              </button>
              <button onClick={resetMask} className="ml-4 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                Reset Mask
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              Image Size: {imageSize.width}px × {imageSize.height}px
            </p>

            <div
              className="relative w-full max-w-full border border-gray-300 rounded mb-4"
              ref={containerRef}
              style={{ maxHeight: "90vh", overflow: "auto" }}
            >
              <div
                className="relative origin-top-left"
                style={{
                  transform: `scale(${scale * displayScale})`,
                  width: `${imageSize.width}px`,
                  height: `${imageSize.height}px`,
                }}
              >
                <img
                  src={previewUrl}
                  alt="Mask Base"
                  style={{
                    width: `${imageSize.width}px`,
                    height: `${imageSize.height}px`,
                  }}
                  className="absolute top-0 left-0 pointer-events-none object-contain"
                />
                <canvas
                  ref={canvasRef}
                  width={imageSize.width}
                  height={imageSize.height}
                  className="absolute top-0 left-0 z-10"
                  style={{
                    backgroundColor: "transparent",
                    width: `${imageSize.width}px`,
                    height: `${imageSize.height}px`,
                  }}
                  onMouseDown={startDrawing}
                  onMouseUp={endDrawing}
                  onMouseMove={draw}
                />
              </div>
            </div>

            <div className="flex gap-4 items-center mb-4">
              <label className="text-sm text-gray-600">Brush Thickness</label>
              <input
                type="range"
                min={1}
                max={100}
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
              />
            </div>
          </>
        )}

        {/* Reference Image Upload */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Reference Image</label>
          <label className="w-full border border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-100">
            {referenceImage ? (
              <img src={URL.createObjectURL(referenceImage)} alt="Reference" className="w-full max-h-[450px] object-contain mx-auto rounded shadow" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 py-10">
                <FaUpload className="text-xl mb-2" />
                <span className="text-sm">Upload Reference Image</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleReferenceImageChange} className="hidden" />
          </label>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Output</h3>
        <div className="w-full max-w-lg mx-auto bg-white border border-gray-200 rounded-lg mb-6 p-4 flex items-center justify-center h-[500px] shadow-sm">
          {loading ? (
            <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full" />
          ) : outputImage ? (
            <div
              onDoubleClick={() => window.open(outputImage, "_blank")}
              className="cursor-pointer w-full h-full"
              title="Double click to open in new tab"
            >
              <img src={outputImage} alt="Result" className="w-full h-full object-contain rounded-md shadow" />
            </div>
          ) : (
            <p className="text-gray-400">Generated image will appear here</p>
          )}
        </div>

        <EditActionButtons outputImageUrl={outputImage} />
      </div>
    </div>
  );
};

export default AddAccessories;
