
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, MessageSquare } from 'lucide-react';
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
            <span className="text-2xl font-bold gradient-text leading-none tracking-tighter">{APP_NAME}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-bold transition-colors hover:text-primary tracking-wide ${
                  pathname === item.path ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link 
              to="/contact"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-gray-950 text-sm font-black rounded-full transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            >
              Hire Me
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-gray-950 border-b border-gray-800 animate-in fade-in slide-in-from-top-4">
          <div className="px-4 pt-2 pb-8 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-4 text-base font-bold rounded-xl ${
                  pathname === item.path ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-900'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={pathname === item.path ? 'text-primary' : 'text-gray-600'}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
            <div className="pt-4 px-2">
              <Link 
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-4 bg-primary text-gray-950 font-black rounded-xl"
              >
                Hire Me Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-bold gradient-text mb-6">{APP_NAME}</h2>
            <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
              Senior Visualizer specializing in high-end CGI commercials, motion graphics, and narrative video editing.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-xl"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-400 hover:text-primary transition-colors font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Let's Connect</h3>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Dhaka, Bangladesh
              </li>
              <li>
                <a href="tel:+8801779672765" className="hover:text-primary transition-colors">+880 1779 672765</a>
              </li>
              <li>
                <a href="mailto:mdabdulhai2506@gmail.com" className="hover:text-primary transition-colors">mdabdulhai2506@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-600">
          <p>© {new Date().getFullYear()} Md Abdul Hai. Designed for Impact.</p>
          <div className="mt-4 md:mt-0 flex items-center gap-6">
            <Link to="/admin" className="hover:text-primary transition-colors flex items-center gap-2">Admin Panel <ChevronRight size={14} /></Link>
            <span className="text-gray-800">|</span>
            <span>Motion x Design x CGI</span>
          </div>
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
