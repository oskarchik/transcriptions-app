import { Amplify } from "aws-amplify";
import awsmobile from "../aws/aws-exports";

export default defineNuxtPlugin((nuxtApp) => {
  Amplify.configure(awsmobile);

  nuxtApp.provide("Amplify", Amplify);
});
