
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar";
import { Routes, Route } from "react-router-dom";

import Footer from './Footer';
import { useRecoilValue } from "recoil";
import { userSelector } from "./atoms/atoms";
import MobileSidebarMenu from '../components/MobileSidebarMenu';

// Utility function for combining class names
function cn(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Simple SVG icons to replace lucide-react
const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

const UserCog = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="15" r="3"></circle>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="m13 6 3 3"></path>
    <path d="m9 17 3-3"></path>
    <path d="m15 11 3 3"></path>
  </svg>
);

const Blogs = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16v4H4z"></path>
    <path d="M4 10h16v4H4z"></path>
    <path d="M4 16h16v4H4z"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>

  </svg>
)

const Login = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);
const LogOut = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

// Define the links array
const links = [
  {
    label: "Courses",
    href: "/courses",
    icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Instructors",
    href: "/instructors",
    icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Blogs",
    href: "/blogs",
    icon: <Blogs className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  
];

interface pathElement {
  path?: string;
  element?: React.JSX.Element;
}

export default function SidebarDemo({ paths = [] }: { paths?: pathElement[] }) {
  const [open, setOpen] = useState(false);
  const user = useRecoilValue(userSelector);
  console.log("User in sidebar:", user);

  
  
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 overflow-hidden",
        "h-screen" // Full screen height// Minimum full screen height to allow content to extend
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 w-full md:w-auto">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              {user.username === "guest" ? (
                <SidebarLink 
                  link={{
                    label: "Login",
                    href: "/login",
                    icon: <Login className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 overflow-x-hidden" />,
                  }}
                />
              ) : (
                <div 
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.setItem("user", "guest");
                    window.location.reload();
                  }}
                  className="flex  items-center justify-start gap-2 group py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md px-2 transition-colors duration-150 cursor-pointer"
                >
                  <LogOut className="text-black h-5 w-5 flex-shrink-0" />
                  <span className="text-black text-sm transition-all duration-150 overflow-x-hidden whitespace-pre group-hover:translate-x-1">
                    Logout
                  </span>
                </div>
              )}
            </div>
          </div>
          <div>
            {user.username === "guest" ? (
                <SidebarLink
                  link={{
                    label: "Guest User",
                    href: "/login",
                    icon: (
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                        alt="Avatar"
                      />
                    )
                  }}
                />
            ) : (
                <SidebarLink
                  link={{
                    label: user.username,
                    href: `/${user.username}`,
                    icon: (
                      <img
                        src={user.img}
                        className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                        alt="Avatar"
                      />
                    ),
                  }}
                />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard paths={paths} />
      
      {/* Mobile Menu - Only visible on mobile screens */}
      <div className="md:hidden">
        <MobileSidebarMenu />
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <span className="font-medium text-black dark:text-white whitespace-pre opacity-100 transition-opacity duration-300">
        Vaurlis Educations
      </span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </a>
  );
};



// Dummy dashboard component with content
const Dashboard = ({ paths = [] }: { paths?: pathElement[] }) => {

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-4 pb-32 md:pb-4 min-h-full w-full">{/* Extra bottom padding on mobile for the menu and footer */}
          <Routes>
           
         {paths.map((path, idx) => (
      <Route key={path.path ?? idx} path={path.path} element={path.element} />
    ))}
          
          </Routes>
        </div>
        
        {/* Footer - positioned at bottom of content on mobile, always visible on desktop */}
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};