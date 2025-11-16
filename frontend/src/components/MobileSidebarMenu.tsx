import React from 'react';
import { useRecoilValue } from 'recoil';
import { userSelector } from '../Component/atoms/atoms';
import { InteractiveMenu, type InteractiveMenuItem } from './ui/modern-mobile-menu';
import { Home, Users } from 'lucide-react';

// Custom icons matching your current sidebar
const Dashboard = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

const Blogs = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16v4H4z"></path>
    <path d="M4 10h16v4H4z"></path>
    <path d="M4 16h16v4H4z"></path>
  </svg>
);

// Custom Profile Icon Component
const ProfileIcon = ({ className, user }: { className?: string; user: any }) => {
  if (user.username === 'guest') {
    return (
      <img
        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
        className={`${className} rounded-full object-cover`}
        alt="Guest Avatar"
        style={{ width: '20px', height: '20px' }}
      />
    );
  }
  return (
    <img
      src={user.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
      className={`${className} rounded-full object-cover`}
      alt="User Avatar"
      style={{ width: '20px', height: '20px' }}
    />
  );
};

const MobileSidebarMenu: React.FC = () => {
  const user = useRecoilValue(userSelector);

  const menuItems: InteractiveMenuItem[] = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Courses', icon: Dashboard, href: '/courses' },
    { label: 'Instructors', icon: Users, href: '/instructors' },
    { label: 'Blogs', icon: Blogs, href: '/blogs' },
    {
      label: 'Profile',
      icon: ({ className }: { className?: string }) => <ProfileIcon className={className} user={user} />,
      href: user.username === 'guest' ? '/login' : `/${user.username}`,
    },
  ];

  const handleItemClick = (item: InteractiveMenuItem) => {
    // Handle logout logic if it's the profile item and user is logged in
    if (item.label === 'Profile' && user.username !== 'guest') {
      // You can add logout logic here if needed
      // For now, it will just navigate to the profile
    }
  };

  return (
    <InteractiveMenu 
      items={menuItems} 
      onItemClick={(item) => handleItemClick(item)}
      accentColor="hsl(var(--primary))"
    />
  );
};

export default MobileSidebarMenu;