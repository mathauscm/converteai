import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Mail, 
  Github, 
  Twitter, 
  Linkedin,
  Heart,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Recursos', href: '#features' },
      { name: 'Como Funciona', href: '#how-it-works' },
      { name: 'Preços', href: '#pricing' },
      { name: 'API', href: '#api' }
    ],
    support: [
      { name: 'FAQ', href: '#faq' },
      { name: 'Suporte', href: '#support' },
      { name: 'Contato', href: '#contact' },
      { name: 'Status', href: '#status' }
    ],
    legal: [
      { name: 'Privacidade', href: '#privacy' },
      { name: 'Termos', href: '#terms' },
      { name: 'Cookies', href: '#cookies' },
      { name: 'LGPD', href: '#lgpd' }
    ]
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/seu-usuario' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/seu-usuario' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/seu-usuario' }
  ];

  const features = [
    { icon: Shield, text: '100% Seguro' },
    { icon: Zap, text: 'Conversão Rápida' },
    { icon: Globe, text: 'Acesso Global' }
  ];

  return (
    <footer className={styles.footer}>
      {/* Features Banner */}
      <div className={styles.featuresBanner}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                className={styles.featureItem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon size={24} className={styles.featureIcon} />
                <span className={styles.featureText}>{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            {/* Brand Section */}
            <motion.div 
              className={styles.brandSection}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <FileText size={28} />
                </div>
                <span className={styles.logoText}>
                  Converte<span className={styles.logoAccent}>AI</span>
                </span>
              </div>
              <p className={styles.brandDescription}>
                A solução mais rápida e segura para converter seus PDFs em documentos Word editáveis. 
                Simples, gratuito e sem complicações.
              </p>
              <div className={styles.socialLinks}>
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon size={20} />
                    <span className="sr-only">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links Sections */}
            <motion.div 
              className={styles.linksSection}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className={styles.linkTitle}>Produto</h4>
              <ul className={styles.linkList}>
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className={styles.link}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              className={styles.linksSection}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className={styles.linkTitle}>Suporte</h4>
              <ul className={styles.linkList}>
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className={styles.link}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              className={styles.linksSection}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className={styles.linkTitle}>Legal</h4>
              <ul className={styles.linkList}>
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className={styles.link}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Section */}
            <motion.div 
              className={styles.contactSection}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className={styles.linkTitle}>Contato</h4>
              <div className={styles.contactInfo}>
                <a href="mailto:developer@mathaus.dev" className={styles.contactLink}>
                  <Mail size={18} />
                  developer@mathaus.dev
                </a>
              </div>
              <div className={styles.newsletter}>
                <p className={styles.newsletterText}>
                  Receba atualizações sobre novos recursos
                </p>
                <div className={styles.newsletterForm}>
                  <input
                    type="email"
                    placeholder="Seu email"
                    className={styles.newsletterInput}
                  />
                  <button className={styles.newsletterButton}>
                    Inscrever
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.bottomFooter}>
        <div className={styles.container}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <span>© {currentYear} ConverteAI. Todos os direitos reservados.</span>
            </div>
            <div className={styles.madeWith}>
              <span>Feito com</span>
              <Heart size={16} className={styles.heartIcon} />
              <span>por</span>
              <a 
                href="https://mathaus.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.authorLink}
              >
                mathaus.dev
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;