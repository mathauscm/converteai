import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // Configuração do servidor de desenvolvimento
    server: {
        port: 3000,
        open: true,
        host: true
    },

    // Configuração de build
    build: {
        outDir: 'build',
        sourcemap: false,
        // Otimização para produção
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ui: ['framer-motion', 'lucide-react'],
                    utils: ['axios', 'react-hot-toast']
                }
            }
        }
    },

    // Resolução de módulos
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@services': path.resolve(__dirname, './src/services'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@styles': path.resolve(__dirname, './src/styles')
        }
    },

    // Configuração de environment variables
    define: {
        global: 'globalThis',
    },

    // Preview server (para testar build)
    preview: {
        port: 3000,
        host: true
    },

    // CSS configuration
    css: {
        modules: {
            localsConvention: 'camelCase'
        }
    }
})