import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera } from "lucide-react";
import { Button, Modal, Box, Slider } from "@mui/material";

export default function ProfilePicUploader() {
  const [profilePic, setProfilePic] = useState<string | null>(null); // Final profile pic
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null); // Selected file
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [open, setOpen] = useState(false);

  // When user selects a file
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setOpen(true); // Open modal for cropping
      };
      reader.readAsDataURL(file);
    }
  };

  // Define type for cropped area pixels
  interface CroppedAreaPixels {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  // Function to create cropped image from source
  const getCroppedImg = async (
    imageSrc: string | ArrayBuffer | null,
    croppedAreaPixels: CroppedAreaPixels | null
  ): Promise<string> => {
    if (!imageSrc || !croppedAreaPixels) return '';
    
    // Create an image element
    const image = new Image();
    image.src = imageSrc as string;
    
    // Create canvas and get its context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to cropped size
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    
    // Draw the cropped image
    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    
  // Return data URL of the canvas
    return canvas.toDataURL('image/jpeg');
  };

  // When crop is complete
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Generate cropped image
  const createCroppedImage = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    setProfilePic(croppedImage); // Save final image
    setOpen(false); // Close modal
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Profile Pic with Edit Button */}
      <div className="relative">
        <img
          src={profilePic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border shadow"
        />
        <label
          htmlFor="fileInput"
          className="absolute bottom-1 right-1 bg-gray-800 text-white rounded-full p-2 cursor-pointer hover:bg-gray-700"
        >
          <Camera className="w-5 h-5" />
        </label>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Crop Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <div className="relative w-full h-64 bg-gray-200">
            {imageSrc && typeof imageSrc === 'string' && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // square crop like LinkedIn
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Zoom Slider */}
          <div className="mt-4">
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e, zoom) => setZoom(zoom)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button  onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button  onClick={createCroppedImage}>
              Save
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
