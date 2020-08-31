const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

const currentPath = path.join(__dirname);
const srcPath = path.resolve(currentPath, "src");

module.exports = (env) => {
  const envPath = path.resolve(currentPath, env.ENVIRONMENT);

  const finalPath = `${envPath}.env`;

  const fileEnv = dotenv.config({ path: finalPath }).parsed;

  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  console.log("***");
  console.log(finalPath);
  console.log("***");

  return {
    context: srcPath,
    entry: path.resolve(srcPath, "./index.js"),
    output: {
      path: path.resolve(currentPath, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },
    devServer: {
      historyApiFallback: true,
    },
    resolve: {
      extensions: ["*", ".js", ".jsx", ".json"],
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
