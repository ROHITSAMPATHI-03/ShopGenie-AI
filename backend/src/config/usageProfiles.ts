export type Category = 'laptops' | 'phones' | 'headphones' | 'keyboards' | 'monitors';

export type UsageProfileKey = 'student' | 'programmer' | 'gamer' | 'video_editor' | 'everyday';

export interface SpecRequirement {
  field: string;
  min?: number;
  max?: number;
  expected?: string | boolean | string[];
  weight: number; // importance within usage fit (0..1)
  description: string;
}

export interface UsageProfile {
  name: string;
  description: string;
  categoryRules: Partial<Record<Category, SpecRequirement[]>>;
}

export const USAGE_PROFILES: Record<UsageProfileKey, UsageProfile> = {
  student: {
    name: 'College Student / Academic',
    description: 'Balanced portability, battery longevity, and solid value for coursework, note-taking, and research.',
    categoryRules: {
      laptops: [
        { field: 'battery_hours', min: 8, weight: 0.35, description: 'All-day battery life for campus use (8+ hrs)' },
        { field: 'ram_gb', min: 8, weight: 0.25, description: 'At least 8GB RAM for multitasking' },
        { field: 'weight_kg', max: 1.8, weight: 0.20, description: 'Lightweight portability (<1.8kg)' },
        { field: 'storage_gb', min: 256, weight: 0.20, description: 'Sufficient fast SSD storage (256GB+)' },
      ],
      phones: [
        { field: 'battery_mah', min: 4500, weight: 0.40, description: 'High battery capacity (4500mAh+)' },
        { field: 'fast_charging_w', min: 25, weight: 0.30, description: 'Fast charging support' },
        { field: 'ram_gb', min: 6, weight: 0.30, description: 'Snappy performance (6GB+ RAM)' },
      ],
      headphones: [
        { field: 'battery_hours', min: 24, weight: 0.40, description: 'Long battery life for studying' },
        { field: 'anc', expected: true, weight: 0.40, description: 'Active Noise Cancellation for library focus' },
        { field: 'comfort_score', min: 4.0, weight: 0.20, description: 'Long-session comfort' },
      ],
      keyboards: [
        { field: 'wireless', expected: true, weight: 0.50, description: 'Wireless connectivity for flexible desk setup' },
        { field: 'quiet_typing', expected: true, weight: 0.50, description: 'Quiet switches for dorm or library use' },
      ],
      monitors: [
        { field: 'eye_care', expected: true, weight: 0.50, description: 'Flicker-free / Low Blue Light for long study sessions' },
        { field: 'screen_size_inch', min: 24, weight: 0.50, description: 'At least 24" comfortable reading canvas' },
      ],
    },
  },

  programmer: {
    name: 'Software Engineer / Developer',
    description: 'High memory capacity, fast multi-core CPU, high-resolution screens, and ergonomic input devices.',
    categoryRules: {
      laptops: [
        { field: 'ram_gb', min: 16, weight: 0.40, description: 'At least 16GB RAM for containers, IDEs, and local servers' },
        { field: 'storage_gb', min: 512, weight: 0.25, description: 'High-speed 512GB+ SSD for large toolchains' },
        { field: 'battery_hours', min: 8, weight: 0.20, description: 'Reliable mobile battery life (8+ hrs)' },
        { field: 'cpu_cores', min: 8, weight: 0.15, description: 'Multi-core modern CPU for compilation' },
      ],
      phones: [
        { field: 'ram_gb', min: 8, weight: 0.40, description: 'At least 8GB RAM for emulation and multitasking' },
        { field: 'refresh_rate_hz', min: 90, weight: 0.30, description: 'Smooth 90Hz+ display for testing' },
        { field: 'storage_gb', min: 128, weight: 0.30, description: '128GB+ storage' },
      ],
      headphones: [
        { field: 'anc', expected: true, weight: 0.50, description: 'Strong ANC for uninterrupted coding flow' },
        { field: 'multipoint', expected: true, weight: 0.30, description: 'Multipoint Bluetooth for Mac/PC and phone pairing' },
        { field: 'battery_hours', min: 20, weight: 0.20, description: '20+ hours of continuous listening' },
      ],
      keyboards: [
        { field: 'mechanical', expected: true, weight: 0.40, description: 'Tactile mechanical switches for precise typing' },
        { field: 'layout', expected: ['75%', 'TKL', 'Tenkeyless', 'Compact', 'Full-size'], weight: 0.30, description: 'Developer-friendly layout' },
        { field: 'wireless', expected: true, weight: 0.30, description: 'Clean desk wireless or multi-device Bluetooth' },
      ],
      monitors: [
        { field: 'resolution', expected: ['4K UHD', 'QHD 1440p', '1440p', '4K'], weight: 0.40, description: 'High pixel density (1440p/4K) for sharp code text' },
        { field: 'screen_size_inch', min: 27, weight: 0.30, description: 'Spacious 27"+ screen area for side-by-side files' },
        { field: 'usb_c_hub', expected: true, weight: 0.30, description: 'USB-C Power Delivery / hub connectivity' },
      ],
    },
  },

  gamer: {
    name: 'Gaming & High-Performance Enthusiast',
    description: 'High refresh rate displays, dedicated graphics, low latency inputs, and high thermal capacity.',
    categoryRules: {
      laptops: [
        { field: 'gpu_tier', expected: ['dedicated', 'rtx4050', 'rtx4060', 'rtx4070', 'rtx3050'], weight: 0.45, description: 'Dedicated discrete GPU' },
        { field: 'refresh_rate_hz', min: 120, weight: 0.30, description: 'High refresh 120Hz+ screen' },
        { field: 'ram_gb', min: 16, weight: 0.25, description: '16GB+ RAM for AAA gaming titles' },
      ],
      phones: [
        { field: 'refresh_rate_hz', min: 120, weight: 0.40, description: '120Hz+ AMOLED display' },
        { field: 'chipset_tier', expected: ['flagship', 'high-tier', 'gaming'], weight: 0.35, description: 'Flagship gaming SoC' },
        { field: 'battery_mah', min: 5000, weight: 0.25, description: 'Large 5000mAh battery for extended sessions' },
      ],
      headphones: [
        { field: 'low_latency', expected: true, weight: 0.45, description: 'Low-latency audio connection' },
        { field: 'spatial_audio', expected: true, weight: 0.35, description: 'Directional 3D / Spatial audio for situational awareness' },
        { field: 'mic_quality', min: 4.0, weight: 0.20, description: 'Clear voice comms microphone' },
      ],
      keyboards: [
        { field: 'mechanical', expected: true, weight: 0.40, description: 'Fast linear or tactile mechanical switches' },
        { field: 'polling_rate_hz', min: 1000, weight: 0.35, description: '1000Hz+ ultra-fast polling rate' },
        { field: 'rgb_backlight', expected: true, weight: 0.25, description: 'Per-key customizable backlighting' },
      ],
      monitors: [
        { field: 'refresh_rate_hz', min: 144, weight: 0.45, description: 'High refresh rate (144Hz - 240Hz)' },
        { field: 'response_time_ms', max: 1, weight: 0.35, description: 'Ultra-fast 1ms response time' },
        { field: 'adaptive_sync', expected: true, weight: 0.20, description: 'G-Sync / FreeSync VRR support' },
      ],
    },
  },

  video_editor: {
    name: 'Content Creator / Video Editor',
    description: 'Color-accurate panels, high RAM and GPU acceleration, expansive fast NVMe storage.',
    categoryRules: {
      laptops: [
        { field: 'ram_gb', min: 16, weight: 0.35, description: '16GB - 32GB RAM for timeline scrubbing and rendering' },
        { field: 'color_gamut', expected: ['100% sRGB', '100% DCI-P3', 'OLED', 'Retina'], weight: 0.30, description: 'High color accuracy gamut' },
        { field: 'storage_gb', min: 512, weight: 0.20, description: '512GB+ fast NVMe storage' },
        { field: 'cpu_cores', min: 8, weight: 0.15, description: 'Multi-core processing power' },
      ],
      phones: [
        { field: 'camera_mp', min: 50, weight: 0.40, description: 'High-end 50MP+ sensor with 4K60 video' },
        { field: 'ois', expected: true, weight: 0.30, description: 'Optical Image Stabilization for smooth footage' },
        { field: 'storage_gb', min: 256, weight: 0.30, description: '256GB+ storage for video files' },
      ],
      headphones: [
        { field: 'sound_profile', expected: ['flat', 'neutral', 'reference', 'balanced'], weight: 0.50, description: 'Neutral reference studio tuning' },
        { field: 'comfort_score', min: 4.2, weight: 0.30, description: 'All-day editing comfort' },
        { field: 'wired_option', expected: true, weight: 0.20, description: 'Zero-latency wired monitoring jack' },
      ],
      keyboards: [
        { field: 'numpad_or_macro', expected: true, weight: 0.50, description: 'Numpad or programmable dial/macro keys for editing' },
        { field: 'quiet_typing', expected: true, weight: 0.50, description: 'Quiet tactile feedback' },
      ],
      monitors: [
        { field: 'color_accuracy', expected: ['100% sRGB', '99% DCI-P3', 'Delta E < 2', 'Calibrated'], weight: 0.45, description: 'Factory-calibrated color accuracy (sRGB/DCI-P3)' },
        { field: 'resolution', expected: ['4K UHD', '4K', '5K'], weight: 0.35, description: 'Crisp 4K resolution' },
        { field: 'screen_size_inch', min: 27, weight: 0.20, description: '27"+ wide timeline real estate' },
      ],
    },
  },

  everyday: {
    name: 'Everyday / Casual User',
    description: 'High reliability, simple usability, attractive design, and great price-to-performance ratio.',
    categoryRules: {
      laptops: [
        { field: 'battery_hours', min: 7, weight: 0.35, description: 'Dependable battery life (7+ hrs)' },
        { field: 'ram_gb', min: 8, weight: 0.35, description: 'Smooth 8GB - 16GB memory' },
        { field: 'storage_gb', min: 256, weight: 0.30, description: '256GB+ SSD' },
      ],
      phones: [
        { field: 'battery_mah', min: 4500, weight: 0.40, description: 'Day-long battery' },
        { field: 'camera_quality', min: 4.0, weight: 0.30, description: 'Crisp social media camera' },
        { field: 'screen_size_inch', min: 6.1, weight: 0.30, description: 'Comfortable hand-held display' },
      ],
      headphones: [
        { field: 'comfort_score', min: 4.0, weight: 0.40, description: 'Comfortable lightweight fit' },
        { field: 'battery_hours', min: 20, weight: 0.35, description: '20+ hours battery life' },
        { field: 'anc', expected: true, weight: 0.25, description: 'Noise isolation/cancellation' },
      ],
      keyboards: [
        { field: 'wireless', expected: true, weight: 0.50, description: 'Simple plug-and-play wireless' },
        { field: 'quiet_typing', expected: true, weight: 0.50, description: 'Smooth quiet keys' },
      ],
      monitors: [
        { field: 'screen_size_inch', min: 24, weight: 0.50, description: 'Clear 24" - 27" display' },
        { field: 'eye_care', expected: true, weight: 0.50, description: 'Anti-glare eye-care panel' },
      ],
    },
  },
};

