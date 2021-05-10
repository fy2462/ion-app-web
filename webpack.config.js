const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = (env) => {
  const isEnvProduction = !!env && env.production;
  console.log("Production: ", isEnvProduction);

  return {
    entry: {
      index: "./src/index.tsx",
    },
    devtool: "eval-source-map", //eval | source-map
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(less|css|scss)$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg|jpg|gif|png)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader?name=src/assets/images/[name].[ext]",
              options: {
                esModule: false
              }
            },
            {
              loader: "image-webpack-loader",
              options: {
                pngquant: {
                  quality: "65-90",
                  speed: 4,
                },
                mozjpeg: {
                  progressive: true,
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx", ".svg", ".ts", ".tsx", ".css", ".d.ts"],
      alias: {
        src: path.resolve(__dirname, "src"),
        styles: path.resolve(__dirname, "src/styles"),
        assets: path.resolve(__dirname, "src/assets"),
        config: path.resolve(__dirname, "configs"),
      },
    },
    output: {
      path: __dirname + "/dist",
      publicPath: "/",
      filename: "[name].bundle.js",
      chunkFilename: "[name].chunk.js",
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new ProgressBarPlugin(),
      new MiniCssExtractPlugin(),
      new ESLintPlugin(),
      new CompressionPlugin(),
      new HtmlWebpackPlugin(
        Object.assign({},
          {
            inject: true,
            template: path.resolve(__dirname, "src/assets/index.html"),
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),
    ],
    devServer: {
      host: "0.0.0.0",
      contentBase: [path.join(__dirname, "src")],
      port: 8022,
    },
  };
};
