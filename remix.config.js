/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*", "**/*.test.ts"],
  appDirectory: "app",
  assetsBuildDirectory: "public/static",
  serverBuildPath: "build/index.js",
  publicPath: "/static/",
};
