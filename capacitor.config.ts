import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f0df4ccabd5d4c5d9ff2c10604e98c01',
  appName: 'revonnwebsiteofficial',
  webDir: 'dist',
  server: {
    url: 'https://f0df4cca-bd5d-4c5d-9ff2-c10604e98c01.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;