export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  typescript: {
    shim: false, // shimsファイル生成の無効化（VSCodeでVolarを使う場合はfalseにする）
    strict: true, // 型チェックを厳格化
    typeCheck: false, // nuxt devまたはnuxt build時に型チェックを実行
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  nitro: {
    preset: 'firebase',
  },
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
});
