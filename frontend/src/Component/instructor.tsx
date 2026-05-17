
import { useNavigate } from 'react-router-dom';

interface Instructor {
  id: string;
  username: string;
  bio: string;
  img: string;
  verified?: boolean;
}

export default function Instructor(user: Instructor) {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate(`/${user.username}`);
  };

  return (
    <div 
      className="flex items-center my-4 mx-2 p-4 bg-white hover:bg-gray-50 border-b border-gray-200 cursor-pointer transition-colors duration-200"
      onClick={handleUserClick}
    >
      {/* Profile Image */}
      <div className="flex-shrink-0 mr-4">
        <img
          src={user.img || '/default-avatar.png'}
          alt={user.username}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
      </div>
      
      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {user.username}
          </h3>
          {user.verified && (
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
    
        
        <p className="text-sm text-gray-700 line-clamp-2">
          {user.bio}
        </p>
      </div>
      
      {/* Arrow Icon */}
      <div className="flex-shrink-0 ml-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}