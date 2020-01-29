const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isProductionBuild = argv.mode === "production";
  const publicPath = './';

  const pcss = {
    test: /\.(p|post|)css$/,
    use: [
      isProductionBuild ? MiniCssExtractPlugin.loader : "vue-style-loader",
      "css-loader",
      "postcss-loader"
    ]
  };

  const vue = {
    test: /\.vue$/,
    loader: "vue-loader"
  };

  const js = {
    test: /\.js$/,
    loader: "babel-loader",
    exclude: /node_modules/,
    options: {
      presets: ['@babel/preset-env'],
      plugins: ["@babel/plugin-syntax-dynamic-import"]
    }
  };

  const files = {
    test: /\.(svg|png|jpe?g|gif|woff2?)$/i,
    loader: "file-loader",
    options: {
      name: "[name].[ext]",
      // publicPath: './images',
      outputPath: 'images',
    }
  };

  const pug = {
    test: /\.pug$/,
    oneOf: [
      {
        resourceQuery: /^\?vue/,
        use: ["pug-plain-loader"],
      },
      {
        use: [
          {
            loader: "pug-loader",
            options: {
              pretty: true,
            }
          }
        ],
      }
    ]
  };

  const config = {
    entry: {
      main: "./src/main.js",
      admin: "./src/admin/main.js"
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      // filename: "[name].[hash].build.js",
      filename: "[name].build.js",
      publicPath: isProductionBuild ? publicPath : "",
      // chunkFilename: "[chunkhash].js"
      chunkFilename: "min.js"
    },
    module: {
      rules: [pcss, vue, js, files, pug]
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        images: path.resolve(__dirname, "src/images")
      },
      extensions: ["*", ".js", ".vue", ".json"]
    },
    devServer: {
      historyApiFallback: true,
      noInfo: false,
      overlay: true
    },
    performance: {
      hints: false
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "src/index.pug",
        chunks: ["main"]
      }),
      new HtmlWebpackPlugin({
        template: "src/admin/index.pug",
        filename: "admin/index.html",
        chunks: ["admin"]
      }),
      // new SpriteLoaderPlugin({ plainSprite: true }),
      new VueLoaderPlugin()
    ],
    devtool: "#eval-source-map"
  };

  if (isProductionBuild) {
    config.devtool = "none";
    config.plugins = (config.plugins || []).concat([
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: '"production"'
        }
      }),
      new MiniCssExtractPlugin({
        // filename: "[name].[contenthash].css",
        filename: "[name].min.css",
        // chunkFilename: "[contenthash].css"
        chunkFilename: "min.css"
      })
    ]);

    config.optimization = {};

    config.optimization.minimizer = [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin({})
    ];
  }

  return config;
};
