import { Amplify } from "aws-amplify";
import awsConfig from "../aws/aws-exports";

export default defineNuxtPlugin((nuxtApp) => {
  Amplify.configure(awsConfig);

  nuxtApp.provide("Amplify", Amplify);
});
