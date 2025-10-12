export function ChatBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
      {/* Rich repeating pattern of astrology symbols */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="chat-pattern" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
            {/* Large Stars */}
            <path d="M40,25 L43,35 L53,35 L45,42 L48,52 L40,45 L32,52 L35,42 L27,35 L37,35 Z" fill="currentColor" opacity="0.8" />
            <path d="M150,70 L153,80 L163,80 L155,87 L158,97 L150,90 L142,97 L145,87 L137,80 L147,80 Z" fill="currentColor" opacity="0.8" />
            
            {/* Small Stars */}
            <path d="M90,15 L91,18 L94,18 L92,20 L93,23 L90,21 L87,23 L88,20 L86,18 L89,18 Z" fill="currentColor" opacity="0.6" />
            <path d="M165,130 L166,133 L169,133 L167,135 L168,138 L165,136 L162,138 L163,135 L161,133 L164,133 Z" fill="currentColor" opacity="0.6" />
            
            {/* Crescent Moons */}
            <path d="M75,45 Q82,52 75,59 Q90,56 90,45 Q90,34 75,31 Q82,38 75,45 Z" fill="currentColor" opacity="0.7" />
            <path d="M130,135 Q137,142 130,149 Q145,146 145,135 Q145,124 130,121 Q137,128 130,135 Z" fill="currentColor" opacity="0.7" />
            <path d="M25,95 Q30,100 25,105 Q36,103 36,95 Q36,87 25,85 Q30,90 25,95 Z" fill="currentColor" opacity="0.5" />
            
            {/* Zodiac Circles & Rings */}
            <circle cx="115" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="55" cy="115" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="170,155" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            
            {/* Tiny filled circles (stars) */}
            <circle cx="20" cy="60" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="95" cy="100" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="140" cy="50" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="175" cy="115" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="65" cy="170" r="2" fill="currentColor" opacity="0.6" />
            <circle cx="120" cy="160" r="2" fill="currentColor" opacity="0.6" />
            <circle cx="10" cy="130" r="2" fill="currentColor" opacity="0.6" />
            <circle cx="160" cy="35" r="2" fill="currentColor" opacity="0.6" />
            
            {/* Om symbols (ॐ) */}
            <text x="100" y="165" fontSize="24" fill="currentColor" fontFamily="serif" opacity="0.7">ॐ</text>
            <text x="15" y="145" fontSize="20" fill="currentColor" fontFamily="serif" opacity="0.6">ॐ</text>
            <text x="155" y="20" fontSize="18" fill="currentColor" fontFamily="serif" opacity="0.5">ॐ</text>
            
            {/* Sparkles / Twinkles */}
            <path d="M165,15 L167,20 L172,20 L168,24 L170,29 L165,25 L160,29 L162,24 L158,20 L163,20 Z" fill="currentColor" opacity="0.6" />
            <path d="M45,160 L47,165 L52,165 L48,169 L50,174 L45,170 L40,174 L42,169 L38,165 L43,165 Z" fill="currentColor" opacity="0.6" />
            <path d="M10,20 L11,23 L14,23 L12,25 L13,28 L10,26 L7,28 L8,25 L6,23 L9,23 Z" fill="currentColor" opacity="0.5" />
            
            {/* Lotus petals (more) */}
            <ellipse cx="125" cy="105" rx="8" ry="4" fill="currentColor" opacity="0.5" transform="rotate(45 125 105)" />
            <ellipse cx="125" cy="105" rx="8" ry="4" fill="currentColor" opacity="0.5" transform="rotate(-45 125 105)" />
            <ellipse cx="68" cy="80" rx="7" ry="3.5" fill="currentColor" opacity="0.5" transform="rotate(30 68 80)" />
            <ellipse cx="68" cy="80" rx="7" ry="3.5" fill="currentColor" opacity="0.5" transform="rotate(-30 68 80)" />
            
            {/* Constellation lines */}
            <line x1="40" y1="25" x2="53" y2="35" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <line x1="90" y1="15" x2="94" y2="18" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <line x1="150" y1="70" x2="163" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            
            {/* Mandala-like circles */}
            <circle cx="35" cy="165" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <circle cx="35" cy="165" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
            <circle cx="180" cy="90" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <circle cx="180" cy="90" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
            
            {/* Sun rays (simplified) */}
            <g opacity="0.5">
              <line x1="15" y1="30" x2="20" y2="35" stroke="currentColor" strokeWidth="1.5" />
              <line x1="15" y1="40" x2="20" y2="35" stroke="currentColor" strokeWidth="1.5" />
              <line x1="25" y1="35" x2="20" y2="35" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="35" x2="15" y2="35" stroke="currentColor" strokeWidth="1.5" />
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#chat-pattern)" className="text-foreground" />
      </svg>
    </div>
  );
}
