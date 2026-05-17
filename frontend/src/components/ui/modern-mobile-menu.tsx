import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Home, User, Users } from 'lucide-react';

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  href?: string;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  onItemClick?: (item: InteractiveMenuItem) => void;
}

// Dashboard icon component
const Dashboard = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

// Blogs icon component
const Blogs = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16v4H4z"></path>
    <path d="M4 10h16v4H4z"></path>
    <path d="M4 16h16v4H4z"></path>
  </svg>
);

const defaultItems: InteractiveMenuItem[] = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Courses', icon: Dashboard, href: '/courses' },
  { label: 'Instructors', icon: Users, href: '/instructors' },
  { label: 'Blogs', icon: Blogs, href: '/blogs' },
  { label: 'Profile', icon: User, href: '/login' },
];

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ 
  items, 
  accentColor, 
  onItemClick 
}) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(-1); // Start with no active item

  useEffect(() => {
    // Set active index based on current URL
    const currentPath = window.location.pathname;
    const matchingIndex = finalItems.findIndex(item => item.href === currentPath);
    if (matchingIndex !== -1) {
      setActiveIndex(matchingIndex);
    }
  }, [finalItems]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndex, finalItems]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    if (onItemClick) {
      onItemClick(finalItems[index]);
    }
    
    // Navigate to href if provided
    const item = finalItems[index];
    if (item.href) {
      // Use a small delay to show the active state before navigation
      setTimeout(() => {
        window.location.href = item.href!;
      }, 100);
    }
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav
      className="menu"
      role="navigation"
      style={navStyle}
    >
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex;
        const isTextActive = isActive;

        const IconComponent = item.icon;

        return (
          <button
            key={item.label}
            className={`menu__item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
            ref={(el) => { itemRefs.current[index] = el; }}
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isTextActive ? 'active' : ''}`}
              ref={(el) => { textRefs.current[index] = el; }}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };