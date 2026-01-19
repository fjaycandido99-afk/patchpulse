import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.patchpulse.app',
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
    PurchasesPlugin: {
      // Set via environment variable in Vercel
      // NEXT_PUBLIC_REVENUECAT_API_KEY=appl_xxxxx
    },
    OneSignal: {
      appId: '06b63fd2-b5f5-4146-9c4e-9d28c58862eb',
    },
  },
};

export default config;
