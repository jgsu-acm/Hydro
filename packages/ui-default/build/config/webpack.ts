/* eslint-disable global-require */
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { ESBuildMinifyPlugin } from 'esbuild-loader';
import { DuplicatesPlugin } from 'inspectpack/plugin';
import ExtractCssPlugin from 'mini-css-extract-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { dirname } from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import WebpackBar from 'webpackbar';
import root from '../utils/root';

export default function (env: { watch?: boolean, production?: boolean, measure?: boolean } = {}) {
  function esbuildLoader() {
    return {
      loader: 'esbuild-loader',
      options: {
        loader: 'tsx',
        target: 'es2015',
        sourcemap: true,
      },
    };
  }

  function cssLoader() {
    return {
      loader: 'css-loader',
      options: { importLoaders: 1 },
    };
  }

  function postcssLoader() {
    return {
      loader: 'postcss-loader',
      options: { postcssOptions: { sourceMap: false, config: root('postcss.config.js') } },
    };
  }

  function extractCssLoader() {
    return {
      loader: ExtractCssPlugin.loader,
      // FIXME auto?
      options: {
        publicPath: '',
      },
    };
  }

  function stylusLoader() {
    return {
      loader: 'stylus-loader',
      options: {
        stylusOptions: {
          preferPathResolver: 'webpack',
          use: [require('rupture')()],
          import: ['~vj/common/common.inc.styl'],
        },
      },
    };
  }

  const config: import('webpack').Configuration = {
    // bail: !env.production,
    mode: (env.production || env.measure) ? 'production' : 'development',
    profile: env.measure,
    context: root(),
    stats: {
      preset: 'errors-warnings',
    },
    devtool: false,
    entry: {
      hydro: './entry.js',
      polyfill: './polyfill.ts',
      'default.theme': './theme/default.js',
      'service-worker': './service-worker.ts',
      'messages-shared-worker': './components/message/worker.ts',
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: root('../../.cache'),
      idleTimeout: 30000,
      buildDependencies: {
        config: [__filename],
      },
    },
    output: {
      path: root('public'),
      publicPath: '/', // overwrite in entry.js
      hashFunction: 'sha1',
      hashDigest: 'hex',
      hashDigestLength: 10,
      filename: '[name].js?[contenthash:6]',
      chunkFilename: '[name].[chunkhash:6].chunk.js',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.cjs'],
      alias: {
        vj: root(),
      },
    },
    module: {
      rules: [
        {
          test: /\.svg$/i,
          oneOf: [
            {
              issuer: /\.[jt]sx?$/,
              resourceQuery: /react/,
              use: { loader: '@svgr/webpack', options: { icon: true } },
            },
            {
              type: 'asset/resource',
            },
          ],
        },
        {
          resourceQuery: /inline/,
          type: 'asset/inline',
        },
        {
          test: /\.(ttf|eot|woff|woff2|png|jpg|jpeg|gif)$/,
          type: 'asset/resource',
          generator: {
            filename: (pathData) => {
              const p = pathData.module.resource.replace(/\\/g, '/');
              const filename = p.split('/').pop();
              if (p.includes('node_modules')) {
                const extra = p.split('node_modules/').pop();
                const moduleName = extra.split('/')[0];
                if (extra.includes('@fontsource')) {
                  return `fonts/${filename}?[hash:6]`;
                }
                if (['katex', 'monaco-editor'].includes(moduleName)) {
                  return `modules/${moduleName}/${filename}?[hash:6]`;
                }
                return `modules/${extra.substr(1)}?[hash:6]`;
              }
              if (p.includes('.iconfont')) return `${filename}?[hash:6]`;
              return `${p.split('ui-default')[1].substring(1)}?[hash:6]`;
            },
          },
        },
        {
          test: /\.ts$/,
          include: /@types\//,
          type: 'asset/inline',
          generator: {
            dataUrl: (buf) => buf.toString(),
          },
        },
        {
          test: /\.[mc]?[jt]sx?$/,
          exclude: [/@types\//, /components\/message\//, /entry\.js/],
          type: 'javascript/auto',
          use: [esbuildLoader()],
        },
        {
          test: /\.[mc]?[jt]sx?$/,
          include: [/components\/message\//, /entry\.js/],
          type: 'javascript/auto',
          use: [{
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          }],
        },
        {
          test: /\.styl$/,
          use: [extractCssLoader(), cssLoader(), postcssLoader(), stylusLoader()],
        },
        {
          test: /\.css$/,
          use: [extractCssLoader(), cssLoader(), postcssLoader()],
        },
      ],
    },
    experiments: {
      asyncWebAssembly: true,
      syncWebAssembly: true,
    },
    optimization: {
      splitChunks: {
        minSize: 256000,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '-',
        cacheGroups: {
          style: {
            priority: 99,
            name: 'theme',
            type: 'css/mini-extract',
            chunks: 'all',
            enforce: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/].+\.([jt]sx?|json|yaml)$/,
            priority: -10,
            name(module) {
              const packageName = module.context.replace(/\\/g, '/').split('node_modules/').pop().split('/')[0];
              if (packageName === 'monaco-editor-nls') {
                return `i.monaco.${module.userRequest.split('/').pop().split('.')[0]}`;
              }
              return `n.${packageName.replace('@', '')}`;
            },
            reuseExistingChunk: true,
          },
          default: {
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      usedExports: true,
      minimizer: [new ESBuildMinifyPlugin({
        css: true,
        minify: true,
        minifySyntax: true,
        minifyWhitespace: true,
        minifyIdentifiers: true,
        treeShaking: true,
        target: [
          'chrome60',
        ],
        exclude: [/mathmaps/, /\.min\.js$/],
      })],
      moduleIds: env.production ? 'deterministic' : 'named',
      chunkIds: env.production ? 'deterministic' : 'named',
    },
    plugins: [
      new CleanWebpackPlugin(),
      new WebpackBar(),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        React: 'react',
        monaco: 'monaco-editor/esm/vs/editor/editor.api',
      }),
      new ExtractCssPlugin({
        filename: '[name].css?[fullhash:6]',
      }),
      new WebpackManifestPlugin({}),
      new DuplicatesPlugin(),
      new webpack.IgnorePlugin({ resourceRegExp: /(^\.\/locale$|mathjax|abcjs|vditor.+\.d\.ts)/ }),
      new CopyWebpackPlugin({
        patterns: [
          { from: root('static') },
          { from: root('components/navigation/nav-logo-small_dark.png'), to: 'components/navigation/nav-logo-small_dark.png' },
          { from: root(`${dirname(require.resolve('streamsaver/package.json'))}/mitm.html`), to: 'streamsaver/mitm.html' },
          { from: root(`${dirname(require.resolve('streamsaver/package.json'))}/sw.js`), to: 'streamsaver/sw.js' },
          { from: root(`${dirname(require.resolve('vditor/package.json'))}/dist`), to: 'vditor/dist' },
          { from: root(`${dirname(require.resolve('graphiql/package.json'))}/graphiql.min.css`), to: 'graphiql.min.css' },
          { from: `${dirname(require.resolve('monaco-themes/package.json'))}/themes`, to: 'monaco/themes/' },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env.VERSION': JSON.stringify(require('@hydrooj/ui-default/package.json').version),
      }),
      new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 128000,
      }),
      new webpack.NormalModuleReplacementPlugin(/\/(vscode-)?nls\.js/, require.resolve('../../components/monaco/nls')),
      new MonacoWebpackPlugin({
        filename: '[name].[hash:6].worker.js',
        customLanguages: [{
          label: 'yaml',
          entry: require.resolve('monaco-yaml/index.js'),
          worker: {
            id: 'vs/language/yaml/yamlWorker',
            entry: require.resolve('monaco-yaml/yaml.worker.js'),
          },
        }],
      }),
      ...env.measure ? [new BundleAnalyzerPlugin({ analyzerPort: 'auto' })] : [],
    ],
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };

  return config;
}
