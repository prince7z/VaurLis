import axios from "axios";
import {useState , useEffect} from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { 
    TextField, 
    Button, 
    Card, 
    CardContent, 
    CardMedia, 
    Typography, 
    Box, 
    Avatar, 
    Chip, 
    Paper,
    Container
} from "@mui/material";
import { AccessTime, Person, PlayArrow, Schedule } from "@mui/icons-material";
import { API_URL } from '../config/api';

export default function LiveClass() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [liveClass, setLiveClass] = useState<any>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [Role, setRole] = useState<'pur' | 'owns' >('pur');
    useEffect(() => {
        const fetchLiveClass = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/user/liveclass/${id}`, {
                    headers:{ 
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 250) {
                    setLiveClass(null);
                    return;
                }
                setRole(response.data.Role);
                
                setLiveClass(response.data.liveClass);
            } catch (error) {
                console.error("Error fetching live class:", error);
            }
        };

        fetchLiveClass();
    }, [id]);

    const settLiveClassData = async (data: {title: string, description: string,scheduledAt: Date,duration: number }) => {
        try {
            const res = await axios.post(`${API_URL}/api/user/schedule/liveclass/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.status === 201) {
                console.log(res.data)
                setLiveClass(res.data);
            }
            else {
                alert("Error scheduling live class");
            }
        } catch (error) {
            console.error("Error scheduling live class:", error);
            alert("Error scheduling live trycatch");
        }
    }
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            
            {liveClass ? (
                
                <Card elevation={3} sx={{ borderRadius: 2 }}>
                    <CardMedia
                        component="img"
                        height="300"
                        image={liveClass.courseId.img}
                        alt="Course Image"
                        sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
                            {liveClass.title}
                        </Typography>
                        
                        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                            {liveClass.courseId.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar 
                                src={liveClass.instructorId.img} 
                                alt="Instructor"
                                sx={{ width: 60, height: 60, mr: 2 }}
                            />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Instructor: {liveClass.instructorId.username}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.6, mb: 3 }}>
                            {liveClass.description}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                            <Chip 
                                icon={<Schedule />}
                                label={`Scheduled: ${new Date(liveClass.scheduledAt).toLocaleString()}`}
                                variant="outlined"
                                sx={{ flex: 1 }}
                            />
                            <Chip 
                                icon={<AccessTime />}
                                label={`Duration: ${liveClass.duration} minutes`}
                                variant="outlined"
                                sx={{ flex: 1 }}
                            />
                        </Box>
{Role === 'owns' ? (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large"
                            startIcon={<PlayArrow />}
                            fullWidth
                            sx={{ 
                                py: 1.5, 
                                fontSize: '1.1rem',
                                borderRadius: 2,
                                textTransform: 'none'
                            }}
                            onClick={() => {
                                navigate(`/live/sender/${liveClass._id}`);
                            }}
                        >
                            Start Live Class
                        </Button>
                        ) : (
                           <Button 
                            variant="contained" 
                            color="primary" 
                            size="large"
                            startIcon={<PlayArrow />}
                            fullWidth
                            sx={{ 
                                py: 1.5, 
                                fontSize: '1.1rem',
                                borderRadius: 2,
                                textTransform: 'none'
                            }}
                            onClick={() => {
                                navigate(`/live/receiver/${liveClass._id}`);
                            }}
                        >
                            Join Live Class
                        </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                Role === 'owns' ? (
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h4" component="h1" gutterBottom color="primary" textAlign="center" fontWeight="bold" sx={{ mb: 4 }}>
                            Schedule Live Class
                        </Typography>
                        
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField 
                                onChange={(e) => setTitle(e.target.value)} 
                                label="Class Title" 
                                variant="outlined" 
                                fullWidth 
                            />
                            
                            <TextField 
                                onChange={(e) => setDescription(e.target.value)} 
                                label="Description" 
                                variant="outlined" 
                                fullWidth 
                                multiline 
                                rows={4}
                            />
                            
                            <TextField 
                                onChange={(e) => setScheduledAt(new Date(e.target.value))} 
                                label="Scheduled At" 
                                type="datetime-local" 
                                variant="outlined" 
                                fullWidth 
                                InputLabelProps={{ shrink: true }}
                                onClick={(e) => {
                                    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                                    input?.showPicker?.();
                                }}
                            />
                            
                            <TextField 
                                onChange={(e) => setDuration(Number(e.target.value))} 
                                label="Duration (minutes)" 
                                type="number" 
                                variant="outlined" 
                                fullWidth 
                                InputLabelProps={{ shrink: true }}
                            />
                            
                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="large"
                                fullWidth
                                sx={{ 
                                    py: 1.5, 
                                    fontSize: '1.1rem',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    mt: 2
                                }}
                                onClick={() => {
                                    if (scheduledAt) {
                                        settLiveClassData({ title, description, scheduledAt, duration });
                                    } else {
                                        alert("Please select a scheduled date and time");
                                    }
                                }}
                            >
                                Schedule Live Class
                            </Button>
                        </Box>
                    </Paper>
                ) : (
                    <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                        No live class scheduled yet. Please check back later.
                    </Typography>
                )
            )}
        </Container>
    )
}