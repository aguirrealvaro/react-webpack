const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCSSExtract = require("mini-css-extract-plugin");
const { merge } = require("webpack-merge");
const PACKAGE = require("./package.json");

const currentPath = path.join(__dirname);
const srcPath = path.resolve(__dirname, "src");

const validEnvs = ["local", "development", "stage", "production"];

module.exports = (env = {}) => {
  if (!env.environment) {
    throw Error("The --env.environment argument is not defined.");
  }

  if (!validEnvs.includes(env.environment)) {
    throw Error(
      `Invalid --env.environment argument, please use one of the following: ${validEnvs}`
    );
  }

  const envPath = path.resolve(currentPath, "env", env.environment);
  const finalPath = `${envPath}.env`;
  const fileEnv = dotenv.config({ path: finalPath }).parsed;

  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});

  const isLocal =
    env.environment === "local" || env.environment === "development";

  const mode = isLocal ? "development" : "production";

  const commonConfig = {
    mode,
    context: currentPath,
    entry: {
      app: ["@babel/polyfill", "./src/index.js"],
    },
    output: {
      path: path.resolve(currentPath, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },
    resolve: {
      extensions: ["*", ".js", ".jsx", ".json"],
      alias: {
        "@": srcPath,
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.html$/,
          use: "html-loader",
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [MiniCSSExtract.loader, "css-loader"],
        },
        {
          test: /\.(png|j?g|svg|gif)?$/,
          use: "file-loader",
        },
      ],
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
        filename: "./index.html",
      }),
      new webpack.DefinePlugin({
        ...envKeys,
        "process.env": {
          NODE_ENV: JSON.stringify(mode),
          VERSION: JSON.stringify(PACKAGE.version),
        },
      }),
      new MiniCSSExtract(),
    ],
  };

  const devConfig = {
    devServer: {
      historyApiFallback: true,
      open: true,
      port: 3000,
    },
  };

  const stageConfig = {
    optimization: {
      minimize: false,
    },
  };

  const prodConfig = {
    plugins: [new OptimizeCssAssetsPlugin()],
  };

  const configs = {
    local: devConfig,
    development: devConfig,
    stage: stageConfig,
    production: prodConfig,
  };

  return merge(commonConfig, configs[env.environment]);
};
