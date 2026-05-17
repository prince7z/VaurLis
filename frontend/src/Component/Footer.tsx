import { GitHub } from '@mui/icons-material';
import { Twitter, Maximize2, RotateCw, Linkedin } from 'lucide-react';


export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white px-8 py-6 md:py-12 relative z-10 shadow-2xl mb-16 md:mb-0">
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
