/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverDependenciesToBundle: ["nanoid"],
  ignoredRouteFiles: ["**/.*", "**/*.test.ts"],
  appDirectory: "app",
  assetsBuildDirectory: "public/static",
  serverBuildPath: "build/index.js",
  publicPath: "/static/",
};
