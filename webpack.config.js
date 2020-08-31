const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

const srcPath = path.resolve(__dirname, "src");
const currentPath = path.join(__dirname);

const validEnvs = ["local", "development", "production"];

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

  return {
    mode: env.environment === "production" ? "production" : "development",
    entry: "./src/index.js",
    output: {
      path: path.resolve(currentPath, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },
    devServer: {
      historyApiFallback: true,
      open: true,
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
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
            },
          ],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
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
      new webpack.DefinePlugin(envKeys),
    ],
  };
};
