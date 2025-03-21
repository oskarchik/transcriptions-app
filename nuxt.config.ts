// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@pinia/nuxt"],
  srcDir: "src",
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./src/components/ui"
     */
    componentDir: "./src/components/ui",
  },
  runtimeConfig: {
    public: {
      baseApiUrl: process.env.NUXT_BASE_API_URL,
    },
  },
  plugins: [{ src: "./src/plugins/amplify.js", ssr: false }],
  components: ["~/components", "~/components/custom"],
  ssr: false,
});
