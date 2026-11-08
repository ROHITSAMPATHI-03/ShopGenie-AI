import { getDatabase, closeDatabase, ISqliteDatabase } from './db.js';

export interface SeedProduct {
  id: string;
  name: string;
  category: 'laptops' | 'phones' | 'headphones' | 'keyboards' | 'monitors';
  brand: string;
  price_inr_paise: number;
  rating: number;
  description: string;
  image_url: string;
  specs: Record<string, any>;
  stock: number;
}

export const PRODUCTS_CATALOGUE: SeedProduct[] = [
  // ================= LAPTOPS (8) =================
  {
    id: 'LAP-001',
    name: 'Lenovo ThinkPad E14 Gen 5',
    category: 'laptops',
    brand: 'Lenovo',
    price_inr_paise: 4999000, // ₹49,990
    rating: 4.6,
    description: 'Durable business laptop featuring legendary ThinkPad keyboard ergonomics, 16GB RAM, and 12-hour battery life engineered for coding and academics.',
    image_url: '/images/products/laptop-thinkpad.svg',
    specs: {
      ram_gb: 16,
      storage_gb: 512,
      battery_hours: 12,
      cpu: 'AMD Ryzen 5 7530U (6C/12T)',
      cpu_cores: 6,
      screen_size_inch: 14.0,
      resolution: 'FHD 1920x1080 IPS Anti-Glare',
      weight_kg: 1.41,
      os: 'Windows 11 Home',
      gpu_tier: 'integrated',
      color_gamut: '45% NTSC',
      ports: 'USB-C, USB-A 3.2, HDMI 1.4b, RJ45 Ethernet, Audio Jack'
    },
    stock: 15
  },
  {
    id: 'LAP-002',
    name: 'Acer Swift Go 14',
    category: 'laptops',
    brand: 'Acer',
    price_inr_paise: 4899000, // ₹48,990
    rating: 4.5,
    description: 'Ultra-thin, featherlight 1.25kg aluminum laptop with vibrant 100% sRGB display, 16GB LPDDR5 RAM, and rapid dual-fan cooling.',
    image_url: '/images/products/laptop-swift.svg',
    specs: {
      ram_gb: 16,
      storage_gb: 512,
      battery_hours: 10.5,
      cpu: 'Intel Core i5-1335U (10C/12T)',
      cpu_cores: 10,
      screen_size_inch: 14.0,
      resolution: 'FHD+ 1920x1200 16:10 IPS',
      weight_kg: 1.25,
      os: 'Windows 11 Home',
      gpu_tier: 'integrated',
      color_gamut: '100% sRGB',
      ports: 'Dual Thunderbolt 4 / USB-C, Dual USB-A 3.2, HDMI 2.1'
    },
    stock: 12
  },
  {
    id: 'LAP-003',
    name: 'Lenovo IdeaPad Slim 3',
    category: 'laptops',
    brand: 'Lenovo',
    price_inr_paise: 4499000, // ₹44,990
    rating: 4.4,
    description: 'High-value modern laptop with 16GB memory, AMD Ryzen performance, and a full numeric keypad tailored for student budgets.',
    image_url: '/images/products/laptop-ideapad.svg',
    specs: {
      ram_gb: 16,
      storage_gb: 512,
      battery_hours: 11,
      cpu: 'AMD Ryzen 5 7520U (4C/8T)',
      cpu_cores: 4,
      screen_size_inch: 15.6,
      resolution: 'FHD 1920x1080 Anti-Glare',
      weight_kg: 1.62,
      os: 'Windows 11 Home',
      gpu_tier: 'integrated',
      color_gamut: '45% NTSC',
      ports: 'USB-C 3.2, USB-A 3.2, USB-A 2.0, HDMI 1.4, SD Card Reader'
    },
    stock: 18
  },
  {
    id: 'LAP-004',
    name: 'ASUS Vivobook 15',
    category: 'laptops',
    brand: 'ASUS',
    price_inr_paise: 3899000, // ₹38,990
    rating: 4.1,
    description: 'Entry budget daily driver laptop with 12th Gen Intel Core i3, anti-microbial guard, and 180-degree lay-flat hinge.',
    image_url: '/images/products/laptop-vivobook.svg',
    specs: {
      ram_gb: 8,
      storage_gb: 512,
      battery_hours: 6.5,
      cpu: 'Intel Core i3-1215U (6C/8T)',
      cpu_cores: 6,
      screen_size_inch: 15.6,
      resolution: 'FHD 1920x1080 NanoEdge',
      weight_kg: 1.70,
      os: 'Windows 11 Home',
      gpu_tier: 'integrated',
      color_gamut: '45% NTSC',
      ports: 'USB-C 3.2, USB-A 3.2, USB-A 2.0, HDMI 1.4'
    },
    stock: 20
  },
  {
    id: 'LAP-005',
    name: 'HP Pavilion 14',
    category: 'laptops',
    brand: 'HP',
    price_inr_paise: 5499000, // ₹54,990
    rating: 4.4,
    description: 'Premium compact aluminum notebook with Bang & Olufsen tuned audio, backlit keys, and fast-charge battery technology.',
    image_url: '/images/products/laptop-pavilion.svg',
    specs: {
      ram_gb: 16,
      storage_gb: 512,
      battery_hours: 8.5,
      cpu: 'Intel Core i5-1335U (10C/12T)',
      cpu_cores: 10,
      screen_size_inch: 14.0,
      resolution: 'FHD 1920x1080 IPS Micro-edge',
      weight_kg: 1.41,
      os: 'Windows 11 Home',
      gpu_tier: 'integrated',
      color_gamut: '100% sRGB',
      ports: 'USB-C with Power Delivery, 2x USB-A 3.2, HDMI 2.1'
    },
    stock: 10
  },
  {
    id: 'LAP-006',
    name: 'ASUS TUF Gaming F15',
    category: 'laptops',
    brand: 'ASUS',
    price_inr_paise: 5899000, // ₹58,990
    rating: 4.3,
    description: 'Rugged military-grade gaming laptop with NVIDIA GeForce RTX 2050 graphics and fluid 144Hz IPS display.',
    image_url: '/images/products/laptop-tuf.svg',
    specs: {
      ram_gb: 16,
      storage_gb: 512,
      battery_hours: 4.5,
      cpu: 'Intel Core i5-11400H (6C/12T)',
      cpu_cores: 6,
      screen_size_inch: 15.6,
      resolution: 'FHD 1920x1080 144Hz IPS',
      refresh_rate_hz: 144,
      weight_kg: 2.30,
      os: 'Windows 11 Home',
      gpu_tier: 'dedicated',
      gpu_name: 'NVIDIA RTX 2050 4GB',
      ports: 'Thunderbolt 4, 3x USB-A 3.2, HDMI 2.0b, RJ45 Gigabit'
    },
    stock: 8
  },
  {
    id: 'LAP-007',
    name: 'Apple MacBook Air M2',
    category: 'laptops',
    brand: 'Apple',
    price_inr_paise: 8999000, // ₹89,990
    rating: 4.8,
    description: 'Iconic fanless ultrabook powered by Apple M2 silicon with breathtaking 18-hour battery longevity and Liquid Retina screen.',
    image_url: '/images/products/laptop-macbook.svg',
    specs: {
      ram_gb: 8,
      storage_gb: 256,
      battery_hours: 18,
      cpu: 'Apple M2 (8-core CPU / 8-core GPU)',
      cpu_cores: 8,
      screen_size_inch: 13.6,
      resolution: '2560x1664 Liquid Retina (500 nits)',
      weight_kg: 1.24,
      os: 'macOS Sonoma',
      gpu_tier: 'integrated',
      color_gamut: '100% DCI-P3',
      ports: 'MagSafe 3, 2x Thunderbolt / USB 4, 3.5mm Headphone'
    },
    stock: 14
  },
  {
    id: 'LAP-008',
    name: 'Dell Inspiron 16 Plus',
    category: 'laptops',
    brand: 'Dell',
    price_inr_paise: 7899000, // ₹78,990
    rating: 4.7,
    description: 'Heavyweight productivity powerhouse with 14-core Intel Core i7, 1TB NVMe drive, and spacious 16" 2.5K 16:10 creator display.',
    image_url: '/images/products/laptop-inspiron.svg',
    specs: {
      ram_gb: 16,
      storage_gb: 1024,
      battery_hours: 9,
      cpu: 'Intel Core i7-13700H (14C/20T)',
      cpu_cores: 14,
      screen_size_inch: 16.0,
      resolution: '2.5K 2560x1600 16:10 IPS 300 nits',
      weight_kg: 2.06,
      os: 'Windows 11 Home',
      gpu_tier: 'integrated',
      color_gamut: '100% sRGB',
      ports: 'Thunderbolt 4, 2x USB-A 3.2, HDMI 2.0, SD Card Reader'
    },
    stock: 9
  },

  // ================= PHONES (6) =================
  {
    id: 'PHO-001',
    name: 'OnePlus Nord CE4',
    category: 'phones',
    brand: 'OnePlus',
    price_inr_paise: 2499000, // ₹24,990
    rating: 4.4,
    description: 'Mid-range endurance king featuring Snapdragon 7 Gen 3, a massive 5500mAh cell, and blinding 100W SuperVOOC rapid charging.',
    image_url: '/images/products/phone-nord.svg',
    specs: {
      ram_gb: 8,
      storage_gb: 128,
      battery_mah: 5500,
      fast_charging_w: 100,
      screen_size_inch: 6.7,
      refresh_rate_hz: 120,
      camera_mp: 50,
      ois: true,
      chipset_tier: 'high-tier',
      camera_quality: 4.2
    },
    stock: 25
  },
  {
    id: 'PHO-002',
    name: 'Google Pixel 7a',
    category: 'phones',
    brand: 'Google',
    price_inr_paise: 3299000, // ₹32,990
    rating: 4.5,
    description: 'The computational photography benchmark with Google Tensor G2, class-leading camera color reproduction, and IP67 water resistance.',
    image_url: '/images/products/phone-pixel.svg',
    specs: {
      ram_gb: 8,
      storage_gb: 128,
      battery_mah: 4385,
      fast_charging_w: 18,
      screen_size_inch: 6.1,
      refresh_rate_hz: 90,
      camera_mp: 64,
      ois: true,
      chipset_tier: 'flagship',
      camera_quality: 4.9
    },
    stock: 16
  },
  {
    id: 'PHO-003',
    name: 'Samsung Galaxy S23 FE',
    category: 'phones',
    brand: 'Samsung',
    price_inr_paise: 3999000, // ₹39,990
    rating: 4.3,
    description: 'Fan Edition flagship equipped with Dynamic AMOLED 2X, a dedicated 3x optical telephoto lens, and Samsung DeX PC connectivity.',
    image_url: '/images/products/phone-galaxy.svg',
    specs: {
      ram_gb: 8,
      storage_gb: 128,
      battery_mah: 4500,
      fast_charging_w: 25,
      screen_size_inch: 6.4,
      refresh_rate_hz: 120,
      camera_mp: 50,
      ois: true,
      chipset_tier: 'flagship',
      camera_quality: 4.6
    },
    stock: 14
  },
  {
    id: 'PHO-004',
    name: 'iQOO Neo 9 Pro',
    category: 'phones',
    brand: 'iQOO',
    price_inr_paise: 3499000, // ₹34,990
    rating: 4.6,
    description: 'Extreme gaming performance powered by Qualcomm Snapdragon 8 Gen 2, SuperComputing Q1 chip, and ultra-smooth 144Hz LTPO OLED.',
    image_url: '/images/products/phone-iqoo.svg',
    specs: {
      ram_gb: 8,
      storage_gb: 128,
      battery_mah: 5160,
      fast_charging_w: 120,
      screen_size_inch: 6.78,
      refresh_rate_hz: 144,
      camera_mp: 50,
      ois: true,
      chipset_tier: 'gaming',
      camera_quality: 4.3
    },
    stock: 15
  },
  {
    id: 'PHO-005',
    name: 'Redmi Note 13 5G',
    category: 'phones',
    brand: 'Xiaomi',
    price_inr_paise: 1699000, // ₹16,990
    rating: 4.2,
    description: 'Sleek budget 5G phone offering super-slim 7.6mm profile, 108MP high-resolution camera, and a rich 120Hz AMOLED screen.',
    image_url: '/images/products/phone-redmi.svg',
    specs: {
      ram_gb: 6,
      storage_gb: 128,
      battery_mah: 5000,
      fast_charging_w: 33,
      screen_size_inch: 6.67,
      refresh_rate_hz: 120,
      camera_mp: 108,
      ois: false,
      chipset_tier: 'budget',
      camera_quality: 4.0
    },
    stock: 30
  },
  {
    id: 'PHO-006',
    name: 'Apple iPhone 15',
    category: 'phones',
    brand: 'Apple',
    price_inr_paise: 6999000, // ₹69,990
    rating: 4.8,
    description: 'Flagship iOS smartphone featuring Dynamic Island, aerospace-grade aluminum, USB-C convenience, and 48MP computational photography.',
    image_url: '/images/products/phone-iphone.svg',
    specs: {
      ram_gb: 6,
      storage_gb: 128,
      battery_mah: 3349,
      fast_charging_w: 20,
      screen_size_inch: 6.1,
      refresh_rate_hz: 60,
      camera_mp: 48,
      ois: true,
      chipset_tier: 'flagship',
      camera_quality: 4.9
    },
    stock: 10
  },

  // ================= HEADPHONES (6) =================
  {
    id: 'AUD-001',
    name: 'Sony WH-1000XM4',
    category: 'headphones',
    brand: 'Sony',
    price_inr_paise: 2299000, // ₹22,990
    rating: 4.8,
    description: 'Gold-standard noise cancellation headphones with Dual Noise Sensor technology, LDAC audio streaming, and plush pressure-relieving earpads.',
    image_url: '/images/products/audio-sony.svg',
    specs: {
      battery_hours: 30,
      anc: true,
      comfort_score: 4.8,
      multipoint: true,
      sound_profile: 'neutral',
      low_latency: false,
      spatial_audio: true,
      mic_quality: 4.5,
      wired_option: true
    },
    stock: 20
  },
  {
    id: 'AUD-002',
    name: 'Soundcore by Anker Life Q30',
    category: 'headphones',
    brand: 'Soundcore',
    price_inr_paise: 599000, // ₹5,990
    rating: 4.4,
    description: 'Exceptional budget ANC over-ear headphones featuring multi-mode active noise cancellation, custom app EQ, and 40-hour ANC playback.',
    image_url: '/images/products/audio-soundcore.svg',
    specs: {
      battery_hours: 40,
      anc: true,
      comfort_score: 4.3,
      multipoint: true,
      sound_profile: 'bass_boost',
      low_latency: false,
      spatial_audio: false,
      mic_quality: 4.0,
      wired_option: true
    },
    stock: 35
  },
  {
    id: 'AUD-003',
    name: 'Sennheiser Accentum Plus Wireless',
    category: 'headphones',
    brand: 'Sennheiser',
    price_inr_paise: 1499000, // ₹14,990
    rating: 4.6,
    description: 'Acoustically pristine wireless headphones delivering refined signature sound, adaptive ANC, and an astounding 50-hour battery lifespan.',
    image_url: '/images/products/audio-sennheiser.svg',
    specs: {
      battery_hours: 50,
      anc: true,
      comfort_score: 4.6,
      multipoint: true,
      sound_profile: 'neutral',
      low_latency: true,
      spatial_audio: false,
      mic_quality: 4.4,
      wired_option: true
    },
    stock: 18
  },
  {
    id: 'AUD-004',
    name: 'JBL Tune 770NC',
    category: 'headphones',
    brand: 'JBL',
    price_inr_paise: 649900, // ₹6,499
    rating: 4.3,
    description: 'Lightweight foldable headphones featuring signature JBL Pure Bass sound, adaptive noise cancelling, and colossal 70-hour battery stamina.',
    image_url: '/images/products/audio-jbl.svg',
    specs: {
      battery_hours: 70,
      anc: true,
      comfort_score: 4.1,
      multipoint: true,
      sound_profile: 'bass_boost',
      low_latency: false,
      spatial_audio: false,
      mic_quality: 3.9,
      wired_option: true
    },
    stock: 22
  },
  {
    id: 'AUD-005',
    name: 'Audio-Technica ATH-M50xBT2',
    category: 'headphones',
    brand: 'Audio-Technica',
    price_inr_paise: 1699000, // ₹16,990
    rating: 4.7,
    description: 'Studio monitoring legend converted to wireless with 45mm large-aperture drivers, AK4331 advanced audio DAC, and flat reference tuning.',
    image_url: '/images/products/audio-ath.svg',
    specs: {
      battery_hours: 50,
      anc: false,
      comfort_score: 4.4,
      multipoint: true,
      sound_profile: 'reference',
      low_latency: true,
      spatial_audio: false,
      mic_quality: 4.2,
      wired_option: true
    },
    stock: 15
  },
  {
    id: 'AUD-006',
    name: 'boAt Rockerz 551ANC',
    category: 'headphones',
    brand: 'boAt',
    price_inr_paise: 299900, // ₹2,999
    rating: 4.0,
    description: 'Hyper-budget hybrid ANC headphones with custom 40mm dynamic drivers, ambient sound pass-through, and up to 100 hours of runtime.',
    image_url: '/images/products/audio-boat.svg',
    specs: {
      battery_hours: 100,
      anc: true,
      comfort_score: 3.9,
      multipoint: false,
      sound_profile: 'bass_boost',
      low_latency: false,
      spatial_audio: false,
      mic_quality: 3.7,
      wired_option: true
    },
    stock: 40
  },

  // ================= KEYBOARDS (4) =================
  {
    id: 'KEY-001',
    name: 'Logitech MX Keys S',
    category: 'keyboards',
    brand: 'Logitech',
    price_inr_paise: 1099500, // ₹10,995
    rating: 4.7,
    description: 'Master-series low-profile productivity keyboard with smart illumination, spherically dished keys, and multi-OS pairing.',
    image_url: '/images/products/keyboard-mxkeys.svg',
    specs: {
      mechanical: false,
      switch_type: 'Low-profile scissor',
      wireless: true,
      quiet_typing: true,
      layout: 'Full-size',
      numpad_or_macro: true,
      rgb_backlight: false,
      polling_rate_hz: 125,
      battery_life: '10 days (5 months backlight off)'
    },
    stock: 15
  },
  {
    id: 'KEY-002',
    name: 'Keychron K2 V2 Wireless Mechanical',
    category: 'keyboards',
    brand: 'Keychron',
    price_inr_paise: 749900, // ₹7,499
    rating: 4.6,
    description: 'Tactile 75% compact mechanical keyboard engineered for developers with Gateron G Pro Brown switches and seamless Mac/Win switching.',
    image_url: '/images/products/keyboard-keychron.svg',
    specs: {
      mechanical: true,
      switch_type: 'Gateron G Pro Brown (Tactile)',
      wireless: true,
      quiet_typing: true,
      layout: '75%',
      numpad_or_macro: false,
      rgb_backlight: true,
      polling_rate_hz: 1000,
      battery_life: '240 hours'
    },
    stock: 20
  },
  {
    id: 'KEY-003',
    name: 'Razer BlackWidow V4 X',
    category: 'keyboards',
    brand: 'Razer',
    price_inr_paise: 899900, // ₹8,999
    rating: 4.4,
    description: 'Esports mechanical gaming keyboard with Razer Yellow silent linear switches, 6 dedicated macro keys, and 8000Hz hyperpolling.',
    image_url: '/images/products/keyboard-razer.svg',
    specs: {
      mechanical: true,
      switch_type: 'Razer Yellow Linear (Silent)',
      wireless: false,
      quiet_typing: false,
      layout: 'Full-size',
      numpad_or_macro: true,
      rgb_backlight: true,
      polling_rate_hz: 8000,
      battery_life: 'Wired USB-A'
    },
    stock: 12
  },
  {
    id: 'KEY-004',
    name: 'Logitech K380 Multi-Device Bluetooth',
    category: 'keyboards',
    brand: 'Logitech',
    price_inr_paise: 299500, // ₹2,995
    rating: 4.3,
    description: 'Ultra-portable, whisper-quiet keyboard that connects to up to 3 computers, tablets, or phones with 2-year battery life.',
    image_url: '/images/products/keyboard-k380.svg',
    specs: {
      mechanical: false,
      switch_type: 'Scissor chiclet',
      wireless: true,
      quiet_typing: true,
      layout: 'Compact',
      numpad_or_macro: false,
      rgb_backlight: false,
      polling_rate_hz: 125,
      battery_life: '24 months (2x AAA)'
    },
    stock: 30
  },

  // ================= MONITORS (4) =================
  {
    id: 'MON-001',
    name: 'Dell S2722QC 27" 4K USB-C Hub',
    category: 'monitors',
    brand: 'Dell',
    price_inr_paise: 3499000, // ₹34,990
    rating: 4.8,
    description: 'Stunning 4K UHD IPS display featuring 65W USB-C single cable laptop dock, 99% sRGB color gamut, and integrated stereo speakers.',
    image_url: '/images/products/monitor-dell.svg',
    specs: {
      screen_size_inch: 27.0,
      resolution: '4K UHD',
      refresh_rate_hz: 60,
      response_time_ms: 4,
      color_accuracy: '99% sRGB',
      usb_c_hub: true,
      eye_care: true,
      adaptive_sync: true,
      panel_type: 'IPS'
    },
    stock: 10
  },
  {
    id: 'MON-002',
    name: 'LG UltraGear 27GN800-B 27" QHD',
    category: 'monitors',
    brand: 'LG',
    price_inr_paise: 2199000, // ₹21,990
    rating: 4.6,
    description: 'Fast-paced IPS gaming monitor boasting 144Hz refresh rate, 1ms GtG response time, and NVIDIA G-Sync compatibility.',
    image_url: '/images/products/monitor-lg.svg',
    specs: {
      screen_size_inch: 27.0,
      resolution: 'QHD 1440p',
      refresh_rate_hz: 144,
      response_time_ms: 1,
      color_accuracy: '99% sRGB',
      usb_c_hub: false,
      eye_care: true,
      adaptive_sync: true,
      panel_type: 'IPS'
    },
    stock: 14
  },
  {
    id: 'MON-003',
    name: 'BenQ GW2780 27" Eye-Care FHD',
    category: 'monitors',
    brand: 'BenQ',
    price_inr_paise: 1199000, // ₹11,990
    rating: 4.4,
    description: 'Class-leading eye-care study monitor equipped with Brightness Intelligence auto-dimming, Low Blue Light, and ultra-slim bezels.',
    image_url: '/images/products/monitor-benq.svg',
    specs: {
      screen_size_inch: 27.0,
      resolution: 'FHD 1080p',
      refresh_rate_hz: 60,
      response_time_ms: 5,
      color_accuracy: '72% NTSC',
      usb_c_hub: false,
      eye_care: true,
      adaptive_sync: false,
      panel_type: 'IPS'
    },
    stock: 25
  },
  {
    id: 'MON-004',
    name: 'ASUS ProArt PA278CV 27" WQHD Creator',
    category: 'monitors',
    brand: 'ASUS',
    price_inr_paise: 2999000, // ₹29,990
    rating: 4.7,
    description: 'Factory-calibrated professional monitor offering Calman Verified 100% sRGB / Rec. 709 with Delta E < 2 color accuracy and USB-C dock.',
    image_url: '/images/products/monitor-proart.svg',
    specs: {
      screen_size_inch: 27.0,
      resolution: 'QHD 1440p',
      refresh_rate_hz: 75,
      response_time_ms: 5,
      color_accuracy: '100% sRGB',
      usb_c_hub: true,
      eye_care: true,
      adaptive_sync: true,
      panel_type: 'IPS'
    },
    stock: 12
  }
];

export function seedCatalogue(dbInstance?: ISqliteDatabase): void {
  const db = dbInstance || getDatabase();
  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, name, category, brand, price_inr_paise, rating, description, image_url, specs_json, stock
    ) VALUES (
      @id, @name, @category, @brand, @price_inr_paise, @rating, @description, @image_url, @specs_json, @stock
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      brand = excluded.brand,
      price_inr_paise = excluded.price_inr_paise,
      rating = excluded.rating,
      description = excluded.description,
      image_url = excluded.image_url,
      specs_json = excluded.specs_json,
      stock = excluded.stock;
  `);

  const runSeed = db.transaction(() => {
    for (const prod of PRODUCTS_CATALOGUE) {
      insertStmt.run({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        brand: prod.brand,
        price_inr_paise: prod.price_inr_paise,
        rating: prod.rating,
        description: prod.description,
        image_url: prod.image_url,
        specs_json: JSON.stringify(prod.specs),
        stock: prod.stock
      });
    }
  });

  runSeed();
  console.log(`[Seed] Successfully seeded ${PRODUCTS_CATALOGUE.length} catalogue products.`);
}

// Allow direct execution
if (process.argv[1]?.includes('seed')) {
  try {
    seedCatalogue();
  } finally {
    closeDatabase();
  }
}
