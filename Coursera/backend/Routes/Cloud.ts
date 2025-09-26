import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import express, { Request, Response, Router } from 'express';
import { auth, authlite } from '../Midware/Mware';
import {User} from '../DB/MDB';
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // @ts-ignore
        folder: 'profile_pics',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [
            { width: 400, height: 400, crop: 'fill' },
        ],
    },
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
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

router.post('/update', auth, upload.fields([
    { name: 'profileImage', maxCount: 1 }, 
    { name: 'bannerImage', maxCount: 1 }
]), async (req: Request, res: Response) => {
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
        
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const profileImage = files?.profileImage?.[0];
        const bannerImage = files?.bannerImage?.[0];
        
        const { username, bio, skills, socialLinks } = req.body;

        const updateData: any = {};

        // Handle profile image
        if (profileImage) {
            // New file uploaded - replace old image
            if (currentUser.img) {
                await deleteFromCloudinary(currentUser.img);
            }
            updateData.img = profileImage.path;
        } else if (req.body.profileImage === "Remove") {
            // User wants to remove profile image
            if (currentUser.img) {
                await deleteFromCloudinary(currentUser.img);
            }
            updateData.img = ""; // Set to empty string
        }
        
        // Handle banner image
        if (bannerImage) {
            // New file uploaded - replace old image
            if (currentUser.bgimg) {
                await deleteFromCloudinary(currentUser.bgimg);
            }
            updateData.bgimg = bannerImage.path;
        } else if (req.body.bannerImage === "Remove") {
            // User wants to remove banner image
            if (currentUser.bgimg) {
                await deleteFromCloudinary(currentUser.bgimg);
            }
            updateData.bgimg = ""; // Set to empty string
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