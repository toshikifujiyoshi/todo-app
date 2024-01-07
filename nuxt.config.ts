// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  typescript: {
    shim: false, // shimsファイル生成の無効化（VSCodeでVolarを使う場合はfalseにする）
    strict: true, // 型チェックを厳格化
    typeCheck: false // nuxt devまたはnuxt build時に型チェックを実行
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  nitro: {
    preset: 'firebase'
  },
  modules: ['@nuxt/ui']
  // plugins: ['~/plugins/firebase.client.ts'],
  // runtimeConfig: {
  //   public: {
  //     firebaseApiKey: process.env.NUXT_FIREBASE_APIKEY,
  //     firebaseAuthDomain: process.env.NUXT_FIREBASE_AUTHDOMAIN,
  //     firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID,
  //     firebaseStorageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
  //     firebaseMessagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
  //     firebaseAppId: process.env.NUXT_FIREBASE_APP_ID,
  //     firebaseMeasurementId: process.env.NUXT_FIREBASE_MEASUREMENTID
  //   }
  // }
})
