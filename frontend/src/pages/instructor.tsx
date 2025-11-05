import React, { use, useEffect, useState, type JSX } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CourseCard from "../Component/coursecard";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import { Button } from "@mui/material";
import { useRecoilState } from "recoil";
import { avatarState,bannerState,usernameState,socialLinksState,bioState, skillsState } from "../Component/atoms/atoms";
import EditProfileDialog from "../Component/EditProfileDialog";
import { API_URL } from '../config/api';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {Tabb, TTabb} from '../Component/CustomTab';
import { styled } from '@mui/material/styles';
import type {ITransaction} from '../Component/CustomTab';

const StyledTabs = styled(Tabs)(() => ({
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    '& .MuiTabs-indicator': {
        backgroundColor: '#7F1D1D',
        height: '3px'
    }
}));

const StyledTab = styled(Tab)(() => ({
    color: '#A0A0A0',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '14px',
    letterSpacing: '0.5px',
    padding: '6px 16px',
    '&.Mui-selected': {
        color: '#FFFFFF'
    },
    '&.Mui-disabled': {
        color: 'rgba(160, 160, 160, 0.4)'
    },
    '&:hover:not(.Mui-disabled)': {
        color: '#FFFFFF',
        opacity: 1
    }
}));

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
            style={{ backgroundColor: '#c5c5c5ff', minHeight: '200px', padding: '24px' }}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

const defaultAvatar = "https://www.gravatar.com/avatar/?d=mp&f=y";

export default function Instructor() {
    const { username } = useParams();
    const [instructorDetails, setInstructorDetails] = useState<any>(null);
    const [Avatar, setAvatar] = useRecoilState(avatarState);
    const [banner, setBanner] = useRecoilState(bannerState);    
    const [bio, setBio] = useRecoilState(bioState);
    const [skills, setSkills] = useRecoilState(skillsState);
    const [socialLinks, setSocialLinks] = useRecoilState(socialLinksState);
    const [uname, setUname] = useRecoilState(usernameState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rel,Setrel] = useState([]);
    const [pur,Setpur] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const id = username || '';
    const [DataTrns, SetTrans] = useState<ITransaction[]>([]);
    const [value, setValue] = React.useState(0);
    const [doowns, setDoowns] = useState(false);


    
       

    useEffect(() => {
        const fetchInstructorDetails = async (id: string) => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/api/user/instructor/${id}`, {
                    headers: {
                        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
                    }
                });
                setInstructorDetails(response.data);
                if (response.data.img){
                    setAvatar(response.data.img);
                }
                if (response.data.bgimg){
                    setBanner(response.data.bgimg);
                }
                if (response.data.bio){
                    setBio(response.data.bio);
                }
                if (response.data.username){
                    setUname(response.data.username);
                    const local_user=localStorage.getItem("user");
                    if (local_user && JSON.parse(local_user).username===response.data.username){
                        setDoowns(true);
                    }
                }
                if (response.data.socialLinks){
                    setSocialLinks(response.data.socialLinks);
                }
                if (response.data.skills){
                    setSkills(response.data.skills);
                }
                if (response.data.rel_courses){
                    Setrel(response.data.rel_courses);
                }
                if (response.data.role==="owns"){
                    Setpur(response.data.pur_courses);
                }
                if (response.data.transactions){
                    SetTrans(response.data.transactions);
                }
            } catch (error) {
                setError("Error fetching instructor details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInstructorDetails(id);
        }
    }, [id]);


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                {error}
            </div>
        );
    }
    if (!instructorDetails) {
        return null;
    }



    // Social icon mapping
    const socialIcons: Record<string, JSX.Element> = {
        github: <FaGithub className="inline mr-2" />,
        linkedin: <FaLinkedin className="inline mr-2" />,
        x: <FaTwitter className="inline mr-2" />,
        mail: <FaEnvelope className="inline mr-2" />,
    };

 

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        // Only allow changing to tabs 1 and 2 if doowns is true
        if (newValue === 0 || doowns) {
            setValue(newValue);
        }
  };
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-5xl mx-auto">
                {/* Main Profile Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    {/* Banner */}
                    <div className="relative">
                        {instructorDetails.bgimg ? (
                            <div className="w-full h-35 bg-gradient-to-r from-blue-400 to-purple-500">
                                <img src={banner} alt="Background" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                        )}
                        
                        {/* Profile image */}
                        <div className="absolute -bottom-16 left-0 right-0 px-8 flex justify-between items-center">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                <img src={Avatar || instructorDetails.img || defaultAvatar} alt={instructorDetails.username} className="w-full h-full object-cover" />
                            </div>
                           {instructorDetails.role === "owns" && ( <Button onClick={() => {setEditDialogOpen(true);}} variant="contained" color="primary">
                                Edit Profile
                            </Button>)}
                        </div>
                        <EditProfileDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}   />
                    
                    </div>
                    
                    {/* Profile Info */}
                    <div className="pt-20 pb-6 px-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="mb-4">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{uname || instructorDetails.username}</h1>
                                <p className="text-lg text-gray-600 mb-3">{bio || instructorDetails.bio}</p>

                                {/* Social links */}
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {instructorDetails.socialLinks &&
                                        Object.entries(socialLinks).map(([key, value]) => (
                                            <a
                                                key={key}
                                                href={key === "mail" ? `mailto:${String(value)}` : String(value)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                                            >
                                                {socialIcons[key.toLowerCase()] || null}
                                                <span className="capitalize text-sm">{key}</span>
                                            </a>
                                        ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {instructorDetails.skills && instructorDetails.skills.length > 0 ? (
                                    skills.map((skill: string, idx: number) => (
                                        <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No skills listed</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div>


        <Box sx={{ 
                width: '100%', 
                bgcolor: '#1A1A1A',
                '& .MuiTabs-flexContainer': {
                    gap: '1rem'
                }
            }}>
            <StyledTabs 
                value={value} 
                onChange={handleChange} 
                centered
                variant="standard"
                aria-label="profile tabs"
                sx={{
                    minHeight: '48px',
                    '& .MuiTab-root': {
                        minHeight: '48px',
                        padding: '12px 16px'
                    }
                }}
            >
                <StyledTab 
                    label="RELEASED COURSES" 
                    id="tab-0" 
                    aria-controls="tabpanel-0"
                />
               {doowns && (
                    <>
                        <StyledTab 
                            label="PURCHASED COURSES" 
                            id="tab-1" 
                            aria-controls="tabpanel-1"
                        />
                        <StyledTab 
                            label="TRANSACTIONS" 
                            id="tab-2" 
                            aria-controls="tabpanel-2"
                        />
                    </>
                )}
            </StyledTabs>

            <TabPanel value={value} index={0}>
                {rel && rel.length > 0 ? (
                    <Tabb label="" Data={rel} />
                ) : (
                    <p style={{ color: '#A0A0A0', textAlign: 'center', padding: '2rem' }}>No released courses yet</p>
                )}
            </TabPanel>

            <TabPanel value={value} index={1}>
                {doowns ? (
                    pur && pur.length > 0 ? (
                        <Tabb label="" Data={pur} />
                    ) : (
                        <p style={{ color: '#A0A0A0', textAlign: 'center', padding: '2rem' }}>No purchased courses yet</p>
                    )
                ) : (
                    <p style={{ color: '#A0A0A0', textAlign: 'center', padding: '2rem' }}>
                        You need to be logged in to view purchased courses
                    </p>
                )}
            </TabPanel>

            <TabPanel value={value} index={2}>
                {doowns ? (
                    DataTrns && DataTrns.length > 0 ? (
                        <TTabb label="" Data={DataTrns} />
                    ) : (
                        <p style={{ color: '#A0A0A0', textAlign: 'center', padding: '2rem' }}>No transactions yet</p>
                    )
                ) : (
                    <p style={{ color: '#A0A0A0', textAlign: 'center', padding: '2rem' }}>
                        You need to be logged in to view transactions
                    </p>
                )}
            </TabPanel>
        </Box>
                </div>
        </div>
    </div>
    );
}


