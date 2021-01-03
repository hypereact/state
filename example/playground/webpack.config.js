const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const InterpolateWebpackPlugin = require("interpolate-webpack-plugin");
const DotEnvPlugin = require("dotenv-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

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
      new InterpolateWebpackPlugin(
        Object.keys(process.env).map((key) => {
          return {
            key,
            value: process.env[key],
          };
        })
      ),
      new DotEnvPlugin({
        NODE_ENV: mode,
      }),
      new CleanWebpackPlugin(),
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
    },
    // optimization: {
    //   splitChunks: {
    //     chunks: "all",
    //     maxInitialRequests: Infinity,
    //     minSize: 0,
    //     cacheGroups: {
    //       vendor: {
    //         test: /[\\/]node_modules[\\/]/,
    //         name(module) {
    //           const packageName = module.context.match(
    //             /[\\/]node_modules[\\/](.*?)([\\/]|$)/
    //           )[1];
    //           return `vendor.${packageName.replace("@", "")}`;
    //         },
    //       },
    //     },
    //   },
    // },
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
