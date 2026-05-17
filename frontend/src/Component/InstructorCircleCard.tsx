import React from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface InstructorProps {
  instructor: {
    _id: string;
    username: string;
    img?: string;
    bio?: string;
    verified?: boolean;
  };
}

export default function InstructorCircleCard({ instructor }: InstructorProps) {
  const navigate = useNavigate();

  return (
    <Paper
      onClick={() => navigate(`/${instructor.username}`)}
      elevation={1}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 2,
        minWidth: 140,
        flexShrink: 0,
        borderRadius: 2,
        textAlign: 'center',
        backgroundColor: '#fff',
        border: '1px solid #f5f5f5',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={instructor.img}
          sx={{ width: 96, height: 96, bgcolor: '#e8e8e8', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
        />
        {instructor.verified && (
          <Box
            component="span"
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: '#2196f3',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
            }}
          >
            <svg style={{ width: 14, height: 14, color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Box>
        )}
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#222' }}>
        {instructor.username}
      </Typography>

      {instructor.bio && (
        <Typography variant="caption" sx={{ color: '#888', fontSize: '0.75rem' }}>
          {instructor.bio}
        </Typography>
      )}
    </Paper>
  );
}
