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
  Grid,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { useEffect, useState } from 'react';
import { useRecoilValueLoadable } from 'recoil';
import { CoursesState } from '../Component/atoms/atoms';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import InstructorCircleCard from '../Component/InstructorCircleCard';

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
      onClick={() => navigate(`/course/${course._id}`)}
      sx={{
        minWidth: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #f0f0f0',
        flexShrink: 0,
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Fixed 16:9 aspect ratio for images */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          overflow: 'hidden',
          bgcolor: '#e8e8e8',
        }}
      >
        <CardMedia
          component="img"
          image={course.img || 'https://via.placeholder.com/400x225?text=Course'}
          alt={course.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1,
        }}
      >
        {/* Course Title */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            lineHeight: 1.3,
            color: '#222',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em',
          }}
        >
          {course.name}
        </Typography>

        {/* Instructor */}
        <Typography
          variant="caption"
          sx={{
            color: '#888',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          {course.instructor?.username || 'Instructor'}
        </Typography>

        {/* Rating and Price */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 'auto',
            pt: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating
              value={course.rating || 0}
              readOnly
              size="small"
              sx={{ fontSize: '0.9rem' }}
            />
            <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
              {(course.rating || 0).toFixed(1)}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              color: course.price === 0 ? '#4caf50' : '#ff6b35',
              fontSize: '0.9rem',
            }}
          >
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Using `InstructorCircleCard` component for a compact circular instructor card

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
        <Box sx={{ bgcolor: '#ffffff', py: 0, mb: 6 }}>
          <Carousel
            sx={{
              borderRadius: 0,
              overflow: 'hidden',
              boxShadow: 'none',
              height: 400,
            }}
          >
            {featuredCourses.map((course) => (
              <Box
                key={course._id}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${course.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  p: 4,
                }}
              >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ color: '#fff', maxWidth: 500 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '1.4rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {course.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 2,
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        opacity: 0.95,
                      }}
                    >
                      {course.description?.substring(0, 100)}...
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.9rem',
                        opacity: 0.9,
                      }}
                    >
                      Instructor: {course.instructor?.username}
                    </Typography>
                  </Box>
                </Container>
              </Box>
            ))}
          </Carousel>
        </Box>
      )}

      {/* MIT Courses Section */}
      {mitCourses.length > 0 && (
        <Box sx={{ py: 6, bgcolor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.3rem',
                  color: '#222',
                }}
              >
                MIT Courses
              </Typography>
              <Button
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: '#2196f3',
                  '&:hover': { bgcolor: 'transparent', color: '#1976d2' },
                }}
              >
                View All →
              </Button>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f5f5f5',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ddd',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#bbb',
                  },
                },
              }}
            >
              {mitCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Harvard Courses Section */}
      {harvardCourses.length > 0 && (
        <Box sx={{ py: 6, bgcolor: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.3rem',
                  color: '#222',
                }}
              >
                Harvard University Courses
              </Typography>
              <Button
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: '#2196f3',
                  '&:hover': { bgcolor: 'transparent', color: '#1976d2' },
                }}
              >
                View All →
              </Button>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f5f5f5',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ddd',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#bbb',
                  },
                },
              }}
            >
              {harvardCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Top Instructors Section */}
      {topInstructors.length > 0 && (
        <Box sx={{ py: 6, bgcolor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.3rem',
                color: '#222',
                mb: 3,
              }}
            >
              Top Instructors
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f5f5f5',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ddd',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#bbb',
                  },
                },
              }}
            >
              {topInstructors.map((instructor) => (
                <InstructorCircleCard key={instructor._id} instructor={instructor} />
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <Box sx={{ py: 6, bgcolor: '#f9f9f9' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.3rem',
                color: '#222',
                mb: 3,
              }}
            >
              What Students Say
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f5f5f5',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ddd',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#bbb',
                  },
                },
              }}
            >
              {reviews.map((review, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    minWidth: 300,
                    flexShrink: 0,
                    borderRadius: 2,
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  {/* User info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar
                      src={review.user?.img}
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: '#e8e8e8',
                        border: '1px solid #f0f0f0',
                        fontSize: '1.2rem',
                      }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: '#222',
                          fontSize: '0.85rem',
                          display: 'block',
                        }}
                      >
                        {review.user?.username || 'Student'}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" sx={{ mt: 0.25 }} />
                    </Box>
                  </Box>

                  {/* Review text */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
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
