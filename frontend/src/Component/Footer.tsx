import { GitHub } from '@mui/icons-material';
import { Facebook, Twitter, Instagram, Youtube, Maximize2, RotateCw, Linkedin } from 'lucide-react';

// Pinterest icon component since it's not available in lucide-react
function PinterestIcon({ size = 28 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white px-8 py-12 rounded-sm relative">
      {/* Header with React text */}
  

      {/* Social Media Icons */}
      <div className="flex justify-center gap-8 mb-8">
       
        
        <a
          href="https://www.linkedin.com/in/princesahu7z/"
          className="text-white hover:text-gray-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin size={28} />
        </a>
        <a
          href="https://github.com/prince7z/"
          className="text-white hover:text-gray-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHub fontSize="large" />
        </a>
        <a
          href="https://x.com/PrinceSahu69495"
          className="text-white hover:text-gray-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter size={28} />
        </a>
      </div>

    {/* Educational Concept Text */}
    <div className="max-w-4xl mx-auto text-center mb-12">
        <p className="text-gray-400 text-sm leading-relaxed">
            Vaurlis is dedicated to providing high-quality educational resources and interactive learning experiences for students and lifelong learners. Since its inception, Vaurlis has grown to become a trusted platform for accessible and engaging education.
        </p>
    </div>

    {/* Vaurlis Logo */}
      <div className="text-center mb-6">
        <div className="inline-block">
          <span className="text-5xl italic tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>VaurLis</span>
        </div>
      </div>

      {/* Region and Currency */}
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm">India | ₹</p>
      </div>

      {/* Action Buttons - positioned on the right */}
      <div className="absolute right-8 bottom-12 flex flex-col gap-4">
        <button className="bg-gray-600 hover:bg-gray-500 rounded-full p-4 transition-colors">
          <Maximize2 size={20} className="text-white" />
        </button>
        <button className="bg-gray-600 hover:bg-gray-500 rounded-full p-4 transition-colors">
          <RotateCw size={20} className="text-white" />
        </button>
      </div>
    </footer>
  );
}
