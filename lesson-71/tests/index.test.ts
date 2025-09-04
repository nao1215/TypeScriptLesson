// Lesson 71: Next.js セットアップとプロジェクト構造 - テスト

import {
  projectStructure,
  nextConfig,
  appRouterFiles,
  determineComponentType,
  generateRouteFromFilePath,
  generateCreateNextAppCommand,
  validateProjectStructure,
  type ComponentInfo,
  type ProjectSetup
} from '../src/solution';

describe('Lesson 71: Next.js セットアップとプロジェクト構造', () => {
  describe('プロジェクト構造', () => {
    test('正しいディレクトリ名が設定されている', () => {
      expect(projectStructure.appDirectory).toBe('app');
      expect(projectStructure.componentsDirectory).toBe('components');
      expect(projectStructure.publicDirectory).toBe('public');
      expect(projectStructure.libDirectory).toBe('lib');
    });
  });

  describe('Next.js設定', () => {
    test('基本的な設定が正しく設定されている', () => {
      expect(nextConfig.typescript).toBe(true);
      expect(nextConfig.eslint).toBe(true);
      expect(nextConfig.reactStrictMode).toBe(true);
      expect(nextConfig.images?.domains).toContain('localhost');
    });
  });

  describe('App Routerファイル規則', () => {
    test('主要なファイルの役割が定義されている', () => {
      expect(appRouterFiles['page.tsx']).toContain('ルートのUI');
      expect(appRouterFiles['layout.tsx']).toContain('共有されるUI');
      expect(appRouterFiles['loading.tsx']).toContain('ローディング');
      expect(appRouterFiles['error.tsx']).toContain('エラー');
      expect(appRouterFiles['route.ts']).toContain('API');
    });
  });

  describe('コンポーネントタイプ判定', () => {
    test('use clientディレクティブがある場合はClient Component', () => {
      const component: ComponentInfo = {
        name: 'TestComponent',
        hasUseClient: true,
        usesHooks: false,
        usesEventHandlers: false
      };
      expect(determineComponentType(component)).toBe('client');
    });

    test('Hooksを使用している場合はClient Component', () => {
      const component: ComponentInfo = {
        name: 'TestComponent',
        hasUseClient: false,
        usesHooks: true,
        usesEventHandlers: false
      };
      expect(determineComponentType(component)).toBe('client');
    });

    test('イベントハンドラーを使用している場合はClient Component', () => {
      const component: ComponentInfo = {
        name: 'TestComponent',
        hasUseClient: false,
        usesHooks: false,
        usesEventHandlers: true
      };
      expect(determineComponentType(component)).toBe('client');
    });

    test('何も該当しない場合はServer Component', () => {
      const component: ComponentInfo = {
        name: 'TestComponent',
        hasUseClient: false,
        usesHooks: false,
        usesEventHandlers: false
      };
      expect(determineComponentType(component)).toBe('server');
    });
  });

  describe('ルート生成', () => {
    test('ルートページのパスが正しく変換される', () => {
      expect(generateRouteFromFilePath('app/page.tsx')).toBe('/');
    });

    test('aboutページのパスが正しく変換される', () => {
      expect(generateRouteFromFilePath('app/about/page.tsx')).toBe('/about');
    });

    test('ネストしたページのパスが正しく変換される', () => {
      expect(generateRouteFromFilePath('app/blog/posts/page.tsx')).toBe('/blog/posts');
    });

    test('動的ルートが正しく変換される', () => {
      expect(generateRouteFromFilePath('app/blog/[slug]/page.tsx')).toBe('/blog/[slug]');
    });
  });

  describe('プロジェクト作成コマンド生成', () => {
    test('全オプションが有効な場合', () => {
      const setup: ProjectSetup = {
        name: 'my-app',
        typescript: true,
        tailwind: true,
        eslint: true,
        appRouter: true
      };
      const command = generateCreateNextAppCommand(setup);
      expect(command).toContain('npx create-next-app@latest my-app');
      expect(command).toContain('--typescript');
      expect(command).toContain('--tailwind');
      expect(command).toContain('--eslint');
      expect(command).toContain('--app');
    });

    test('最小限のオプションの場合', () => {
      const setup: ProjectSetup = {
        name: 'simple-app',
        typescript: false,
        tailwind: false,
        eslint: false,
        appRouter: false
      };
      const command = generateCreateNextAppCommand(setup);
      expect(command).toBe('npx create-next-app@latest simple-app ');
    });
  });

  describe('プロジェクト構造の検証', () => {
    test('必要なファイルがすべて存在する場合はtrue', () => {
      const files = [
        'package.json',
        'next.config.js',
        'tsconfig.json',
        'app/layout.tsx',
        'app/page.tsx'
      ];
      expect(validateProjectStructure(files)).toBe(true);
    });

    test('必要なファイルが不足している場合はfalse', () => {
      const files = [
        'package.json',
        'next.config.js'
        // tsconfig.json, app/layout.tsx, app/page.tsx が不足
      ];
      expect(validateProjectStructure(files)).toBe(false);
    });
  });
});