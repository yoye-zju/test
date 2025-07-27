import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      build: {
          outDir: 'docs', // 加这一行，构建输出到 docs 文件夹
          cssCodeSplit: true,
          rollupOptions: {
            output: {
              assetFileNames: 'assets/[name]-[hash].[ext]',
            },
          },
        },
        define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
