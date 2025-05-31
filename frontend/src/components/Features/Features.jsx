import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Globe, 
  FileText, 
  Download, 
  Lock,
  Clock,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import styles from './Features.module.css';

const Features = () => {
  const mainFeatures = [
    {
      icon: Zap,
      title: "Conversão Instantânea",
      description: "Transforme seus PDFs em documentos Word editáveis em segundos, mantendo a formatação original.",
      color: "#3b82f6"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Seus arquivos são processados com segurança e excluídos automaticamente após a conversão.",
      color: "#10b981"
    },
    {
      icon: Globe,
      title: "Acesso Global",
      description: "Use de qualquer lugar do mundo, em qualquer dispositivo, sem necessidade de instalação.",
      color: "#f59e0b"
    }
  ];

  const additionalFeatures = [
    {
      icon: FileText,
      title: "Preserva Formatação",
      description: "Mantém texto, imagens e layout originais"
    },
    {
      icon: Download,
      title: "Download Direto",
      description: "Baixe seu arquivo convertido instantaneamente"
    },
    {
      icon: Lock,
      title: "Sem Cadastro",
      description: "Use gratuitamente sem criar conta"
    },
    {
      icon: Clock,
      title: "Processamento Rápido",
      description: "Conversão completa em menos de 30 segundos"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Funciona perfeitamente em smartphones"
    },
    {
      icon: RefreshCw,
      title: "Conversões Ilimitadas",
      description: "Converta quantos arquivos precisar"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        {/* Header */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>
            Por que escolher o <span className={styles.accent}>ConverteAI</span>?
          </h2>
          <p className={styles.subtitle}>
            A ferramenta mais avançada e segura para conversão de PDFs. 
            Simples de usar, rápida e confiável.
          </p>
        </motion.div>

        {/* Main Features */}
        <motion.div 
          className={styles.mainFeaturesGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={styles.mainFeatureCard}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <div 
                className={styles.mainFeatureIcon}
                style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }}
              >
                <feature.icon size={32} />
              </div>
              <div className={styles.mainFeatureContent}>
                <h3 className={styles.mainFeatureTitle}>{feature.title}</h3>
                <p className={styles.mainFeatureDescription}>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features */}
        <motion.div 
          className={styles.additionalFeatures}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className={styles.additionalTitle}>Recursos Adicionais</h3>
          <motion.div 
            className={styles.additionalGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={styles.additionalCard}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <div className={styles.additionalIcon}>
                  <feature.icon size={24} />
                </div>
                <h4 className={styles.additionalCardTitle}>{feature.title}</h4>
                <p className={styles.additionalCardDescription}>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className={styles.stats}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10MB</div>
              <div className={styles.statLabel}>Tamanho máximo</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>30s</div>
              <div className={styles.statLabel}>Tempo médio</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Taxa de sucesso</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>Disponibilidade</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;