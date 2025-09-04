// Lesson 71: Next.js セットアップとプロジェクト構造 - 演習問題

/**
 * 演習 1: Next.jsプロジェクト構造の理解
 * 
 * 以下のインターフェースを完成させて、Next.jsプロジェクトの
 * 基本的な構造を表現してください
 */

interface NextJSProjectStructure {
  // App Routerのメインディレクトリ
  appDirectory: string;
  
  // 再利用可能なコンポーネント用ディレクトリ
  componentsDirectory: string;
  
  // 静的ファイル用ディレクトリ
  publicDirectory: string;
  
  // ユーティリティ関数用ディレクトリ
  libDirectory: string;
}

// TODO: 上記インターフェースを実装してください
export const projectStructure: NextJSProjectStructure = {
  appDirectory: '', // ここを埋めてください
  componentsDirectory: '', // ここを埋めてください
  publicDirectory: '', // ここを埋めてください
  libDirectory: '' // ここを埋めてください
};

/**
 * 演習 2: Next.js設定オブジェクト
 * 
 * next.config.jsで使用される設定オプションを表現する
 * インターフェースを作成してください
 */

interface NextJSConfig {
  // TypeScriptを有効にするかどうか
  typescript?: boolean;
  
  // ESLintを有効にするかどうか
  eslint?: boolean;
  
  // 厳密モード
  reactStrictMode?: boolean;
  
  // 画像の最適化設定
  images?: {
    domains: string[];
  };
}

// TODO: Next.jsの基本設定を作成してください
export const nextConfig: NextJSConfig = {
  // ここに設定を記述してください
};

/**
 * 演習 3: App Routerのファイル規則
 * 
 * App Routerで使用される特別なファイル名とその役割を
 * マッピングするオブジェクトを作成してください
 */

type AppRouterFiles = {
  [fileName: string]: string; // ファイル名 -> 役割の説明
};

// TODO: App Routerの特別なファイルとその役割をマッピングしてください
export const appRouterFiles: AppRouterFiles = {
  // 例: 'page.tsx': 'ルートのUIを定義する'
  // ここに他のファイルを追加してください
};

/**
 * 演習 4: Server ComponentとClient Componentの判定
 * 
 * コンポーネントがServer ComponentかClient Componentかを
 * 判定する関数を作成してください
 */

type ComponentType = 'server' | 'client';

interface ComponentInfo {
  name: string;
  hasUseClient: boolean;
  usesHooks: boolean;
  usesEventHandlers: boolean;
}

// TODO: コンポーネントの種類を判定する関数を実装してください
export function determineComponentType(component: ComponentInfo): ComponentType {
  // ヒント: 'use client'ディレクティブがある場合はClient Component
  // React Hooksやイベントハンドラーを使用している場合もClient Component
  
  // ここに実装を記述してください
  return 'server'; // デフォルト値
}

/**
 * 演習 5: ルーティング構造の生成
 * 
 * ファイルパスからNext.jsのルートを生成する関数を作成してください
 */

// TODO: ファイルパスからルートを生成する関数を実装してください
export function generateRouteFromFilePath(filePath: string): string {
  // 例:
  // 'app/about/page.tsx' -> '/about'
  // 'app/blog/[slug]/page.tsx' -> '/blog/[slug]'
  // 'app/page.tsx' -> '/'
  
  // ここに実装を記述してください
  return '/';
}