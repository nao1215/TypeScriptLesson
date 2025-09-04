/**
 * Lesson 61: webpack設定 (Webpack Configuration)
 * 
 * TypeScriptプロジェクト用の完全なwebpack設定システム
 */

// ===== 型定義 =====

/**
 * webpack設定の基本型定義
 */
interface WebpackConfig {
  mode: 'development' | 'production' | 'none';
  entry: string | string[] | Record<string, string | string[]>;
  output: {
    path: string;
    filename: string;
    publicPath: string;
    clean: boolean;
    chunkFilename?: string;
    assetModuleFilename?: string;
  };
  resolve: {
    extensions: string[];
    alias: Record<string, string>;
    modules: string[];
    mainFields?: string[];
  };
  module: {
    rules: WebpackRule[];
  };
  plugins: WebpackPlugin[];
  optimization: OptimizationConfig;
  devServer?: DevServerConfig;
  externals?: ExternalsConfig;
  target?: string | string[];
  stats?: StatsConfig;
  cache?: CacheConfig;
}

/**
 * ローダー設定型
 */
interface WebpackRule {
  test: RegExp;
  use: string | LoaderConfig | (string | LoaderConfig)[];
  exclude?: RegExp | string | (RegExp | string)[];
  include?: RegExp | string | (RegExp | string)[];
  type?: 'asset' | 'asset/resource' | 'asset/inline' | 'asset/source';
  generator?: {
    filename?: string;
  };
  parser?: {
    dataUrlCondition?: {
      maxSize: number;
    };
  };
}

/**
 * ローダー詳細設定型
 */
interface LoaderConfig {
  loader: string;
  options?: Record<string, any>;
}

/**
 * プラグイン型（簡略化）
 */
interface WebpackPlugin {
  apply(compiler: any): void;
  [key: string]: any;
}

/**
 * 最適化設定型
 */
interface OptimizationConfig {
  minimize: boolean;
  minimizer: WebpackPlugin[];
  splitChunks: {
    chunks: 'all' | 'async' | 'initial';
    cacheGroups: Record<string, CacheGroupConfig>;
    minSize?: number;
    maxSize?: number;
    minChunks?: number;
    maxAsyncRequests?: number;
    maxInitialRequests?: number;
  };
  runtimeChunk: boolean | 'single' | 'multiple' | { name: string };
  usedExports: boolean;
  sideEffects: boolean;
  moduleIds: 'natural' | 'named' | 'deterministic' | 'size';
  chunkIds: 'natural' | 'named' | 'deterministic' | 'size';
}

/**
 * キャッシュグループ設定型
 */
interface CacheGroupConfig {
  test?: RegExp | string | Function;
  name?: string | Function;
  chunks?: 'all' | 'async' | 'initial';
  minSize?: number;
  maxSize?: number;
  priority?: number;
  reuseExistingChunk?: boolean;
  enforce?: boolean;
  idHint?: string;
}

/**
 * 開発サーバー設定型
 */
interface DevServerConfig {
  port: number;
  host: string;
  hot: boolean;
  liveReload: boolean;
  historyApiFallback: boolean | { index: string };
  compress: boolean;
  https: boolean;
  proxy: Record<string, string | ProxyConfig>;
  static: string | { directory: string; publicPath: string };
  devMiddleware: {
    writeToDisk: boolean;
    stats: string;
  };
  client: {
    logging: string;
    overlay: boolean;
    progress: boolean;
  };
}

/**
 * プロキシ設定型
 */
interface ProxyConfig {
  target: string;
  changeOrigin: boolean;
  pathRewrite?: Record<string, string>;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
}

/**
 * 外部依存関係設定型
 */
interface ExternalsConfig {
  [key: string]: string | boolean | { [key: string]: string };
}

/**
 * 統計出力設定型
 */
interface StatsConfig {
  preset?: 'errors-only' | 'minimal' | 'normal' | 'verbose';
  assets: boolean;
  modules: boolean;
  chunks: boolean;
  colors: boolean;
  hash: boolean;
  version: boolean;
  timings: boolean;
  builtAt: boolean;
}

/**
 * キャッシュ設定型
 */
interface CacheConfig {
  type: 'memory' | 'filesystem';
  buildDependencies?: {
    config: string[];
    [key: string]: string[];
  };
  cacheDirectory?: string;
  name?: string;
  version?: string;
}

/**
 * TypeScript設定型
 */
interface TypeScriptLoaderConfig {
  configFile: string;
  transpileOnly: boolean;
  typeCheck: boolean;
  compilerOptions?: Record<string, any>;
  experimentalWatchApi?: boolean;
  onlyCompileBundledFiles?: boolean;
}

/**
 * 環境別設定型
 */
interface EnvironmentConfig {
  development: Partial<WebpackConfig>;
  production: Partial<WebpackConfig>;
  test: Partial<WebpackConfig>;
}

// ===== webpack設定ビルダー =====

/**
 * TypeScript対応webpack設定ビルダー
 */
class WebpackConfigBuilder {
  private config: Partial<WebpackConfig> = {};
  private environment: 'development' | 'production' | 'test' = 'development';

  constructor(environment: 'development' | 'production' | 'test' = 'development') {
    this.environment = environment;
    this.initializeDefaults();
  }

  /**
   * デフォルト設定の初期化
   */
  private initializeDefaults(): void {
    this.config = {
      mode: this.environment === 'test' ? 'development' : this.environment,
      entry: './src/index.ts',
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {},
        modules: ['node_modules']
      },
      module: {
        rules: []
      },
      plugins: [],
      optimization: {
        minimize: this.environment === 'production',
        minimizer: [],
        splitChunks: {
          chunks: 'all',
          cacheGroups: {}
        },
        runtimeChunk: false,
        usedExports: true,
        sideEffects: false,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic'
      },
      stats: {
        preset: 'normal',
        assets: true,
        modules: false,
        chunks: false,
        colors: true,
        hash: true,
        version: true,
        timings: true,
        builtAt: true
      },
      cache: {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        }
      }
    };
  }

  /**
   * エントリーポイントの設定
   */
  entry(entryConfig: string | string[] | Record<string, string | string[]>): this {
    this.config.entry = entryConfig;
    return this;
  }

  /**
   * 出力設定
   */
  output(outputConfig: Partial<WebpackConfig['output']>): this {
    this.config.output = {
      path: './dist',
      filename: '[name].[contenthash].js',
      publicPath: '/',
      clean: true,
      chunkFilename: '[name].[contenthash].chunk.js',
      ...outputConfig
    };
    return this;
  }

  /**
   * TypeScriptローダーの追加
   */
  typescript(tsConfig: Partial<TypeScriptLoaderConfig> = {}): this {
    const defaultTsConfig: TypeScriptLoaderConfig = {
      configFile: 'tsconfig.json',
      transpileOnly: this.environment === 'development',
      typeCheck: this.environment === 'production',
      experimentalWatchApi: true,
      onlyCompileBundledFiles: true
    };

    const finalTsConfig = { ...defaultTsConfig, ...tsConfig };

    this.addRule({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: finalTsConfig
        }
      ],
      exclude: /node_modules/
    });

    return this;
  }

  /**
   * CSSローダーの追加
   */
  css(options: { modules?: boolean; sourceMap?: boolean } = {}): this {
    const cssLoaders: LoaderConfig[] = [
      { loader: 'style-loader' },
      {
        loader: 'css-loader',
        options: {
          modules: options.modules || false,
          sourceMap: options.sourceMap || this.environment === 'development'
        }
      }
    ];

    this.addRule({
      test: /\.css$/,
      use: cssLoaders
    });

    return this;
  }

  /**
   * SCSSローダーの追加
   */
  scss(options: { modules?: boolean; sourceMap?: boolean } = {}): this {
    const scssLoaders: LoaderConfig[] = [
      { loader: 'style-loader' },
      {
        loader: 'css-loader',
        options: {
          modules: options.modules || false,
          sourceMap: options.sourceMap || this.environment === 'development'
        }
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: options.sourceMap || this.environment === 'development'
        }
      }
    ];

    this.addRule({
      test: /\\.s[ac]ss$/i,
      use: scssLoaders
    });

    return this;
  }

  /**
   * 画像ローダーの追加
   */
  images(options: { limit?: number; outputPath?: string } = {}): this {
    this.addRule({
      test: /\\.(png|jpg|jpeg|gif|svg)$/i,
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize: options.limit || 8 * 1024 // 8KB
        }
      },
      generator: {
        filename: options.outputPath || 'images/[name].[hash][ext]'
      }
    });

    return this;
  }

  /**
   * フォントローダーの追加
   */
  fonts(options: { outputPath?: string } = {}): this {
    this.addRule({
      test: /\\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: options.outputPath || 'fonts/[name].[hash][ext]'
      }
    });

    return this;
  }

  /**
   * ルールの追加
   */
  addRule(rule: WebpackRule): this {
    if (!this.config.module) {
      this.config.module = { rules: [] };
    }
    this.config.module.rules.push(rule);
    return this;
  }

  /**
   * プラグインの追加
   */
  addPlugin(plugin: WebpackPlugin): this {
    if (!this.config.plugins) {
      this.config.plugins = [];
    }
    this.config.plugins.push(plugin);
    return this;
  }

  /**
   * HTMLプラグインの追加
   */
  html(options: { template?: string; filename?: string; title?: string } = {}): this {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    
    this.addPlugin(new HtmlWebpackPlugin({
      template: options.template || 'src/index.html',
      filename: options.filename || 'index.html',
      title: options.title || 'TypeScript App',
      inject: 'body',
      minify: this.environment === 'production' ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      } : false
    }));

    return this;
  }

  /**
   * コード分割の設定
   */
  codeSplitting(options: {
    vendor?: boolean;
    common?: boolean;
    async?: boolean;
  } = {}): this {
    const cacheGroups: Record<string, CacheGroupConfig> = {};

    if (options.vendor !== false) {
      cacheGroups.vendor = {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
        reuseExistingChunk: true
      };
    }

    if (options.common !== false) {
      cacheGroups.common = {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5,
        reuseExistingChunk: true
      };
    }

    if (options.async !== false) {
      cacheGroups.async = {
        chunks: 'async',
        minChunks: 1,
        priority: 1
      };
    }

    if (this.config.optimization) {
      this.config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups,
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30
      };

      if (this.environment === 'production') {
        this.config.optimization.runtimeChunk = 'single';
      }
    }

    return this;
  }

  /**
   * 開発サーバーの設定
   */
  devServer(options: Partial<DevServerConfig> = {}): this {
    if (this.environment === 'development') {
      this.config.devServer = {
        port: 3000,
        host: 'localhost',
        hot: true,
        liveReload: true,
        historyApiFallback: true,
        compress: true,
        https: false,
        proxy: {},
        static: {
          directory: './public',
          publicPath: '/'
        },
        devMiddleware: {
          writeToDisk: false,
          stats: 'minimal'
        },
        client: {
          logging: 'info',
          overlay: true,
          progress: true
        },
        ...options
      };
    }

    return this;
  }

  /**
   * 本番環境最適化
   */
  productionOptimization(): this {
    if (this.environment === 'production') {
      // Terser で JavaScript を圧縮
      const TerserPlugin = require('terser-webpack-plugin');
      
      // CSS 最適化
      const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

      if (this.config.optimization) {
        this.config.optimization.minimize = true;
        this.config.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info']
              },
              mangle: true,
              format: {
                comments: false
              }
            },
            extractComments: false
          }),
          new CssMinimizerPlugin({
            minimizerOptions: {
              preset: ['default', { discardComments: { removeAll: true } }]
            }
          })
        ];
      }

      // Bundle Analyzer プラグインの追加（オプション）
      if (process.env.ANALYZE) {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
        this.addPlugin(new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html'
        }));
      }
    }

    return this;
  }

  /**
   * ソースマップの設定
   */
  sourceMap(type?: string): this {
    if (this.environment === 'development') {
      this.config.devtool = type || 'eval-source-map';
    } else if (this.environment === 'production') {
      this.config.devtool = type || 'source-map';
    }

    return this;
  }

  /**
   * エイリアスの設定
   */
  alias(aliases: Record<string, string>): this {
    if (this.config.resolve) {
      this.config.resolve.alias = {
        ...this.config.resolve.alias,
        ...aliases
      };
    }

    return this;
  }

  /**
   * 外部依存関係の設定
   */
  externals(externals: ExternalsConfig): this {
    this.config.externals = externals;
    return this;
  }

  /**
   * パフォーマンス設定
   */
  performance(options: {
    maxEntrypointSize?: number;
    maxAssetSize?: number;
    hints?: 'warning' | 'error' | false;
  } = {}): this {
    this.config.performance = {
      maxEntrypointSize: options.maxEntrypointSize || 250000,
      maxAssetSize: options.maxAssetSize || 250000,
      hints: options.hints || (this.environment === 'production' ? 'warning' : false)
    };

    return this;
  }

  /**
   * 環境変数プラグインの追加
   */
  environmentVariables(variables: Record<string, any>): this {
    const webpack = require('webpack');
    
    this.addPlugin(new webpack.DefinePlugin({
      'process.env': JSON.stringify(variables)
    }));

    return this;
  }

  /**
   * PWA サポート
   */
  pwa(options: {
    swSrc?: string;
    swDest?: string;
    generateSW?: boolean;
  } = {}): this {
    if (this.environment === 'production') {
      const WorkboxPlugin = require('workbox-webpack-plugin');
      
      if (options.generateSW !== false) {
        this.addPlugin(new WorkboxPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [{
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offlineCache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 86400
              }
            }
          }]
        }));
      } else if (options.swSrc) {
        this.addPlugin(new WorkboxPlugin.InjectManifest({
          swSrc: options.swSrc,
          swDest: options.swDest || 'sw.js'
        }));
      }
    }

    return this;
  }

  /**
   * 設定の構築
   */
  build(): WebpackConfig {
    // 本番環境の場合は自動で最適化を適用
    if (this.environment === 'production') {
      this.productionOptimization();
    }

    return this.config as WebpackConfig;
  }

  /**
   * 設定のJSONエクスポート
   */
  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }
}

// ===== カスタムローダー作成ユーティリティ =====

/**
 * カスタムローダー作成ヘルパー
 */
class CustomLoaderBuilder {
  /**
   * TypeScript デコレータ処理ローダー
   */
  static createDecoratorLoader(options: {
    experimentalDecorators?: boolean;
    emitDecoratorMetadata?: boolean;
  } = {}): string {
    return `
      module.exports = function(source) {
        const callback = this.async();
        const ts = require('typescript');
        
        const compilerOptions = {
          experimentalDecorators: ${options.experimentalDecorators || true},
          emitDecoratorMetadata: ${options.emitDecoratorMetadata || true},
          target: ts.ScriptTarget.ES2018,
          module: ts.ModuleKind.ESNext
        };
        
        const result = ts.transpile(source, compilerOptions, this.resourcePath);
        callback(null, result);
      };
    `;
  }

  /**
   * バンドル情報注入ローダー
   */
  static createBundleInfoLoader(): string {
    return `
      module.exports = function(source) {
        const bundleInfo = {
          buildTime: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        };
        
        const injected = source.replace(
          '__BUNDLE_INFO__',
          JSON.stringify(bundleInfo)
        );
        
        return injected;
      };
    `;
  }
}

// ===== カスタムプラグイン作成ユーティリティ =====

/**
 * バンドル統計プラグイン
 */
class BundleStatsPlugin implements WebpackPlugin {
  private options: {
    filename: string;
    detailed: boolean;
  };

  constructor(options: { filename?: string; detailed?: boolean } = {}) {
    this.options = {
      filename: options.filename || 'bundle-stats.json',
      detailed: options.detailed || false
    };
  }

  apply(compiler: any): void {
    compiler.hooks.emit.tapAsync('BundleStatsPlugin', (compilation: any, callback: Function) => {
      const stats = compilation.getStats().toJson({
        all: false,
        assets: true,
        chunks: this.options.detailed,
        modules: this.options.detailed,
        entrypoints: true,
        timings: true,
        hash: true
      });

      const statsJson = JSON.stringify(stats, null, 2);
      
      compilation.assets[this.options.filename] = {
        source: () => statsJson,
        size: () => statsJson.length
      };

      callback();
    });
  }
}

/**
 * TypeScript 型チェックプラグイン
 */
class TypeScriptTypeCheckPlugin implements WebpackPlugin {
  private configPath: string;
  private failOnError: boolean;

  constructor(options: { configPath?: string; failOnError?: boolean } = {}) {
    this.configPath = options.configPath || 'tsconfig.json';
    this.failOnError = options.failOnError || false;
  }

  apply(compiler: any): void {
    compiler.hooks.beforeCompile.tapAsync('TypeScriptTypeCheckPlugin', async (params: any, callback: Function) => {
      try {
        const ts = require('typescript');
        const path = require('path');
        
        const configPath = path.resolve(this.configPath);
        const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
        
        if (configFile.error) {
          throw new Error(`TypeScript config error: ${configFile.error.messageText}`);
        }
        
        const parsedConfig = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(configPath)
        );
        
        const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
        const diagnostics = ts.getPreEmitDiagnostics(program);
        
        if (diagnostics.length > 0) {
          const formatHost = {
            getCanonicalFileName: (path: string) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine
          };
          
          const errorMessage = ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
          
          if (this.failOnError) {
            callback(new Error(`TypeScript errors found:\\n${errorMessage}`));
            return;
          } else {
            console.warn(`TypeScript warnings:\\n${errorMessage}`);
          }
        }
        
        callback();
      } catch (error) {
        callback(error);
      }
    });
  }
}

// ===== プリセット設定 =====

/**
 * よく使われる設定のプリセット
 */
class WebpackPresets {
  /**
   * React + TypeScript プリセット
   */
  static reactTypeScript(environment: 'development' | 'production' = 'development'): WebpackConfig {
    return new WebpackConfigBuilder(environment)
      .entry('./src/index.tsx')
      .output({
        path: './dist',
        filename: '[name].[contenthash].js',
        publicPath: '/'
      })
      .typescript({
        configFile: 'tsconfig.json',
        transpileOnly: environment === 'development'
      })
      .addRule({
        test: /\\.jsx?$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }],
        exclude: /node_modules/
      })
      .css({ modules: true })
      .scss({ modules: true })
      .images()
      .fonts()
      .html({ template: 'src/index.html' })
      .codeSplitting()
      .devServer({ port: 3000, hot: true })
      .sourceMap()
      .alias({
        '@': './src',
        '@components': './src/components',
        '@utils': './src/utils'
      })
      .environmentVariables({
        NODE_ENV: environment,
        BUILD_TIME: new Date().toISOString()
      })
      .performance({
        maxEntrypointSize: 300000,
        maxAssetSize: 300000
      })
      .build();
  }

  /**
   * Node.js ライブラリプリセット
   */
  static nodeLibrary(environment: 'development' | 'production' = 'production'): WebpackConfig {
    return new WebpackConfigBuilder(environment)
      .entry('./src/index.ts')
      .output({
        path: './lib',
        filename: 'index.js',
        library: {
          type: 'commonjs2'
        }
      })
      .typescript({
        configFile: 'tsconfig.json',
        transpileOnly: false,
        typeCheck: true
      })
      .externals({
        // Node.js built-in modules
        'fs': 'commonjs fs',
        'path': 'commonjs path',
        'util': 'commonjs util',
        'crypto': 'commonjs crypto'
      })
      .alias({
        '@': './src'
      })
      .build();
  }

  /**
   * Electron アプリプリセット
   */
  static electronApp(target: 'main' | 'renderer', environment: 'development' | 'production' = 'development'): WebpackConfig {
    const builder = new WebpackConfigBuilder(environment);
    
    if (target === 'main') {
      return builder
        .entry('./src/main.ts')
        .output({
          path: './dist',
          filename: 'main.js'
        })
        .typescript()
        .externals({
          electron: 'commonjs electron'
        })
        .build();
    } else {
      return builder
        .entry('./src/renderer.tsx')
        .output({
          path: './dist',
          filename: 'renderer.js'
        })
        .typescript()
        .css()
        .scss()
        .images()
        .fonts()
        .html({ template: 'src/renderer.html' })
        .externals({
          electron: 'commonjs electron'
        })
        .build();
    }
  }
}

// ===== 使用例とデモ =====

/**
 * webpack設定のデモンストレーション
 */
function demonstrateWebpackConfig(): void {
  console.log('=== Webpack Configuration Demo ===');

  // 1. 基本的な開発環境設定
  console.log('\\n1. Development Configuration:');
  const devConfig = new WebpackConfigBuilder('development')
    .entry('./src/index.ts')
    .output({
      path: './dist',
      filename: '[name].js',
      publicPath: '/'
    })
    .typescript()
    .css()
    .images()
    .html()
    .devServer()
    .sourceMap()
    .build();

  console.log('Development config created with', Object.keys(devConfig).length, 'properties');

  // 2. 本番環境設定
  console.log('\\n2. Production Configuration:');
  const prodConfig = new WebpackConfigBuilder('production')
    .entry('./src/index.ts')
    .output({
      path: './dist',
      filename: '[name].[contenthash].js',
      publicPath: '/'
    })
    .typescript({ transpileOnly: false })
    .css()
    .images()
    .fonts()
    .html()
    .codeSplitting()
    .sourceMap()
    .performance()
    .build();

  console.log('Production config created with optimizations');

  // 3. React プリセット
  console.log('\\n3. React TypeScript Preset:');
  const reactConfig = WebpackPresets.reactTypeScript('development');
  console.log('React preset generated with entry:', reactConfig.entry);

  // 4. カスタムプラグインの使用例
  console.log('\\n4. Custom Plugin Usage:');
  const configWithPlugins = new WebpackConfigBuilder('production')
    .typescript()
    .addPlugin(new BundleStatsPlugin({ filename: 'my-stats.json', detailed: true }))
    .addPlugin(new TypeScriptTypeCheckPlugin({ failOnError: true }))
    .build();

  console.log('Config with custom plugins created');

  // 5. 設定のエクスポート例
  console.log('\\n5. Configuration Export:');
  const exportableConfig = new WebpackConfigBuilder('production')
    .typescript()
    .css()
    .codeSplitting()
    .toJSON();

  console.log('Configuration exported as JSON:', exportableConfig.length, 'characters');

  console.log('\\nWebpack configuration demo completed!');
}

// ===== エクスポート =====

export {
  WebpackConfigBuilder,
  CustomLoaderBuilder,
  BundleStatsPlugin,
  TypeScriptTypeCheckPlugin,
  WebpackPresets,
  demonstrateWebpackConfig,
  type WebpackConfig,
  type WebpackRule,
  type LoaderConfig,
  type OptimizationConfig,
  type DevServerConfig,
  type TypeScriptLoaderConfig,
  type EnvironmentConfig
};

// デモの実行
if (require.main === module) {
  demonstrateWebpackConfig();
}