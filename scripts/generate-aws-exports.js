import fs from "fs";
import path from "path";

// Obtén el directorio actual de este archivo
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Asegúrate de que el directorio exista antes de escribir el archivo
const dirPath = path.join(__dirname, "..", "src", "aws");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}
console.log("🚀 ~ region:", process.env.NUXT_AWS_PROJECT_REGION);
console.log("🚀 ~ poolId:", process.env.NUXT_AWS_USER_POOLS_ID);

const awsConfig = {
  aws_project_region: process.env.NUXT_AWS_PROJECT_REGION,
  aws_cognito_identity_pool_id: process.env.NUXT_AWS_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NUXT_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.NUXT_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: process.env.NUXT_AWS_USER_POOLS_WEB_CLIENT_ID,
  oauth: {},
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: [],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ["EMAIL"],
};

fs.writeFileSync(
  path.join(dirPath, "aws-exports.js"),
  `const awsConfig = ${JSON.stringify(
    awsConfig,
    null,
    4
  )};\nexport default awsConfig;`
);

console.log("✅ aws-exports.js generado correctamente");
