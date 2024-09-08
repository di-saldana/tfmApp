import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.ua.mastermoviles.dsl.concertPal',
  appName: 'ConcertPal',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'capacitor'
  }
};

export default config;