
import React from 'react';
import { 
  Home, User, Briefcase, LayoutGrid, FileText, Send, 
  Instagram, Linkedin, Youtube, MessageSquare, Menu, X, 
  Settings, LogOut, Plus, Trash2, Edit2, CheckCircle2,
  Play, ExternalLink
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: <Home size={20} /> },
  { label: 'About', path: '/about', icon: <User size={20} /> },
  { label: 'Services', path: '/services', icon: <Briefcase size={20} /> },
  { label: 'Portfolio', path: '/portfolio', icon: <LayoutGrid size={20} /> },
  { label: 'Blog', path: '/blog', icon: <FileText size={20} /> },
  { label: 'Contact', path: '/contact', icon: <Send size={20} /> },
];

export const SOCIAL_LINKS = [
  { icon: <Instagram size={20} />, url: '#', label: 'Instagram' },
  { icon: <Linkedin size={20} />, url: '#', label: 'LinkedIn' },
  { icon: <Youtube size={20} />, url: '#', label: 'YouTube' },
  { icon: <MessageSquare size={20} />, url: 'https://wa.me/8801779672765', label: 'WhatsApp' },
];

export const APP_NAME = "Md Abdul Hai";
export const PROFESSION = "Visualizer & Creative Artist";
