import { Amplify } from "aws-amplify";
import aws from "../aws/aws-exports";

export default defineNuxtPlugin((nuxtApp) => {
  Amplify.configure(aws);

  nuxtApp.provide("Amplify", Amplify);
});
