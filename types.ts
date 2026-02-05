
export interface SiteConfig {
  id?: string;
  hero_title: string;
  hero_role: string;
  hero_subtitle: string;
  hero_image_url?: string;
  hero_video_url?: string;
  bio: string;
  experience_years: number;
  profile_pic_url: string;
  about_video_url?: string;
  whatsapp: string;
  email: string;
  skills: Skill[];
  experience_timeline: TimelineItem[];
  tools: Tool[];
  chatbot_knowledge: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface TimelineItem {
  year: string;
  title: string;
  company: string;
  description: string;
}

export interface Tool {
  name: string;
  icon_url: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
}

export interface PricingPlan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  is_popular: boolean;
  button_text: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Graphic Design' | 'Motion Graphics' | 'Video Editing' | 'CGI Ads';
  type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string;
  media_gallery?: string[];
  is_featured: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  feedback: string;
  image_url: string;
  rating: number;
}

export interface BrandLogo {
  id: string;
  name: string;
  image_url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  category: string;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}
