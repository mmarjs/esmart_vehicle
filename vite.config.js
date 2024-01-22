import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteComponents from 'vite-plugin-components';
import  {vueI18n}  from '@intlify/vite-plugin-vue-i18n';
import path from 'path';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  return defineConfig({
    plugins: [
      vue(),
      ViteComponents(),
      vueI18n({
        include: [path.resolve(__dirname, './i18n/locales/**')],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // server: {
    //   host: true,
    //   port: 3000,
    //   hmr: {
    //       clientPort: 6600
    //   }
    // }
  })
}
