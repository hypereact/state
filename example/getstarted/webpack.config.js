const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const DotEnvPlugin = require("dotenv-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const path = require("path");
const escapeStringRegexp = require('escape-string-regexp');

module.exports = (env) => {
  require("dotenv").config();
  let mode = "development";
  if (env.dev) {
    mode = "development";
  }
  if (env.prod) {
    mode = "production";
  }

  const config = {
    entry: "./src/index",
    mode: "none",
    devtool: "hidden-source-map",
    output: {
      path: path.resolve(__dirname, "build"),
    },
    plugins: [
      new CleanWebpackPlugin(),
      new DotEnvPlugin({
        NODE_ENV: mode,
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public/**/*.json",
            flatten: true,
          },
        ],
      }),
    ],
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
          options: {
            preprocessor: async (content, loaderContext) => {
              let result = content;
              try {
                for (const key in process.env) {
                  let regexp = new RegExp(`%${escapeStringRegexp(key)}%`, 'g');
                  result = result.replace(regexp, process.env[key]);
                }
              } catch (error) {
                await loaderContext.emitError(error);
                return content;
              }
              return result;
            },
          },
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: { allowTsInNodeModules: true },
        },
      ],
    },
    watch: false,
    target: "web",
    stats: {
      logging: "warn",
    }
  };

  if (env.analyze) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }
  config.mode = mode;

  if (env.web) {
    config.devServer = {
      contentBase: path.join(__dirname, "build"),
      compress: true,
      port: 5000,
    };
  }

  return config;
};
