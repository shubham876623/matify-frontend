import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './ProtectedRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import MyAIModels from './Generate/Mymodels';
import TrainAI from './Generate/TrainAI';
import GenerateImage from './Generate/GenerateImage';
import AddAccessories from './edit/AddAccessories';
import OutfitSwap from './edit/OutfitSwap';
import FaceRetouch from './edit/FaceRetouch';
import BackgroundSwap from './edit/BackgroundSwap';
import Upscale from './edit/Upscale';
import ObjectRemoval from './edit/ObjectRemoval';
import ColorCorrection from './edit/ColorCorrection';
import Gallery from './Gallery/Gallery';
import Settings from './setting/Settings';
import GenratedImageGallery from './Generate/GenratedimagesImageGallery';

const router = createBrowserRouter([
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <MyAIModels /> },
      { path: "train", element: <TrainAI /> },
      { path: "generate", element: <GenerateImage /> },
      { path: "add-accessories", element: <AddAccessories /> },
      { path: "outfit-swap", element: <OutfitSwap /> },
      { path: "Face-retouch", element: <FaceRetouch /> },
      { path: "bg-removal", element: <BackgroundSwap /> },
      { path: "upscale", element: <Upscale /> },
      { path: "gallery", element: <Gallery /> },
      { path: "object-removal", element: <ObjectRemoval /> },
      { path: "color-correction", element: <ColorCorrection /> },
      { path: "settings", element: <Settings /> },
      { path: "generated-images", element: <GenratedImageGallery /> },
    ],
  },
]);

export default router;
