
import React, { useState, createContext, useContext, useEffect } from "react";

// Utility function for combining class names
function cn(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Menu and X icons removed as mobile sidebar now uses InteractiveMenu

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <>
      <DesktopSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open, setOpen, animate } = useSidebar();
  const [currentWidth, setCurrentWidth] = useState("300px");

  useEffect(() => {
    if (animate) {
      setCurrentWidth(open ? "220px" : "60px");
    } else {
      setCurrentWidth("220px");
    }
  }, [open, animate]);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  return (
    <div
      className={cn(
        "h-full px-1 shadow-2xl py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 transition-all duration-300 ease-in-out",
        className
      )}
      style={{
        width: currentWidth,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};



export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { open, animate } = useSidebar();

  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md px-2 transition-colors duration-150",
        className
      )}
      {...props}
    >
      {link.icon}
      <span
        className={cn(
          "text-neutral-700 dark:text-neutral-200 text-sm transition-all duration-150 whitespace-pre",
          animate && !open ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
          "group-hover:translate-x-1"
        )}
        style={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
        }}
      >
        {link.label}
      </span>
    </a>
  );
};
