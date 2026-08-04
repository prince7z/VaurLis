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
        width: 280,
        minWidth: 280,
        maxWidth: 280,
        height: 345,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #eaeeef',
        bgcolor: '#ffffff',
        flexShrink: 0,
        '&:hover': {
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-4px)',
          borderColor: '#d0d7de',
        },
      }}
    >
      {/* Fixed aspect ratio banner image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 155,
          overflow: 'hidden',
          bgcolor: '#f1f5f9',
          flexShrink: 0,
        }}
      >
        <CardMedia
          component="img"
          image={course.img || 'https://via.placeholder.com/400x225?text=Course'}
          alt={course.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.04)',
            },
          }}
        />
        {course.institution && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              px: 1.2,
              py: 0.4,
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {course.institution}
          </Box>
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {/* Course Title */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: '0.925rem',
              lineHeight: 1.35,
              color: '#0f172a',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '2.7em',
            }}
          >
            {course.name}
          </Typography>

          {/* Instructor */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Avatar
              src={course.instructor?.img}
              alt={course.instructor?.username}
              sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#e2e8f0', color: '#475569' }}
            >
              {course.instructor?.username?.charAt(0)?.toUpperCase() || 'I'}
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {course.instructor?.username || 'Instructor'}
            </Typography>
          </Box>
        </Box>

        {/* Rating and Price */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: '1px solid #f1f5f9',
            mt: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating
              value={course.rating || 0}
              precision={0.5}
              readOnly
              size="small"
              sx={{ fontSize: '0.85rem', color: '#f59e0b' }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
              {(course.rating || 0).toFixed(1)}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: course.price === 0 ? '#16a34a' : '#2563eb',
              fontSize: '0.85rem',
              bgcolor: course.price === 0 ? '#f0fdf4' : '#eff6ff',
              px: 1.2,
              py: 0.3,
              borderRadius: '6px',
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
                pt: 1,
                pb: 1.5,
                px: 0.5,
                alignItems: 'stretch',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f5f5f5',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cbd5e1',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#94a3b8',
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
                pt: 1,
                pb: 1.5,
                px: 0.5,
                alignItems: 'stretch',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f5f5f5',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cbd5e1',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#94a3b8',
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
                gap: 2,
                overflowX: 'auto',
                pb: 1,
                alignItems: 'flex-start',
                WebkitOverflowScrolling: 'touch',
                '&::-webkit-scrollbar': {
                  height: '8px',
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
