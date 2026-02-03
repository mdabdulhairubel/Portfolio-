
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, MessageCircle } from 'lucide-react';
import { NAV_ITEMS, SOCIAL_LINKS, APP_NAME } from './constants.tsx';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
import Services from './pages/Services.tsx';
import Portfolio from './pages/Portfolio.tsx';
import Blog from './pages/Blog.tsx';
import Contact from './pages/Contact.tsx';
import Admin from './pages/Admin.tsx';
import Chatbot from './components/Chatbot.tsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text leading-none">{APP_NAME}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.path ? 'text-primary' : 'text-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link 
              to="/contact"
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-gray-950 text-sm font-bold rounded-full transition-all"
            >
              Hire Me
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 animate-in fade-in slide-in-from-top-4">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-4 text-base font-medium rounded-md ${
                  pathname === item.path ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
            <Link 
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 px-5 py-3 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-lg"
            >
              Hire Me
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold gradient-text mb-4">{APP_NAME}</h2>
            <p className="text-gray-400 max-w-sm mb-6">
              A passionate Visualizer with 5+ years of experience crafting high-impact graphics, 
              stunning motion pieces, and cinematic videos.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-primary hover:border-primary transition-all"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-400 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="text-gray-400">Dhaka, Bangladesh</li>
              <li className="text-gray-400">+880 1779 672765</li>
              <li className="text-gray-400">mdabdulhai2506@gmail.com</li>
            </ul>
            <div className="mt-8">
              <Link 
                to="/admin" 
                className="text-xs text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
              >
                Admin Panel Access <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Md Abdul Hai. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built with Passion & AI</p>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
};

export default App;
