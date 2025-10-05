import { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

function App() {
  const [imageData, setImageData] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Image Upload</h1>
          <p className="text-slate-600">Upload an image to store it as a variable</p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-slate-400 mb-3" />
              <p className="mb-2 text-sm text-slate-600 font-medium">
                Click to upload an image
              </p>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {imageData && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-700">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium">Image stored successfully!</span>
            </div>

            <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
              <img
                src={imageData}
                alt="Uploaded preview"
                className="w-full h-auto object-contain max-h-96"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-2 font-medium">Image data preview:</p>
              <p className="text-xs text-slate-500 font-mono break-all line-clamp-3">
                {imageData.substring(0, 200)}...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
