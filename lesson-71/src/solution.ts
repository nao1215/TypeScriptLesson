// Lesson 71: Next.js セットアップとプロジェクト構造 - 解答例

/**
 * 解答 1: Next.jsプロジェクト構造の理解
 */

interface NextJSProjectStructure {
  appDirectory: string;
  componentsDirectory: string;
  publicDirectory: string;
  libDirectory: string;
}

export const projectStructure: NextJSProjectStructure = {
  appDirectory: 'app',
  componentsDirectory: 'components',
  publicDirectory: 'public',
  libDirectory: 'lib'
};

/**
 * 解答 2: Next.js設定オブジェクト
 */

interface NextJSConfig {
  typescript?: boolean;
  eslint?: boolean;
  reactStrictMode?: boolean;
  images?: {
    domains: string[];
  };
}

export const nextConfig: NextJSConfig = {
  typescript: true,
  eslint: true,
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'example.com']
  }
};

/**
 * 解答 3: App Routerのファイル規則
 */

type AppRouterFiles = {
  [fileName: string]: string;
};

export const appRouterFiles: AppRouterFiles = {
  'page.tsx': 'ルートのUIを定義する',
  'layout.tsx': 'セグメント間で共有されるUIを定義する',
  'loading.tsx': 'ローディングUIを定義する',
  'error.tsx': 'エラーUIを定義する',
  'not-found.tsx': '404 Not FoundのUIを定義する',
  'route.ts': 'API エンドポイントを定義する',
  'template.tsx': '特別なレイアウトテンプレートを定義する',
  'default.tsx': '並列ルートのフォールバックを定義する'
};

/**
 * 解答 4: Server ComponentとClient Componentの判定
 */

type ComponentType = 'server' | 'client';

interface ComponentInfo {
  name: string;
  hasUseClient: boolean;
  usesHooks: boolean;
  usesEventHandlers: boolean;
}

export function determineComponentType(component: ComponentInfo): ComponentType {
  // 'use client'ディレクティブがある場合
  if (component.hasUseClient) {
    return 'client';
  }
  
  // React Hooksを使用している場合
  if (component.usesHooks) {
    return 'client';
  }
  
  // イベントハンドラーを使用している場合
  if (component.usesEventHandlers) {
    return 'client';
  }
  
  // デフォルトはServer Component
  return 'server';
}

/**
 * 解答 5: ルーティング構造の生成
 */

export function generateRouteFromFilePath(filePath: string): string {
  // 'app'ディレクトリを除去
  let route = filePath.replace(/^app\/?/, '');
  
  // 'page.tsx'を除去
  route = route.replace(/\/page\.(tsx|ts|jsx|js)$/, '');
  
  // 空の場合は'/'を返す
  if (!route) {
    return '/';
  }
  
  // 先頭に'/'を追加
  return '/' + route;
}

/**
 * 追加: プロジェクト作成ヘルパー関数
 */

export interface ProjectSetup {
  name: string;
  typescript: boolean;
  tailwind: boolean;
  eslint: boolean;
  appRouter: boolean;
}

export function generateCreateNextAppCommand(setup: ProjectSetup): string {
  const flags = [];
  
  if (setup.typescript) flags.push('--typescript');
  if (setup.tailwind) flags.push('--tailwind');
  if (setup.eslint) flags.push('--eslint');
  if (setup.appRouter) flags.push('--app');
  
  return `npx create-next-app@latest ${setup.name} ${flags.join(' ')}`;
}

/**
 * 追加: 開発環境チェック関数
 */

export interface DevEnvironment {
  nodeVersion: string;
  npmVersion: string;
  hasNext: boolean;
  hasReact: boolean;
  hasTypeScript: boolean;
}

export function checkDevEnvironment(): Partial<DevEnvironment> {
  // 実際の環境では process.version などを使用
  return {
    nodeVersion: '18.0.0', // 例
    npmVersion: '9.0.0',   // 例
    hasNext: true,
    hasReact: true,
    hasTypeScript: true
  };
}

/**
 * 追加: ファイル構造の検証
 */

export function validateProjectStructure(files: string[]): boolean {
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'app/layout.tsx',
    'app/page.tsx'
  ];
  
  return requiredFiles.every(file => files.includes(file));
}