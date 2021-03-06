const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  chainWebpack: (config) => {
    config.plugins.delete('fork-ts-checker');
    config.module.rule('wasm')
    .test(/\.node$/)
    .use('node-loader')
    .loader('node-loader')
    .end()
    .rule('wasm')
    .test(/\.wasm$/)
    .use('wasm-loader')
    .loader('wasm-loader')
    .end()    
  },
  devServer: {
    disableHostCheck: true,
  },
  transpileDependencies: ['vuetify'],
  pluginOptions: {
  
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
  publicPath: './',
  // chunkFilename: '[name].js',
  configureWebpack: {
    // entry: {
    //   app: [
    //     './src/main.ts'
    //   ]
    // },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            name: 'vendors',
            test: /[\\\/]node_modules[\\\/]/,
            priority: -10,
            chunks: 'initial',
            minChunks: 1,
            maxSize: 1000000000000000000,
            minSize: 2000000000,
          },
          common: {
            name: 'common',
            minChunks: 1,
            minSize: 2000000000,
            maxSize: 1000000000000000000,
            priority: -20,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
        },
      },
    },
  },
};
