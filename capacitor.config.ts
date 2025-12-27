import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.patchpulse.ios',
  appName: 'PatchPulse',
  webDir: 'out',
  server: {
    // Use production URL - the app loads from your server
    url: 'https://patchpulse.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'patchpulse',
  },
  plugins: {
    CapacitorPurchases: {
      // RevenueCat API key will go here
      // apiKey: 'your_revenuecat_api_key',
    },
  },
};

export default config;
