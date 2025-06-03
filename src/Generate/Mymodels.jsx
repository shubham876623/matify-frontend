import React, { useEffect, useState } from 'react';
import { FaPlay } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import api from "../api/axiosWithRefresh";
const MyAIModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const modelsPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainings = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await api.get('/api/trainings/', {
          headers: {
          
            'Content-Type': 'application/json',
          }
        });
        const data = await response.data;
        setModels(data || []);
      } catch (error) {
        console.error("Error fetching Replicate trainings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  const indexOfLastModel = currentPage * modelsPerPage;
  const indexOfFirstModel = indexOfLastModel - modelsPerPage;
  const currentModels = models.slice(indexOfFirstModel, indexOfLastModel);
  const totalPages = Math.ceil(models.length / modelsPerPage);

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-500 text-lg">Loading models...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8 bg-gray-50 min-h-screen">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-8 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My AI Models</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your trained models and start generating with a click.</p>
        </div>
        <button
          onClick={() => navigate('/train')}
          className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-900 transition shadow"
        >
          + Train My AI
        </button>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentModels.map((model) => (
          <div
            key={model.training_id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Status */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    model.status === 'succeeded' ? 'bg-green-500' :
                    model.status === 'failed' ? 'bg-red-500' :
                    'bg-yellow-400'
                  }`}
                ></span>
                <span style={{ color: '#50D890' }} className="text-sm text-gray-600 capitalize">
                  {model.status === "succeeded" ? "Ready" : model.status}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-2">
              <p className="text-md font-semibold text-gray-800 mb-1 truncate">
              <span style={{ color: '#4F98CA' }} className="itali">
  {model.trigger_word || 'Unnamed Model'}
</span>

              </p>
              <p className="text-sm text-gray-500" >
                {/* Trained on {new Date(model.created_at).toLocaleDateString()} */}
              </p>
            </div>

            {/* Generate */}
            <div className="mt-5 text-right">
              <button
                onClick={() =>
                  navigate('/generate', {
                    state: {
                      modelName: model.trigger_word,
                      modelVersion: model.version_id,
                    }
                  })
                }
                className="inline-flex items-center gap-2 border border-black px-5 py-2 rounded-full text-sm font-medium text-black hover:bg-black hover:text-white transition"
              >
                <FaPlay className="text-sm animate-pulse" />
                Generate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`px-4 py-2 rounded-full font-medium text-sm transition border ${
                currentPage === index + 1
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAIModels;
