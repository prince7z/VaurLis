import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import express, { Request, Response, Router } from 'express';
import { auth, authlite } from '../Midware/Mware';
import {User,Course} from '../DB/MDB';
import cloudinary from "../config/cloudinary";

// Storage for PROFILE images (square 1:1)
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // @ts-ignore
        folder: 'profile_pics',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [
            { width: 400, height: 400, crop: 'fill' }, // Square for profile
        ],
    },
});

// Storage for BANNER images (wide 4:1)
const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // @ts-ignore
        folder: 'banner_pics',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [
            { width: 1200, height: 300, crop: 'fill' }, // Wide rectangle for banner
        ],
    },
});

const thumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // @ts-ignore
        folder: 'thumbnail_pics',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [
            { width: 400, height: 300, crop: 'fill' }, // Thumbnail dimensions
        ],
    },
});

const contentThumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // @ts-ignore
        folder: 'content_thumbnails',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [
            { width: 320, height: 180, crop: 'fill' }, // 16:9 for video thumbnails
        ],
    },
});

const thumbnailUpload = multer({ 
    storage: thumbnailStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const courseUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Create separate upload handlers
const profileUpload = multer({ 
    storage: profileStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const bannerUpload = multer({ 
    storage: bannerStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (cloudinaryUrl: string): string | null => {
    try {
        const urlParts = cloudinaryUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex === -1) return null;
        
        let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        
        if (pathAfterUpload.startsWith('v') && pathAfterUpload.includes('/')) {
            pathAfterUpload = pathAfterUpload.split('/').slice(1).join('/');
        }
        
        const publicId = pathAfterUpload.split('.')[0];
        return publicId;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
    try {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted old image: ${publicId}`);
        }
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

const router: Router = express.Router();

// Custom middleware to handle different file types with different storages
const uploadMiddleware = (req: any, res: any, next: any) => {
    // Create a combined upload handler
    const upload = multer().fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 }
    ]);
    
    upload(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }
        
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const profileFile = files?.profileImage?.[0];
        const bannerFile = files?.bannerImage?.[0];
        
        // Upload profile image to Cloudinary with square dimensions
        if (profileFile) {
            try {

                const result = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({
                        folder: 'profile_pics',
                        transformation: [{ width: 400, height: 400, crop: 'fill' }],
                        resource_type: 'auto',
                        format: 'jpg'
                    }, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });
                    
                    uploadStream.end(profileFile.buffer);
                });
                
                // Add Cloudinary result to request
                req.cloudinaryResults = req.cloudinaryResults || {};
                req.cloudinaryResults.profileImage = {
                    path: result.secure_url,
                    public_id: result.public_id
                };
            } catch (error) {
                console.log("profile upload error:", error);
                return res.status(500).json({ error: 'Profile image upload failed' });
            }
        }
        
        // Upload banner image to Cloudinary with wide dimensions
        if (bannerFile) {
            try {
 
                    const result = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({
                        folder: 'banner_pics',
                        transformation: [{ width: 1200, height: 300, crop: 'fill' }],
                        resource_type: 'auto',
                        format: 'jpg'
                    }, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });
                    
                    uploadStream.end(bannerFile.buffer);
                });
                
                // Add Cloudinary result to request
                req.cloudinaryResults = req.cloudinaryResults || {};
                req.cloudinaryResults.bannerImage = {
                    path: result.secure_url,
                    public_id: result.public_id
                };
            } catch (error) {
                console.log("banner upload error:", error);
                return res.status(500).json({ error: 'Banner image upload failed', });
            }
        }
        
        next();
    });
};

router.post('/upload', auth, courseUpload.any(), async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'At least one thumbnail is required' });
        }

        // Find the main course thumbnail
        const mainThumbnailFile = files.find(f => f.fieldname === 'thumbnail');
        if (!mainThumbnailFile) {
            return res.status(400).json({ error: 'Course thumbnail is required' });
        }

        // Upload main course thumbnail to Cloudinary
        const mainThumbnailResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: 'thumbnail_pics',
                transformation: [{ width: 400, height: 300, crop: 'fill' }],
                resource_type: 'auto',
                format: 'jpg'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            uploadStream.end(mainThumbnailFile.buffer);
        });

        // Parse contentLink data from request body
        const contentLinkData = req.body.contentLink;
        let contentArray: any[] = [];

        if (contentLinkData) {
            // Handle the nested array structure from FormData
            if (typeof contentLinkData === 'string') {
                try {
                    contentArray = JSON.parse(contentLinkData);
                } catch (e) {
                    // Handle as form data structure
                    const contentMap = new Map();
                    Object.keys(req.body).forEach(key => {
                        const match = key.match(/contentLink\[(\d+)\]\[(\w+)\]/);
                        if (match) {
                            const index = parseInt(match[1]);
                            const field = match[2];
                            if (!contentMap.has(index)) {
                                contentMap.set(index, {});
                            }
                            contentMap.get(index)[field] = req.body[key];
                        }
                    });
                    contentArray = Array.from(contentMap.values());
                }
            }
        }

        // Upload content thumbnails and build content array
        const content = await Promise.all(
            contentArray.map(async (item, index) => {
                const contentThumbnailFile = files.find(
                    f => f.fieldname === `contentLink[${index}][thumbnail]`
                );

                let thumbnailUrl = '';
                if (contentThumbnailFile) {
                    const thumbnailResult = await new Promise<any>((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream({
                            folder: 'content_thumbnails',
                            transformation: [{ width: 320, height: 180, crop: 'fill' }],
                            resource_type: 'auto',
                            format: 'jpg'
                        }, (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        });
                        uploadStream.end(contentThumbnailFile.buffer);
                    });
                    thumbnailUrl = thumbnailResult.secure_url;
                }

                return {
                    name: item.name || '',
                    link: item.link || '',
                    thumbnail: thumbnailUrl,
                    duration: parseInt(item.duration) || 0
                };
            })
        );

        // Create new course with the schema structure
        const newCourse = new Course({
            name: req.body.title,
            description: req.body.description,
            duration: req.body.duration,
            price: parseFloat(req.body.price) || 0,
            img: mainThumbnailResult.secure_url,
            content: content,
            instructor: userid,
            rating: [],
            act_users: [],
            links: []
        });

        await newCourse.save();
        
        res.status(201).json({ 
            message: 'Course created successfully', 
            course: newCourse 
        });
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

router.post('/update', auth, uploadMiddleware, async (req: Request, res: Response) => {
    try {
        const userid = req.user?.id;
        if (!userid) {               
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Get current user data to access old image URLs
        const currentUser = await User.findById(userid);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { username, bio, skills, socialLinks } = req.body;
        const cloudinaryResults = (req as any).cloudinaryResults || {};

        const updateData: any = {};

        // Handle profile image
        if (cloudinaryResults.profileImage) {
            // New file uploaded - replace old image
            if (currentUser.img) {
                await deleteFromCloudinary(currentUser.img);
            }
            updateData.img = cloudinaryResults.profileImage.path;
        } else if (req.body.profileImage === "Remove") {
            // User wants to remove profile image
            if (currentUser.img) {
                await deleteFromCloudinary(currentUser.img);
            }
            updateData.img = "";
        }
        
        // Handle banner image
        if (cloudinaryResults.bannerImage) {
            // New file uploaded - replace old image
            if (currentUser.bgimg) {
                await deleteFromCloudinary(currentUser.bgimg);
            }
            updateData.bgimg = cloudinaryResults.bannerImage.path;
        } else if (req.body.bannerImage === "Remove") {
            // User wants to remove banner image
            if (currentUser.bgimg) {
                await deleteFromCloudinary(currentUser.bgimg);
            }
            updateData.bgimg = "";
        }

        // Handle other form data
        if (username && username.trim()) {
            updateData.username = username.trim();
        }
        
        if (bio !== undefined) {
            updateData.bio = bio;
        }
        
        if (skills) {
            try {
                updateData.skills = JSON.parse(skills);
            } catch (e) {
                updateData.skills = skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0);
            }
        }
        
        if (socialLinks) {
            try {
                updateData.socialLinks = JSON.parse(socialLinks);
            } catch (e) {
                updateData.socialLinks = {};
            }
        }

        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(
            userid,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({ 
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (e: unknown) {
        return res.status(500).json({ 
            message: "Internal server error",
            error: e instanceof Error ? e.message : String(e)
        });
    }
});

export default router;