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
    // Use CocoaPods instead of SPM for plugins
    useCocoaPods: true,
  },
  plugins: {
    PurchasesPlugin: {
      // Set via environment variable in Vercel
      // NEXT_PUBLIC_REVENUECAT_API_KEY=appl_xxxxx
    },
  },
};

export default config;
