import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EditActionButtons from "./EditActionButtons";
import { FaUpload } from "react-icons/fa";
import api from "../api/axiosWithRefresh";

const ObjectRemoval = () => {
  const location = useLocation();
  const inputImageUrl = location.state?.inputImage || null;

  const [previewUrl, setPreviewUrl] = useState("");
  const [inputImage, setInputImage] = useState(null);
  const [outputImage, setOutputImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [thickness, setThickness] = useState(10);
  const [drawing, setDrawing] = useState(false);
  const [maskImageUrl, setMaskImageUrl] = useState(null);
  const [showMaskSection, setShowMaskSection] = useState(true);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 512, height: 512 });

  const canvasRef = useRef(null);

  useEffect(() => {
    if (inputImageUrl) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        setPreviewUrl(inputImageUrl);
      };
      img.src = inputImageUrl;
    }
  }, [inputImageUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        setPreviewUrl(URL.createObjectURL(file));
        setInputImage(file);
        setMaskImageUrl(null);
        setShowMaskSection(true);
      };
      img.src = URL.createObjectURL(file);
    }
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
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    ctx.lineWidth = thickness / scale;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const resetCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setMaskImageUrl(null);
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
    if (!previewUrl) {
      alert("Please upload or select an image.");
      return;
    }

    setLoading(true);
    setOutputImage("");
    setShowMaskSection(false);

    try {
      const maskBlob = await getMaskBlob();
      const url = URL.createObjectURL(maskBlob);
      setMaskImageUrl(url);

      const formData = new FormData();
      if (inputImage) {
        formData.append("main_image", inputImage);
      } else if (inputImageUrl) {
        formData.append("image_url", inputImageUrl);
      } else {
        alert("Invalid image source.");
        setLoading(false);
        return;
      }

      formData.append("mask_image", maskBlob, "mask.png");

      const response = await api.post("/api/object-removal/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.data;
      if (result) {
        setOutputImage(`${result}`);
      } else {
        alert("No image returned.");
      }
    } catch (err) {
      console.error("Object removal failed:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = () => {
    setInputImage(null);
    setPreviewUrl("");
    setMaskImageUrl(null);
    setOutputImage("");
    setShowMaskSection(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start p-6">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Object Removal</h2>

        {!previewUrl && (
          <label className="block border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400 hover:bg-gray-50 p-6 mb-4 cursor-pointer">
            <div className="flex flex-col items-center">
              <FaUpload className="text-xl mb-2" />
              <span className="text-sm">Click to upload or choose from gallery</span>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
            />
          </label>
        )}

        {previewUrl && (
          <>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Draw Mask</h4>
            <div className="flex gap-2 items-center mb-2">
              <button onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))} className="px-3 py-1 bg-gray-200 rounded">-</button>
              <span className="text-sm">Zoom: {(scale * 100).toFixed(0)}%</span>
              <button onClick={() => setScale((prev) => Math.min(3, prev + 0.1))} className="px-3 py-1 bg-gray-200 rounded">+</button>
              <button onClick={resetCanvas} className="ml-4 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Reset Mask</button>
            </div>
            <div
              className="relative border border-gray-300 rounded overflow-auto mb-4"
              style={{ maxHeight: "90vh" }}
            >
              <div
                className="relative origin-top-left"
                style={{
                  transform: `scale(${scale})`,
                  width: `${imageSize.width}px`,
                  height: `${imageSize.height}px`,
                }}
              >
                <img
                  src={previewUrl}
                  alt="Mask Base"
                  style={{ width: `${imageSize.width}px`, height: `${imageSize.height}px` }}
                  className="absolute top-0 left-0 pointer-events-none object-contain"
                />
                {showMaskSection && (
                  <canvas
                    ref={canvasRef}
                    width={imageSize.width}
                    height={imageSize.height}
                    className="absolute top-0 left-0 z-10"
                    style={{ backgroundColor: "transparent" }}
                    onMouseDown={startDrawing}
                    onMouseUp={endDrawing}
                    onMouseMove={draw}
                  />
                )}
                {loading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap mb-4">
              <label className="text-sm text-gray-600">Brush Thickness</label>
              <input
                type="range"
                min="1"
                max="50"
                value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value))}
              />
              <span className="text-sm">{thickness}px</span>
            </div>
          </>
        )}

        {previewUrl && (
          <div className="text-center mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="border px-6 py-2 rounded hover:bg-gray-100 font-medium"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        )}

        {previewUrl && (
          <div className="text-center mt-2">
            <button
              onClick={handleResetAll}
              className="text-xs text-gray-500 hover:text-black underline"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Output</h3>
        <div className="w-full max-w-xl min-h-[300px] rounded-xl border shadow bg-gray-50 flex items-center justify-center p-4 transition-all hover:shadow-lg">
          {loading ? (
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          ) : outputImage ? (
            <div
              onDoubleClick={() => window.open(outputImage, "_blank")}
              className="cursor-pointer w-full"
              title="Double click to open in new tab"
            >
              <img
                src={outputImage}
                alt="Output"
                className="w-full h-auto rounded-md shadow-md"
              />
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No output yet</span>
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

export default ObjectRemoval;
