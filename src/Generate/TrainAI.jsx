import { useState } from 'react';
import { FaUpload, FaStar } from 'react-icons/fa';
import api from "../api/axiosWithRefresh";
import { toast } from 'react-toastify';

const TrainAI = () => {
  const [zipFile, setZipFile] = useState(null);
  const [triggerWord, setTriggerWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setZipFile(file);
      setMessage('');
    } else {
      setZipFile(null);
      toast.error('Only .zip files are allowed.');
    }
  };

  const handleSubmit = async () => {
    if (!zipFile || !triggerWord) {
      toast.error('Both ZIP file and trigger word are required.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Step 1: Check Credits
      const creditResponse = await api.get('/api/credits/');
      const availableCredits = creditResponse.data.credits_remaining;

      if (availableCredits < 5) {
        toast.error('Not enough credits. Please purchase more to train a model.');
        setLoading(false);
        return;
      }

      // Step 2: Prepare FormData and send training request
      const formData = new FormData();
      formData.append('zip_file', zipFile);
      formData.append('trigger_word', triggerWord);

      const trainRes = await api.post('/api/train/', formData); // No need to manually set Content-Type

      if (trainRes.status === 200 || trainRes.status === 201) {
        await api.post('/api/dedctcredit/', { amount: 5 });
        toast.success(`Training started: ${trainRes.data.status || 'success'}`);
      } else {
        toast.error(`Error: ${trainRes.data.error || 'Training request failed.'}`);
      }

    } catch (err) {
      console.error(err);
      toast.error('An error occurred while processing the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md p-6 mt-10 rounded-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Train a New AI Model</h2>

      {/* Upload ZIP */}
      <div>
        <label className="flex items-center text-gray-700 font-medium mb-1">
          Upload Training Images (.zip) <FaStar className="ml-2 text-yellow-500 text-sm" />
        </label>
        <label className="flex items-center justify-between border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition">
          <span className="text-gray-500 truncate">{zipFile ? zipFile.name : 'Select ZIP file'}</span>
          <FaUpload className="text-gray-500" />
          <input
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Trigger Word */}
      <div>
        <label className="flex items-center text-gray-700 font-medium mb-1">
          Trigger Word <FaStar className="ml-2 text-yellow-500 text-sm" />
        </label>
        <input
          type="text"
          placeholder="e.g. hellomrsheel/an"
          value={triggerWord}
          onChange={(e) => setTriggerWord(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Submit */}
      <div className="text-right">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {loading ? 'Creating...' : 'Create Training'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <p className={`text-sm text-center ${message.toLowerCase().includes('error') || message.toLowerCase().includes('fail') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default TrainAI;
