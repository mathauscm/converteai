import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

import Header from './components/Header/Header';
import FileUpload from './components/FileUpload/FileUpload';
import Footer from './components/Footer/Footer';
import Features from './components/Features/Features';

import './styles/globals.css';

function App() {
  // Add padding-top to body to account for fixed header
  useEffect(() => {
    document.body.style.paddingTop = '70px';
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <motion.section 
          className="hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container">
            <div className="hero-content">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Converte seus PDFs para Word
                <span className="gradient-text"> instantaneamente</span>
              </motion.h1>
              
              <motion.p
                className="hero-description"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Transforme qualquer documento PDF em um arquivo Word editável 
                com apenas alguns cliques. Rápido, seguro e gratuito.
              </motion.p>
              
              <motion.div
                className="hero-stats"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="stat">
                  <span className="stat-number">10MB</span>
                  <span className="stat-label">Tamanho máximo</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Gratuito</span>
                </div>
                <div className="stat">
                  <span className="stat-number">Seguro</span>
                  <span className="stat-label">Seus dados protegidos</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Upload Section */}
        <motion.section 
          className="upload-section"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="container">
            <FileUpload />
          </div>
        </motion.section>

        {/* Features Section */}
        <Features />

        {/* How it works */}
        <motion.section 
          className="how-it-works"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          id="how-it-works"
        >
          <div className="container">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Como funciona
            </motion.h2>
            <div className="steps">
              <motion.div 
                className="step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="step-number">1</div>
                <h3>Escolha seu PDF</h3>
                <p>Selecione ou arraste o arquivo PDF que deseja converter</p>
              </motion.div>
              
              <motion.div 
                className="step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="step-number">2</div>
                <h3>Conversão automática</h3>
                <p>Nossa IA processa seu documento mantendo a formatação original</p>
              </motion.div>
              
              <motion.div 
                className="step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="step-number">3</div>
                <h3>Baixe seu Word</h3>
                <p>Faça o download do arquivo .docx pronto para edição</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className="faq"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          id="faq"
        >
          <div className="container">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Perguntas Frequentes
            </motion.h2>
            <div className="faq-grid">
              <motion.div 
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3>É realmente gratuito?</h3>
                <p>Sim! Nosso serviço é completamente gratuito para arquivos de até 10MB.</p>
              </motion.div>
              
              <motion.div 
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3>Meus arquivos ficam seguros?</h3>
                <p>Absolutamente. Seus arquivos são processados de forma segura e excluídos automaticamente após a conversão.</p>
              </motion.div>
              
              <motion.div 
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3>Qual o tamanho máximo?</h3>
                <p>Atualmente suportamos arquivos PDF de até 10MB de tamanho.</p>
              </motion.div>
              
              <motion.div 
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3>A formatação é preservada?</h3>
                <p>Sim, nossa tecnologia mantém a formatação original do documento o máximo possível.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;