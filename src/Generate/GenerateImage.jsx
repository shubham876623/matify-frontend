import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditActionButtons from "../edit/EditActionButtons";
import api from "../api/axiosWithRefresh";
import { toast } from 'react-toastify';

const GenerateImage = () => {
  const location = useLocation();
  const { modelName, modelVersion } = location.state || {};
  
  const navigate = useNavigate();
  const [aspectRatio, setAspectRatio] = useState('');
  const [format, setFormat] = useState('');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setOutput('');
    setMessage('');

    try {

      const creditRes = await api.get('/api/credits/');
      const credits = creditRes.data.credits_remaining;

      if (credits < 2) {
        toast.error('Not enough credits. Please purchase more to generate an image.');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/predict/', {
        version: modelVersion,
        input: {
          prompt: `${modelName} ${prompt}`,
          aspect_ratio: aspectRatio,
          format: format
        }
      });

      const data = response.data;
      setOutput(data.output || '');

      if (data.output) {
        await api.post('/api/dedctcredit/', { amount: 2 });
        toast.success('Image generated successfully.');
        console.log(data.output[0]);
        const saveRes = await api.post('/api/generated-images/', { image_url: data.output[0] });
        console.log("Save response:", saveRes.data);
      } else {
        toast.error('Failed to generate image.');
      }

    } catch (error) {
      console.error("Prediction failed:", error);
      toast.error('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
      <div className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
      Generating...
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start p-6 bg-gray-50 min-h-screen">
      {/* LEFT PANEL */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Image</h2>



        <div className="flex flex-wrap gap-4 mb-6">
          <select disabled value={modelName || ''} className="border border-gray-300 rounded-lg px-3 py-2 w-40 bg-gray-100 text-gray-700">
            <option>{modelName || 'Model not selected'}</option>
          </select>

          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-gray-700"
          >
            <option value="">Aspect Ratio</option>
            <option value="1:1">1:1</option>
            <option value="4:5">4:5</option>
            <option value="16:9">16:9</option>
          </select>

          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-gray-700"
          >
            <option value="">Format</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </div>

        <div className="w-full">
  <textarea
    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    rows="4"
    placeholder="Describe the image you want to generate..."
    value={`${modelName} ${prompt}`}
    onChange={(e) => {
      const input = e.target.value;
      const prefix = `${modelName} `;
      if (input.startsWith(prefix)) {
        // Save only the text after the model name
        setPrompt(input.slice(prefix.length));
      } else {
        // Prevent editing/removing model name
        setPrompt(prompt);
      }
    }}
  />
</div>

<div className="text-right mt-6">
  <button
    onClick={handleGenerate}
    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
    disabled={loading}
  >
    {loading ? <Spinner /> : 'Generate'}
  </button>
</div>



        {message && (
          <p className={`mt-4 text-sm ${message.includes('error') || message.includes('fail') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Output Preview</h3>

        <div className="w-full max-w-lg border border-gray-300 rounded-lg mb-6 p-4 flex items-center justify-center bg-white min-h-[16rem]">
          {loading ? (
            <Spinner />
          ) : output ? (
            <div
              onDoubleClick={() => window.open(output, "_blank")}
              className="cursor-pointer"
              title="Double click to open in new tab"
            >
              <img
                src={output}
                alt="Generated Output"
                className="max-w-full max-h-[500px] object-contain rounded"
              />
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No output yet</p>
          )}
        </div>

        <EditActionButtons outputImageUrl={output} />
      </div>
    </div>
  );
};

export default GenerateImage;
