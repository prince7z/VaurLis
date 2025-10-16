import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogActions, Button, IconButton, Slider, Typography } from '@mui/material';
import Cropper from 'react-easy-crop';
import CloseIcon from '@mui/icons-material/Close';

interface ImageCropDialogProps {
    open: boolean;
    onClose: () => void;
    imageFile: File | null;
    onCropComplete: (croppedFile: File, croppedUrl: string) => void;
    aspectRatio?: number; // 1 for square (profile), 4 for banner
    cropType: 'profile' | 'banner';
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function ImageCropDialog({ 
    open, 
    onClose, 
    imageFile, 
    onCropComplete, 
    aspectRatio = 1, 
    cropType 
}: ImageCropDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [imageSrc, setImageSrc] = useState<string>('');

    React.useEffect(() => {
        if (imageFile && open) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImageSrc(e.target.result as string);
                }
            };
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile, open]);

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> => 
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', error => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0,
        flip = { horizontal: false, vertical: false }
    ): Promise<{ file: File; url: string }> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        // Set canvas size based on crop type
        if (cropType === 'profile') {
            canvas.width = 400;
            canvas.height = 400;
        } else {
            canvas.width = 1200;
            canvas.height = 300;
        }

        ctx.imageSmoothingQuality = 'high';

        // Calculate the center of the canvas
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();

        // Move to center, rotate, then move back
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        ctx.translate(-centerX, -centerY);

        // Draw the cropped image
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        throw new Error('Failed to create blob');
                    }
                    const file = new File([blob], imageFile?.name || 'cropped-image.jpg', {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    const url = URL.createObjectURL(blob);
                    resolve({ file, url });
                },
                'image/jpeg',
                0.9
            );
        });
    };

    const handleCropComplete = async () => {
        if (croppedAreaPixels && imageSrc && imageFile) {
            try {
                const { file, url } = await getCroppedImg(
                    imageSrc,
                    croppedAreaPixels,
                    rotation
                );
                onCropComplete(file, url);
                onClose();
                // Reset state
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
                setCroppedAreaPixels(null);
                setImageSrc('');
            } catch (error) {
                console.error('Error cropping image:', error);
            }
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        setImageSrc('');
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogContent style={{ padding: 0 }}>
                {/* Header */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px', 
                    borderBottom: '1px solid #e0e0e0' 
                }}>
                    <h3 style={{ margin: 0 }}>
                        Crop {cropType === 'profile' ? 'Profile Picture' : 'Banner Image'}
                    </h3>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </div>
                
                {/* Cropper */}
                <div style={{ 
                    position: 'relative', 
                    height: '400px', 
                    background: '#f0f0f0' 
                }}>
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropCompleteHandler}
                            cropShape={cropType === 'profile' ? 'round' : 'rect'}
                            showGrid={true}
                            style={{
                                containerStyle: {
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                },
                                cropAreaStyle: {
                                    border: '2px solid #1976d2',
                                },
                            }}
                        />
                    )}
                </div>

                {/* Controls */}
                <div style={{ padding: '20px', backgroundColor: '#fafafa' }}>
                    <Typography variant="body2" gutterBottom>
                        Zoom
                    </Typography>
                    <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(_, value) => setZoom(value as number)}
                        valueLabelDisplay="auto"
                        style={{ marginBottom: '20px' }}
                    />

                    <Typography variant="body2" gutterBottom>
                        Rotation
                    </Typography>
                    <Slider
                        value={rotation}
                        min={0}
                        max={360}
                        step={1}
                        onChange={(_, value) => setRotation(value as number)}
                        valueLabelDisplay="auto"
                    />
                </div>
            </DialogContent>
            
            <DialogActions style={{ padding: '16px' }}>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button 
                    onClick={handleCropComplete} 
                    variant="contained" 
                    color="primary"
                    disabled={!croppedAreaPixels}
                >
                    Apply Crop
                </Button>
            </DialogActions>
        </Dialog>
    );
}