import {
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Carousel from 'react-material-ui-carousel';

export default function HomePage() {
  // Dummy data
  const featuredCourses = [
    {
      id: 1,
      title: 'React Basics',
      image: 'https://via.placeholder.com/300x200?text=React',
      students: 1250,
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      image: 'https://via.placeholder.com/300x200?text=JavaScript',
      students: 980,
    },
    {
      id: 3,
      title: 'Web Design Mastery',
      image: 'https://via.placeholder.com/300x200?text=Design',
      students: 750,
    },
  ];

  const topInstructors = [
    { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/100?text=JD', students: '5.2K' },
    { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/100?text=JS', students: '4.8K' },
    { id: 3, name: 'Mike Johnson', avatar: 'https://via.placeholder.com/100?text=MJ', students: '4.1K' },
  ];

  const liveClasses = [
    {
      id: 1,
      title: 'Live Coding Session',
      instructor: 'John Doe',
      time: '2:00 PM - 3:30 PM',
      image: 'https://via.placeholder.com/400x200?text=Live+Class+1',
    },
  ];

  const certifications = [
    {
      id: 1,
      title: 'Web Development Certificate',
      image: 'https://via.placeholder.com/300x200?text=Certificate',
    },
  ];

  const reviews = [
    {
      id: 1,
      name: 'Alex Chen',
      rating: 5,
      comment: 'Excellent course! Very comprehensive and well-taught.',
      avatar: 'https://via.placeholder.com/80?text=AC',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      rating: 5,
      comment: 'Great learning experience with hands-on projects.',
      avatar: 'https://via.placeholder.com/80?text=SW',
    },
    {
      id: 3,
      name: 'Michael Brown',
      rating: 4,
      comment: 'Very informative and engaging instructors.',
      avatar: 'https://via.placeholder.com/80?text=MB',
    },
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I enroll in a course?',
      answer: 'Click on any course and follow the enrollment steps. You can pay via credit card or other payment methods.',
    },
    {
      id: 2,
      question: 'Can I download course materials?',
      answer: 'Yes, you can download all lecture slides and resources for offline access.',
    },
    {
      id: 3,
      question: 'Do you offer certificates?',
      answer: 'Yes, upon completion of any course, you will receive a certificate of completion.',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Hero/Featured Section */}
      <Box sx={{ bgcolor: '#ffffff', py: 6 }}>
        <Container maxWidth="lg">
          <Carousel
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Box
              component="img"
              src="https://via.placeholder.com/1200x400?text=Featured+Course+1"
              sx={{ width: '100%', height: 400, objectFit: 'cover' }}
            />
            <Box
              component="img"
              src="https://via.placeholder.com/1200x400?text=Featured+Course+2"
              sx={{ width: '100%', height: 400, objectFit: 'cover' }}
            />
            <Box
              component="img"
              src="https://via.placeholder.com/1200x400?text=Featured+Course+3"
              sx={{ width: '100%', height: 400, objectFit: 'cover' }}
            />
          </Carousel>
        </Container>
      </Box>

      {/* Featured Courses */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>
            Featured
          </Typography>
          <Button variant="text" sx={{ color: '#666' }}>
            View All
          </Button>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {featuredCourses.map((course) => (
            <Box key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={course.image}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 1 }}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    {course.students.toLocaleString()} students
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Top Instructors */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 4 }}>
          Top Instructors
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            justifyItems: 'center',
          }}
        >
          {topInstructors.map((instructor) => (
            <Box key={instructor.id} sx={{ width: '100%' }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Avatar
                  src={instructor.avatar}
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: '#e0e0e0',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 1 }}>
                  {instructor.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  {instructor.students} students
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Live Classes */}
      <Box sx={{ bgcolor: '#ffffff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 4 }}>
            Live Classes
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            }}
          >
            {liveClasses.map((liveClass) => (
              <Box key={liveClass.id}>
                <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <CardMedia
                    component="img"
                    height="250"
                    image={liveClass.image}
                    alt={liveClass.title}
                  />
                  <CardContent>
                    <Chip label="LIVE" sx={{ bgcolor: '#000', color: '#fff', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 1 }}>
                      {liveClass.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      Instructor: {liveClass.instructor}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {liveClass.time}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Certifications */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 4 }}>
          Certifications
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          }}
        >
          {certifications.map((cert) => (
            <Box key={cert.id}>
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={cert.image}
                  alt={cert.title}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                    {cert.title}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* User Reviews */}
      <Box sx={{ bgcolor: '#ffffff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 4 }}>
            What Users Say
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            {reviews.map((review) => (
              <Box key={review.id}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: '#f9f9f9',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <Avatar
                    src={review.avatar}
                    sx={{
                      width: 70,
                      height: 70,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: '#e0e0e0',
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 1 }}>
                    {review.name}
                  </Typography>
                  <Rating value={review.rating} readOnly sx={{ mb: 2, justifyContent: 'center', display: 'flex' }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    "{review.comment}"
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', mb: 4 }}>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              sx={{
                mb: 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: '#f5f5f5',
                  '&.Mui-expanded': { bgcolor: '#eeeeee' },
                }}
              >
                <Typography sx={{ fontWeight: 600, color: '#000' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: '#ffffff', color: '#666' }}>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>


    </Box>
  );
}