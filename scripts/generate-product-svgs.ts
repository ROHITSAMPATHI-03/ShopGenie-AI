import fs from 'fs';
import path from 'path';

const outDir = path.resolve('frontend/public/images/products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

interface ProductSvgMeta {
  file: string;
  category: string;
  name: string;
  brand: string;
  accent: string;
  bgGradient: [string, string];
}

const items: ProductSvgMeta[] = [
  // Laptops
  { file: 'laptop-thinkpad.svg', category: 'Laptop', name: 'ThinkPad E14', brand: 'Lenovo', accent: '#E11D48', bgGradient: ['#18181B', '#27272A'] },
  { file: 'laptop-swift.svg', category: 'Laptop', name: 'Swift Go 14', brand: 'Acer', accent: '#6155F5', bgGradient: ['#F1F5F9', '#E2E8F0'] },
  { file: 'laptop-ideapad.svg', category: 'Laptop', name: 'IdeaPad Slim 3', brand: 'Lenovo', accent: '#0284C7', bgGradient: ['#F8FAFC', '#E2E8F0'] },
  { file: 'laptop-vivobook.svg', category: 'Laptop', name: 'Vivobook 15', brand: 'ASUS', accent: '#4F46E5', bgGradient: ['#F1F5F9', '#CBD5E1'] },
  { file: 'laptop-pavilion.svg', category: 'Laptop', name: 'Pavilion 14', brand: 'HP', accent: '#0D9488', bgGradient: ['#F8FAFC', '#E2E8F0'] },
  { file: 'laptop-tuf.svg', category: 'Laptop', name: 'TUF Gaming F15', brand: 'ASUS', accent: '#F59E0B', bgGradient: ['#1E1B18', '#292524'] },
  { file: 'laptop-macbook.svg', category: 'Laptop', name: 'MacBook Air M2', brand: 'Apple', accent: '#64748B', bgGradient: ['#F8FAFC', '#E2E8F0'] },
  { file: 'laptop-inspiron.svg', category: 'Laptop', name: 'Inspiron 16 Plus', brand: 'Dell', accent: '#2563EB', bgGradient: ['#F1F5F9', '#CBD5E1'] },

  // Phones
  { file: 'phone-nord.svg', category: 'Phone', name: 'Nord CE4', brand: 'OnePlus', accent: '#10B981', bgGradient: ['#ECFDF5', '#D1FAE5'] },
  { file: 'phone-pixel.svg', category: 'Phone', name: 'Pixel 7a', brand: 'Google', accent: '#EA4335', bgGradient: ['#FEF2F2', '#FEE2E2'] },
  { file: 'phone-galaxy.svg', category: 'Phone', name: 'Galaxy S23 FE', brand: 'Samsung', accent: '#6366F1', bgGradient: ['#EEF2FF', '#E0E7FF'] },
  { file: 'phone-iqoo.svg', category: 'Phone', name: 'Neo 9 Pro', brand: 'iQOO', accent: '#DC2626', bgGradient: ['#1C1917', '#292524'] },
  { file: 'phone-redmi.svg', category: 'Phone', name: 'Note 13 5G', brand: 'Xiaomi', accent: '#F97316', bgGradient: ['#FFF7ED', '#FFEDD5'] },
  { file: 'phone-iphone.svg', category: 'Phone', name: 'iPhone 15', brand: 'Apple', accent: '#EC4899', bgGradient: ['#FDF2F8', '#FCE7F3'] },

  // Headphones
  { file: 'audio-sony.svg', category: 'Headphones', name: 'WH-1000XM4', brand: 'Sony', accent: '#B45309', bgGradient: ['#18181B', '#27272A'] },
  { file: 'audio-soundcore.svg', category: 'Headphones', name: 'Life Q30', brand: 'Soundcore', accent: '#06B6D4', bgGradient: ['#ECFEFF', '#CFFAFE'] },
  { file: 'audio-sennheiser.svg', category: 'Headphones', name: 'Accentum Plus', brand: 'Sennheiser', accent: '#0284C7', bgGradient: ['#F0F9FF', '#E0F2FE'] },
  { file: 'audio-jbl.svg', category: 'Headphones', name: 'Tune 770NC', brand: 'JBL', accent: '#EA580C', bgGradient: ['#FFF7ED', '#FFEDD5'] },
  { file: 'audio-ath.svg', category: 'Headphones', name: 'ATH-M50xBT2', brand: 'Audio-Technica', accent: '#475569', bgGradient: ['#1E293B', '#334155'] },
  { file: 'audio-boat.svg', category: 'Headphones', name: 'Rockerz 551ANC', brand: 'boAt', accent: '#E11D48', bgGradient: ['#FFF1F2', '#FFE4E6'] },

  // Keyboards
  { file: 'keyboard-mxkeys.svg', category: 'Keyboard', name: 'MX Keys S', brand: 'Logitech', accent: '#0D9488', bgGradient: ['#1E293B', '#334155'] },
  { file: 'keyboard-keychron.svg', category: 'Keyboard', name: 'Keychron K2', brand: 'Keychron', accent: '#F59E0B', bgGradient: ['#18181B', '#27272A'] },
  { file: 'keyboard-razer.svg', category: 'Keyboard', name: 'BlackWidow V4 X', brand: 'Razer', accent: '#22C55E', bgGradient: ['#09090B', '#18181B'] },
  { file: 'keyboard-k380.svg', category: 'Keyboard', name: 'K380 Wireless', brand: 'Logitech', accent: '#8B5CF6', bgGradient: ['#F5F3FF', '#EDE9FE'] },

  // Monitors
  { file: 'monitor-dell.svg', category: 'Monitor', name: 'S2722QC 4K', brand: 'Dell', accent: '#2563EB', bgGradient: ['#F8FAFC', '#E2E8F0'] },
  { file: 'monitor-lg.svg', category: 'Monitor', name: 'UltraGear 27GN800', brand: 'LG', accent: '#DC2626', bgGradient: ['#18181B', '#27272A'] },
  { file: 'monitor-benq.svg', category: 'Monitor', name: 'GW2780 Eye-Care', brand: 'BenQ', accent: '#4F46E5', bgGradient: ['#F8FAFC', '#E2E8F0'] },
  { file: 'monitor-proart.svg', category: 'Monitor', name: 'ProArt PA278CV', brand: 'ASUS', accent: '#D97706', bgGradient: ['#1E293B', '#334155'] },
];

function renderLaptopSilhouette(accent: string) {
  return `
    <g transform="translate(100, 70)">
      <!-- Display Lid -->
      <rect x="30" y="20" width="240" height="150" rx="8" fill="#1E293B" stroke="${accent}" stroke-width="2"/>
      <!-- Screen Area -->
      <rect x="40" y="30" width="220" height="130" rx="4" fill="#0F172A"/>
      <path d="M 50 140 L 90 95 L 140 135 L 180 85 L 240 140 Z" fill="${accent}" opacity="0.3"/>
      <!-- Keyboard Base -->
      <path d="M 10 174 L 290 174 L 305 200 L -5 200 Z" fill="#334155"/>
      <rect x="50" y="177" width="200" height="12" rx="2" fill="#1E293B" opacity="0.8"/>
      <rect x="120" y="191" width="60" height="6" rx="2" fill="#64748B" opacity="0.6"/>
    </g>
  `;
}

function renderPhoneSilhouette(accent: string) {
  return `
    <g transform="translate(145, 60)">
      <!-- Phone Body -->
      <rect x="25" y="15" width="160" height="230" rx="24" fill="#1E293B" stroke="${accent}" stroke-width="2"/>
      <!-- Screen -->
      <rect x="32" y="24" width="146" height="212" rx="18" fill="#0F172A"/>
      <!-- Camera Notch / Dynamic Island -->
      <rect x="85" y="32" width="40" height="10" rx="5" fill="#000000"/>
      <!-- Decorative UI lines -->
      <rect x="48" y="70" width="80" height="8" rx="4" fill="${accent}" opacity="0.8"/>
      <rect x="48" y="90" width="114" height="6" rx="3" fill="#64748B" opacity="0.5"/>
      <rect x="48" y="105" width="90" height="6" rx="3" fill="#64748B" opacity="0.3"/>
      <circle cx="105" cy="180" r="28" fill="${accent}" opacity="0.15"/>
      <circle cx="105" cy="180" r="16" fill="${accent}" opacity="0.4"/>
    </g>
  `;
}

function renderHeadphonesSilhouette(accent: string) {
  return `
    <g transform="translate(120, 55)">
      <!-- Headband Arc -->
      <path d="M 40 160 C 40 60, 220 60, 220 160" fill="none" stroke="#334155" stroke-width="14" stroke-linecap="round"/>
      <path d="M 50 145 C 50 75, 210 75, 210 145" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
      <!-- Left Ear Cup -->
      <g transform="translate(20, 140)">
        <rect x="0" y="0" width="36" height="70" rx="18" fill="#1E293B" stroke="${accent}" stroke-width="2"/>
        <rect x="8" y="10" width="20" height="50" rx="10" fill="#0F172A"/>
      </g>
      <!-- Right Ear Cup -->
      <g transform="translate(204, 140)">
        <rect x="0" y="0" width="36" height="70" rx="18" fill="#1E293B" stroke="${accent}" stroke-width="2"/>
        <rect x="8" y="10" width="20" height="50" rx="10" fill="#0F172A"/>
      </g>
    </g>
  `;
}

function renderKeyboardSilhouette(accent: string) {
  return `
    <g transform="translate(90, 85)">
      <!-- Board Base -->
      <rect x="10" y="25" width="320" height="150" rx="12" fill="#1E293B" stroke="${accent}" stroke-width="2"/>
      <rect x="20" y="35" width="300" height="130" rx="8" fill="#0F172A"/>
      <!-- Key Matrix Simulation -->
      <g fill="#334155">
        <rect x="30" y="45" width="20" height="18" rx="3"/><rect x="55" y="45" width="20" height="18" rx="3"/><rect x="80" y="45" width="20" height="18" rx="3"/><rect x="105" y="45" width="20" height="18" rx="3"/><rect x="130" y="45" width="20" height="18" rx="3"/><rect x="155" y="45" width="20" height="18" rx="3"/><rect x="180" y="45" width="20" height="18" rx="3"/><rect x="205" y="45" width="20" height="18" rx="3"/><rect x="230" y="45" width="20" height="18" rx="3"/><rect x="255" y="45" width="55" height="18" rx="3" fill="${accent}" opacity="0.8"/>
        
        <rect x="30" y="70" width="28" height="18" rx="3"/><rect x="63" y="70" width="20" height="18" rx="3"/><rect x="88" y="70" width="20" height="18" rx="3"/><rect x="113" y="70" width="20" height="18" rx="3"/><rect x="138" y="70" width="20" height="18" rx="3"/><rect x="163" y="70" width="20" height="18" rx="3"/><rect x="188" y="70" width="20" height="18" rx="3"/><rect x="213" y="70" width="20" height="18" rx="3"/><rect x="238" y="70" width="20" height="18" rx="3"/><rect x="263" y="70" width="47" height="18" rx="3"/>
        
        <rect x="30" y="95" width="36" height="18" rx="3"/><rect x="71" y="95" width="20" height="18" rx="3"/><rect x="96" y="95" width="20" height="18" rx="3"/><rect x="121" y="95" width="20" height="18" rx="3"/><rect x="146" y="95" width="20" height="18" rx="3"/><rect x="171" y="95" width="20" height="18" rx="3"/><rect x="196" y="95" width="20" height="18" rx="3"/><rect x="221" y="95" width="20" height="18" rx="3"/><rect x="246" y="95" width="64" height="18" rx="3" fill="${accent}" opacity="0.6"/>
        
        <!-- Spacebar Row -->
        <rect x="30" y="120" width="30" height="18" rx="3"/><rect x="65" y="120" width="25" height="18" rx="3"/><rect x="95" y="120" width="130" height="18" rx="3" fill="${accent}" opacity="0.9"/><rect x="230" y="120" width="35" height="18" rx="3"/><rect x="270" y="120" width="40" height="18" rx="3"/>
      </g>
    </g>
  `;
}

function renderMonitorSilhouette(accent: string) {
  return `
    <g transform="translate(100, 50)">
      <!-- Panel Border -->
      <rect x="20" y="20" width="260" height="160" rx="8" fill="#1E293B" stroke="${accent}" stroke-width="2"/>
      <!-- Active Screen -->
      <rect x="28" y="28" width="244" height="144" rx="4" fill="#0F172A"/>
      <!-- Graphic Display Element -->
      <circle cx="150" cy="100" r="40" fill="${accent}" opacity="0.15"/>
      <path d="M 40 140 L 100 110 L 150 125 L 200 80 L 260 135" fill="none" stroke="${accent}" stroke-width="3"/>
      <!-- Stand Neck -->
      <rect x="142" y="180" width="16" height="45" fill="#475569"/>
      <!-- Stand Base -->
      <ellipse cx="150" cy="228" rx="60" ry="12" fill="#334155"/>
    </g>
  `;
}

for (const item of items) {
  let silhouette = '';
  switch (item.category) {
    case 'Laptop': silhouette = renderLaptopSilhouette(item.accent); break;
    case 'Phone': silhouette = renderPhoneSilhouette(item.accent); break;
    case 'Headphones': silhouette = renderHeadphonesSilhouette(item.accent); break;
    case 'Keyboard': silhouette = renderKeyboardSilhouette(item.accent); break;
    case 'Monitor': silhouette = renderMonitorSilhouette(item.accent); break;
  }

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 340" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.bgGradient[0]}" />
      <stop offset="100%" stop-color="${item.bgGradient[1]}" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="500" height="340" rx="16" fill="url(#bgGrad)" />

  <!-- Subtle Blueprint Tech Grid -->
  <g opacity="0.06" stroke="#94A3B8" stroke-width="1">
    <line x1="0" y1="68" x2="500" y2="68" />
    <line x1="0" y1="136" x2="500" y2="136" />
    <line x1="0" y1="204" x2="500" y2="204" />
    <line x1="0" y1="272" x2="500" y2="272" />
    <line x1="100" y1="0" x2="100" y2="340" />
    <line x1="200" y1="0" x2="200" y2="340" />
    <line x1="300" y1="0" x2="300" y2="340" />
    <line x1="400" y1="0" x2="400" y2="340" />
  </g>

  <!-- Brand & Category Badge Header -->
  <g transform="translate(32, 36)">
    <rect x="0" y="0" width="84" height="24" rx="6" fill="#FFFFFF" fill-opacity="0.9" />
    <text x="42" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="#0F172A" text-anchor="middle" letter-spacing="0.5">${item.brand.toUpperCase()}</text>
  </g>

  <g transform="translate(468, 36)">
    <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="end">${item.category}</text>
  </g>

  <!-- Render Product Silhouette -->
  ${silhouette}

  <!-- Lower Product Label -->
  <g transform="translate(32, 308)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="#334155" opacity="0.95">${item.name}</text>
  </g>

  <!-- Accent Geometry Indicator -->
  <circle cx="456" cy="304" r="5" fill="${item.accent}" />
</svg>`;

  fs.writeFileSync(path.join(outDir, item.file), svgContent.trim());
}

console.log(`Generated ${items.length} premium product SVGs in ${outDir}`);

