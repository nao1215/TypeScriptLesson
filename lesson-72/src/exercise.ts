// Lesson 72: ページルーティングとナビゲーション - 演習問題

/**
 * 演習 1: ルート設定の理解
 * 
 * ファイルパスからURLパスを生成する関数を作成してください
 */

interface RouteConfig {
  filePath: string;
  urlPath: string;
  isDynamic: boolean;
  params?: string[];
}

// TODO: ファイルパスからルート設定を生成する関数を実装してください
export function generateRouteConfig(filePath: string): RouteConfig {
  // 例:
  // 'app/blog/[slug]/page.tsx' -> { urlPath: '/blog/[slug]', isDynamic: true, params: ['slug'] }
  // 'app/about/page.tsx' -> { urlPath: '/about', isDynamic: false }
  
  // ここに実装を記述してください
  return {
    filePath,
    urlPath: '/',
    isDynamic: false
  };
}

/**
 * 演習 2: ナビゲーションメニューの型定義
 * 
 * ナビゲーションメニューアイテムの型を定義してください
 */

interface NavigationItem {
  // ラベル
  label: string;
  
  // リンク先URL
  href: string;
  
  // アクティブかどうか
  active?: boolean;
  
  // 子メニュー
  children?: NavigationItem[];
}

// TODO: メインナビゲーションの設定を作成してください
export const mainNavigation: NavigationItem[] = [
  // ここにナビゲーションアイテムを追加してください
];

/**
 * 演習 3: 動的ルートのパラメータ抽出
 * 
 * 動的ルートからパラメータ名を抽出する関数を作成してください
 */

// TODO: 動的ルートからパラメータ名を抽出する関数を実装してください
export function extractParams(routePath: string): string[] {
  // 例:
  // '/blog/[slug]' -> ['slug']
  // '/blog/[category]/[slug]' -> ['category', 'slug']
  // '/shop/[...slug]' -> ['slug'] (catch-all)
  
  // ここに実装を記述してください
  return [];
}

/**
 * 演習 4: URL生成ヘルパー
 * 
 * テンプレートとパラメータからURLを生成する関数を作成してください
 */

// TODO: テンプレートとパラメータからURLを生成する関数を実装してください
export function generateUrl(template: string, params: Record<string, string>): string {
  // 例:
  // template: '/blog/[slug]', params: { slug: 'hello-world' } -> '/blog/hello-world'
  // template: '/user/[id]/posts/[postId]', params: { id: '123', postId: '456' } -> '/user/123/posts/456'
  
  // ここに実装を記述してください
  return template;
}

/**
 * 演習 5: パンくずリスト生成
 * 
 * 現在のパスからパンくずリストを生成する関数を作成してください
 */

interface BreadcrumbItem {
  label: string;
  href: string;
  current: boolean;
}

// TODO: パスからパンくずリストを生成する関数を実装してください
export function generateBreadcrumbs(
  currentPath: string,
  routeLabels: Record<string, string> = {}
): BreadcrumbItem[] {
  // 例:
  // currentPath: '/blog/posts/hello-world'
  // routeLabels: { '/blog': 'ブログ', '/blog/posts': '投稿一覧' }
  // 結果: [
  //   { label: 'ホーム', href: '/', current: false },
  //   { label: 'ブログ', href: '/blog', current: false },
  //   { label: '投稿一覧', href: '/blog/posts', current: false },
  //   { label: 'hello-world', href: '/blog/posts/hello-world', current: true }
  // ]
  
  // ここに実装を記述してください
  return [];
}

/**
 * 演習 6: ルートマッチング
 * 
 * 現在のパスが指定されたルートパターンにマッチするかを判定する関数を作成してください
 */

// TODO: パスがルートパターンにマッチするかを判定する関数を実装してください
export function matchRoute(path: string, pattern: string): boolean {
  // 例:
  // path: '/blog/hello-world', pattern: '/blog/[slug]' -> true
  // path: '/blog/posts/hello-world', pattern: '/blog/[slug]' -> false
  // path: '/shop/electronics/laptops', pattern: '/shop/[...slug]' -> true
  
  // ヒント: 正規表現を使用して動的セグメントを処理してください
  
  // ここに実装を記述してください
  return false;
}

/**
 * 演習 7: リダイレクト設定
 * 
 * リダイレクトルールを定義する型と、リダイレクトを実行する関数を作成してください
 */

interface RedirectRule {
  from: string;
  to: string;
  permanent: boolean;
}

// TODO: リダイレクトルールを定義してください
export const redirectRules: RedirectRule[] = [
  // 例: 古いブログURLから新しいURLへのリダイレクト
];

// TODO: リダイレクトが必要かチェックする関数を実装してください
export function checkRedirect(path: string): RedirectRule | null {
  // パスにマッチするリダイレクトルールがあるかチェック
  
  // ここに実装を記述してください
  return null;
}