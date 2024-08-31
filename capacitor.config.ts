import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.ua.mastermoviles.dsl.tfm',
  appName: 'ConcertPal',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'tfm_app'
  }
};

export default config;
