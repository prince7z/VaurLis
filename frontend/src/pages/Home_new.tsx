import {
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  Rating,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { useEffect, useState } from 'react';
import { useRecoilValueLoadable } from 'recoil';
import { CoursesState } from '../Component/atoms/atoms';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';

interface Course {
  _id: string;
  name: string;
  img: string;
  description: string;
  price: number;
  rating: number;
  institution: string;
  instructor: {
    _id: string;
    username: string;
    img: string;
  };
}

interface Instructor {
  _id: string;
  username: string;
  img: string;
  bio?: string;
  verified?: boolean;
}

export default function HomePage() {
  const navigate = useNavigate();
  const coursesLoadable = useRecoilValueLoadable(CoursesState('all'));
  
  const [mitCourses, setMitCourses] = useState<Course[]>([]);
  const [harvardCourses, setHarvardCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [topInstructors, setTopInstructors] = useState<Instructor[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processData = async () => {
      try {
        if (coursesLoadable.state === 'hasValue') {
          const courses: Course[] = coursesLoadable.contents || [];
          
          console.log('All courses:', courses);

          // Filter by institution - "Harvard University" and "MIT"
          const mit = courses.filter((c) => c.institution?.toLowerCase().includes('mit'));
          const harvard = courses.filter((c) => c.institution?.toLowerCase().includes('harvard'));
          
          console.log('MIT courses:', mit.length);
          console.log('Harvard courses:', harvard.length);

          setMitCourses(mit);
          setHarvardCourses(harvard);

          // Featured: mix of courses
          const featured = courses.slice(0, 5);
          setFeaturedCourses(featured);

          // Fetch instructors
          try {
            const instructorsRes = await axios.get(`${API_URL}/api/course/instructorlist`);
            setTopInstructors(instructorsRes.data.instructors || []);
          } catch (err) {
            console.error('Error fetching instructors:', err);
          }

          // Fetch reviews
          try {
            const topCourses = courses.slice(0, 3);
            const allReviews: any[] = [];
            
            for (const course of topCourses) {
              try {
                const reviewRes = await axios.get(`${API_URL}/api/course/getreview/${course._id}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                  }
                });
                if (reviewRes.data.reviews && reviewRes.data.reviews.length > 0) {
                  allReviews.push(...reviewRes.data.reviews.slice(0, 2));
                }
              } catch (err) {
                // Continue
              }
            }
            setReviews(allReviews.slice(0, 3));
          } catch (err) {
            console.error('Error fetching reviews:', err);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error('Error processing courses:', error);
        setLoading(false);
      }
    };

    processData();
  }, [coursesLoadable]);

  const CourseCard = ({ course }: { course: Course }) => (
    <Card
      sx={{
        minWidth: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { 
          transform: 'translateY(-4px)', 
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)' 
        },
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={course.img || 'https://via.placeholder.com/300x200?text=Course'}
        alt={course.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#000', 
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            fontSize: '0.95rem'
          }}
        >
          {course.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Rating value={course.rating || 0} readOnly size="small" />
          <Typography variant="caption" sx={{ color: '#999' }}>
            {course.rating || '0'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: '0.85rem' }}>
          {course.instructor?.username || 'Unknown'}
        </Typography>

        <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 600, mt: 'auto' }}>
          {course.price === 0 ? 'Free' : `$${course.price}`}
        </Typography>
      </CardContent>
    </Card>
  );

  // Circular Instructor Card Component
  const CircularInstructorCard = ({ instructor }: { instructor: Instructor }) => (
    <Box
      onClick={() => navigate(`/${instructor.username}`)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.05)' },
        minWidth: 'fit-content',
        flex: '0 0 auto',
      }}
    >
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Avatar
          src={instructor.img}
          sx={{
            width: 120,
            height: 120,
            bgcolor: '#e0e0e0',
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        />
        {instructor.verified && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: '#4caf50',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <svg style={{ width: 18, height: 18, color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Box>
        )}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#000', textAlign: 'center', mb: 0.5 }}>
        {instructor.username}
      </Typography>
      {instructor.bio && (
        <Typography variant="caption" sx={{ color: '#999', textAlign: 'center', fontSize: '0.75rem' }}>
          {instructor.bio.substring(0, 30)}...
        </Typography>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
      {/* Hero Carousel */}
      {featuredCourses.length > 0 && (
        <Box sx={{ bgcolor: '#ffffff', py: 4, mb: 6 }}>
          <Container maxWidth="lg">
            <Carousel
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                height: 350,
              }}
            >
              {featuredCourses.map((course) => (
                <Box
                  key={course._id}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 350,
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${course.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: 4,
                  }}
                >
                  <Box sx={{ color: '#fff' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {course.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, maxWidth: 600 }}>
                      {course.description?.substring(0, 120)}...
                    </Typography>
                    <Typography variant="body2">
                      Instructor: {course.instructor?.username}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Carousel>
          </Container>
        </Box>
      )}

      {/* MIT Courses - Horizontal Scroll */}
      {mitCourses.length > 0 && (
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>
              Courses from MIT
            </Typography>
            <Button variant="text" sx={{ color: '#666', textTransform: 'uppercase' }}>
              View All
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}
          >
            {mitCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </Box>
        </Container>
      )}

      {/* Harvard Courses - Horizontal Scroll */}
      {harvardCourses.length > 0 && (
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>
              Courses from Harvard University
            </Typography>
            <Button variant="text" sx={{ color: '#666', textTransform: 'uppercase' }}>
              View All
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}
          >
            {harvardCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </Box>
        </Container>
      )}

      {/* Top Instructors - Horizontal Scroll */}
      {topInstructors.length > 0 && (
        <Box sx={{ bgcolor: '#ffffff', py: 6, mb: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 4 }}>
              Top Instructors
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                overflowX: 'auto',
                pb: 2,
                px: 2,
                mx: -2,
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#555',
                  },
                },
              }}
            >
              {topInstructors.slice(0, 10).map((instructor) => (
                <CircularInstructorCard key={instructor._id} instructor={instructor} />
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <Box sx={{ bgcolor: '#ffffff', py: 6, mb: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 4 }}>
              What Users Say
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                pb: 2,
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#555',
                  },
                },
              }}
            >
              {reviews.map((review, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 3,
                    bgcolor: '#f9f9f9',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    minWidth: 300,
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={review.user?.img}
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: '#e0e0e0',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>
                        {review.user?.username || 'User'}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    "{review.review}"
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
}
