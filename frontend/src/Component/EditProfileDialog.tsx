import React, { useEffect, useState } from 'react';
import { Dialog, IconButton, TextField, Avatar, Button, DialogContent, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraIcon from '@mui/icons-material/CameraAlt';
import { useRecoilState, useRecoilValue } from 'recoil';
import { avatarState, bannerState, bioState, skillsState, usernameState, socialLinksState } from './atoms/atoms';
import axios from 'axios';
import { Trash } from 'lucide-react';
import ImageCropDialog from './cropimg';
import { API_URL } from '../config/api';

export default function EditProfileDialog(props: any) {
    const [avatar, setAvatar] = useState(useRecoilValue(avatarState));
    const [banner, setBanner] = useState(useRecoilValue(bannerState));
    const [username, setUsername] = useState(useRecoilValue(usernameState));
    const [bio, setBio] = useState(useRecoilValue(bioState));
    const [skills, setSkills] = useState(useRecoilValue(skillsState));
    const [socialLinks, setSocialLinks] = useState(useRecoilValue(socialLinksState));
    const [available, setAvailable] = useState(true);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentSkillInput, setCurrentSkillInput] = useState('');

    // Cropping states
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [cropType, setCropType] = useState<'profile' | 'banner'>('profile');

    const originalUsername = useRecoilValue(usernameState);
    const originalBio = useRecoilValue(bioState);
    const originalSkills = useRecoilValue(skillsState);
    const originalSocialLinks = useRecoilValue(socialLinksState);

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            setCropType('profile');
            setCropDialogOpen(true);
        }
        // Reset the input
        event.target.value = '';
    };

    const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            setCropType('banner');
            setCropDialogOpen(true);
        }
        // Reset the input
        event.target.value = '';
    };

    const handleCropComplete = (croppedFile: File, croppedUrl: string) => {
        if (cropType === 'profile') {
            setProfileFile(croppedFile);
            setAvatar(croppedUrl);
        } else {
            setBannerFile(croppedFile);
            setBanner(croppedUrl);
        }
        setCropDialogOpen(false);
        setSelectedImageFile(null);
    };

    const handleSocialLinkChange = (platform: string, value: string) => {
        const updatedLinks = { ...socialLinks };
        updatedLinks[platform as keyof typeof socialLinks] = value;
        setSocialLinks(updatedLinks);
    };

    const handleSkillsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        
        // Check if space or comma was just typed
        if (value.endsWith(' ') || value.endsWith(',')) {
            const trimmedSkill = value.slice(0, -1).trim();
            if (trimmedSkill && !skills.includes(trimmedSkill)) {
                setSkills([...skills, trimmedSkill]);
                setCurrentSkillInput(''); // Clear input after adding skill
            } else {
                setCurrentSkillInput(''); // Clear even if duplicate
            }
        } else {
            setCurrentSkillInput(value);
        }
    };
    
    const handleSkillsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && currentSkillInput === '') {
            // Remove last skill if backspace is pressed on empty input
            event.preventDefault();
            if (skills.length > 0) {
                setSkills(skills.slice(0, -1));
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const trimmedSkill = currentSkillInput.trim();
            if (trimmedSkill && !skills.includes(trimmedSkill)) {
                setSkills([...skills, trimmedSkill]);
                setCurrentSkillInput('');
            }
        }
    };
    
    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    useEffect(() => {
        if (username.length > 3) {
            const fetchUsername = async () => {
                try {
                    const exist = await axios.get(`${API_URL}/api/user/check-username?username=${username}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setAvailable(exist.data.available);
                } catch (error) {
                    console.error('Error checking username:', error);
                    setAvailable(false);
                }
            };
            fetchUsername();
        }
    }, [username]);

    const SaveToBackend = async () => {
        if (username.length < 4 || !available) {
            alert("Please enter a valid and available username (at least 4 characters).");
            return;
        }

        try {
            const formData = new FormData();

            // Add files if they exist
            if (profileFile) {
                formData.append('profileImage', profileFile);
            }
            if (bannerFile) {
                formData.append('bannerImage', bannerFile);
            }

            if (username !== originalUsername) { formData.append('username', username); }
            if (avatar === "") { formData.append('profileImage', "Remove"); }
            if (banner === "") { formData.append('bannerImage', "Remove"); }
            if (bio !== originalBio) { formData.append('bio', bio); }
            if (JSON.stringify(skills) !== JSON.stringify(originalSkills)) { formData.append('skills', JSON.stringify(skills)); }
            if (JSON.stringify(socialLinks) !== JSON.stringify(originalSocialLinks)) { formData.append('socialLinks', JSON.stringify(socialLinks)); }

            setLoading(true);
            try {
                const res = await axios.post(`${API_URL}/api/cloud/update`, formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                console.log("Profile updated:", res.data);
                props.onClose();
                window.location.reload();
            } catch (error) {
                console.error('Error updating profile:', error);
                alert("Failed to update profile.");
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert("Failed to update profile.");
        }
    };

    if (loading) {
        return (
            <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm" className="edit-profile-dialog">
                <DialogContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                    <CircularProgress style={{ marginBottom: '20px' }} />
                    <div>Updating info in cloud...</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm" className="edit-profile-dialog">
                <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                    <IconButton onClick={props.onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                    <h2 style={{ margin: 0 }}>Edit Profile</h2>
                    <Button variant="contained" color="primary" onClick={SaveToBackend}>
                        Save
                    </Button>
                </div>

                <div className='position-relative'>
                    <div style={{ height: '150px', backgroundColor: '#f0f0f0', backgroundImage: `url(${banner})`, backgroundSize: 'cover', position: 'relative' }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="banner-upload"
                            type="file"
                            onChange={handleBannerUpload}
                        />
                        <label htmlFor="banner-upload" style={{ position: 'absolute', right: '10px', bottom: '10px', cursor: 'pointer', zIndex: 10 }}>
                            <IconButton component="span" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                <CameraIcon />
                            </IconButton>
                        </label>
                        <IconButton
                            onClick={() => {
                                setBanner("");
                                setBannerFile(null);
                            }}
                            style={{ position: 'absolute', right: '60px', bottom: '10px', backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10 }}
                        >
                            <Trash size={16} />
                        </IconButton>
                    </div>

                    <div style={{ position: 'relative', marginTop: '-50px', marginLeft: '20px' }}>
                        <Avatar src={avatar} style={{ width: '100px', height: '100px', border: '4px solid white' }} />
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar-upload"
                            type="file"
                            onChange={handleAvatarUpload}
                        />
                        <label htmlFor="avatar-upload" style={{ position: 'absolute', right: '-5px', bottom: '0' }}>
                            <IconButton component="span" size="small" style={{ backgroundColor: 'white' }}>
                                <CameraIcon fontSize="small" />
                            </IconButton>
                        </label>
                        <Trash size={16} style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={() => setAvatar("")} />
                    </div>
                </div>

                <div style={{ padding: '20px', marginTop: '30px' }}>
                    <TextField
                        label="Username"
                        color={username.length < 4 ? "error" : available ? "primary" : "error"}
                        helperText={username.length < 4 ? "Username must be at least 4 characters" : available ? "Username is available" : "Username is taken"}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <TextField
                        label="Bio"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        margin="normal"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                    />

                    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
                            Skills
                        </label>
                        <div style={{ 
                            border: '1px solid #ccc', 
                            borderRadius: '4px', 
                            padding: '8px', 
                            minHeight: '56px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            alignItems: 'center'
                        }}>
                            {skills.map((skill, index) => (
                                <span 
                                    key={index}
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '16px',
                                        fontSize: '14px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            padding: '0 2px',
                                            fontSize: '16px',
                                            lineHeight: '1'
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={currentSkillInput}
                                onChange={handleSkillsChange}
                                onKeyDown={handleSkillsKeyDown}
                                placeholder={skills.length === 0 ? "Type a skill and press Space or Comma" : "Add more..."}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flex: 1,
                                    minWidth: '120px',
                                    fontSize: '14px',
                                    padding: '4px'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            Press Space, Comma, or Enter to add a skill. Backspace to remove last skill.
                        </p>
                    </div>
                    <h3 style={{ margin: 0 }}>Social Links</h3>
                    {Object.entries(socialLinks).map(([platform, link]) => (
                        <TextField
                            key={platform}
                            label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            value={link}
                            onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                        />
                    ))}
                </div>
            </Dialog>

            {/* Image Crop Dialog */}
            <ImageCropDialog
                open={cropDialogOpen}
                onClose={() => {
                    setCropDialogOpen(false);
                    setSelectedImageFile(null);
                }}
                imageFile={selectedImageFile}
                onCropComplete={handleCropComplete}
                aspectRatio={cropType === 'profile' ? 1 : 4} // 1:1 for profile, 4:1 for banner
                cropType={cropType}
            />
        </>
    );
}