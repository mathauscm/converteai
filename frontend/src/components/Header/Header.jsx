import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, FileText, Zap } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className={styles.container}>
        <div className={styles.nav}>
          {/* Logo */}
          <motion.div 
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.logoIcon}>
              <FileText size={24} />
            </div>
            <span className={styles.logoText}>
              Converte<span className={styles.logoAccent}>AI</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className={styles.navigation}>
            <a href="#features" className={styles.navLink}>
              Recursos
            </a>
            <a href="#how-it-works" className={styles.navLink}>
              Como Funciona
            </a>
            <a href="#faq" className={styles.navLink}>
              FAQ
            </a>
            <a href="#contact" className={styles.navLink}>
              Contato
            </a>
          </nav>

          {/* CTA Button */}
          <div className={styles.actions}>
            <motion.button
              className={styles.ctaButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap size={18} />
              Converter Agora
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              className={styles.mobileMenuButton}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}
          initial={false}
          animate={{
            height: isMenuOpen ? 'auto' : 0,
            opacity: isMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.mobileNavContent}>
            <a href="#features" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
              Recursos
            </a>
            <a href="#how-it-works" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
              Como Funciona
            </a>
            <a href="#faq" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
              FAQ
            </a>
            <a href="#contact" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
              Contato
            </a>
            <button className={styles.mobileCta} onClick={() => setIsMenuOpen(false)}>
              <Zap size={18} />
              Converter Agora
            </button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;