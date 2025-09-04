// Lesson 72: ページルーティングとナビゲーション - 解答例

/**
 * 解答 1: ルート設定の理解
 */

interface RouteConfig {
  filePath: string;
  urlPath: string;
  isDynamic: boolean;
  params?: string[];
}

export function generateRouteConfig(filePath: string): RouteConfig {
  // 'app'を除去し、'page.tsx'を除去
  let urlPath = filePath
    .replace(/^app\/?/, '')
    .replace(/\/page\.(tsx|ts|jsx|js)$/, '');
  
  // 空の場合は'/'
  if (!urlPath) {
    urlPath = '/';
  } else {
    urlPath = '/' + urlPath;
  }
  
  // 動的セグメントをチェック
  const isDynamic = /\[.*\]/.test(urlPath);
  const params: string[] = [];
  
  if (isDynamic) {
    // [slug], [...slug], [[...slug]]などを抽出
    const matches = urlPath.match(/\[(\.\.\.)?(\.\.\.)?([^\]]+)\]/g);
    if (matches) {
      params.push(...matches.map(match => {
        // [...slug] -> slug, [slug] -> slug
        return match.replace(/\[(\.\.\.)?([^\]]+)\]/, '$2');
      }));
    }
  }
  
  return {
    filePath,
    urlPath,
    isDynamic,
    params: params.length > 0 ? params : undefined
  };
}

/**
 * 解答 2: ナビゲーションメニューの型定義
 */

interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  children?: NavigationItem[];
}

export const mainNavigation: NavigationItem[] = [
  {
    label: 'ホーム',
    href: '/'
  },
  {
    label: 'ブログ',
    href: '/blog',
    children: [
      { label: '最新記事', href: '/blog/latest' },
      { label: 'カテゴリ', href: '/blog/categories' },
      { label: 'アーカイブ', href: '/blog/archive' }
    ]
  },
  {
    label: 'サービス',
    href: '/services',
    children: [
      { label: 'Web開発', href: '/services/web-development' },
      { label: 'コンサルティング', href: '/services/consulting' },
      { label: 'サポート', href: '/services/support' }
    ]
  },
  {
    label: '会社概要',
    href: '/about'
  },
  {
    label: 'お問い合わせ',
    href: '/contact'
  }
];

/**
 * 解答 3: 動的ルートのパラメータ抽出
 */

export function extractParams(routePath: string): string[] {
  const params: string[] = [];
  
  // 正規表現で動的セグメントを抽出
  const dynamicSegments = routePath.match(/\[([^\]]+)\]/g);
  
  if (dynamicSegments) {
    params.push(...dynamicSegments.map(segment => {
      // [...slug] -> slug, [slug] -> slug, [[...slug]] -> slug
      return segment.replace(/\[(\.\.\.)?(\.\.\.)?([^\]]+)\]/, '$3');
    }));
  }
  
  return params;
}

/**
 * 解答 4: URL生成ヘルパー
 */

export function generateUrl(template: string, params: Record<string, string>): string {
  let url = template;
  
  // 動的セグメントを実際の値に置換
  Object.entries(params).forEach(([key, value]) => {
    // [key] または [...key] または [[...key]] を value に置換
    const patterns = [
      `\\[\\.\\.\\.${key}\\]`,
      `\\[${key}\\]`,
      `\\[\\[\\.\\.\\.${key}\\]\\]`
    ];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'g');
      url = url.replace(regex, value);
    });
  });
  
  return url;
}

/**
 * 解答 5: パンくずリスト生成
 */

interface BreadcrumbItem {
  label: string;
  href: string;
  current: boolean;
}

export function generateBreadcrumbs(
  currentPath: string,
  routeLabels: Record<string, string> = {}
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // ホームを最初に追加
  breadcrumbs.push({
    label: routeLabels['/'] || 'ホーム',
    href: '/',
    current: currentPath === '/'
  });
  
  if (currentPath === '/') {
    return breadcrumbs;
  }
  
  // パスを分割して段階的にパンくずを構築
  const segments = currentPath.split('/').filter(Boolean);
  let currentHref = '';
  
  segments.forEach((segment, index) => {
    currentHref += '/' + segment;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label: routeLabels[currentHref] || segment,
      href: currentHref,
      current: isLast
    });
  });
  
  return breadcrumbs;
}

/**
 * 解答 6: ルートマッチング
 */

export function matchRoute(path: string, pattern: string): boolean {
  // パターンを正規表現に変換
  let regexPattern = pattern
    // [...slug] (catch-all) -> (.+)
    .replace(/\[\.\.\.([^\]]+)\]/g, '(.+)')
    // [slug] (dynamic) -> ([^/]+)
    .replace(/\[([^\]]+)\]/g, '([^/]+)')
    // エスケープ
    .replace(/\//g, '\\/');
  
  // 完全マッチのための ^ と $ を追加
  regexPattern = '^' + regexPattern + '$';
  
  const regex = new RegExp(regexPattern);
  return regex.test(path);
}

/**
 * 解答 7: リダイレクト設定
 */

interface RedirectRule {
  from: string;
  to: string;
  permanent: boolean;
}

export const redirectRules: RedirectRule[] = [
  // 古いブログURLから新しいURLへ
  {
    from: '/old-blog',
    to: '/blog',
    permanent: true
  },
  {
    from: '/articles',
    to: '/blog',
    permanent: true
  },
  // 廃止されたページ
  {
    from: '/legacy-page',
    to: '/',
    permanent: false
  },
  // カテゴリの移動
  {
    from: '/category/tech',
    to: '/blog/technology',
    permanent: true
  }
];

export function checkRedirect(path: string): RedirectRule | null {
  // 完全一致を最初にチェック
  const exactMatch = redirectRules.find(rule => rule.from === path);
  if (exactMatch) {
    return exactMatch;
  }
  
  // パターンマッチング（動的ルートも考慮）
  const patternMatch = redirectRules.find(rule => {
    // 簡単なワイルドカードサポート
    if (rule.from.includes('*')) {
      const pattern = rule.from.replace(/\*/g, '.*');
      const regex = new RegExp('^' + pattern + '$');
      return regex.test(path);
    }
    return false;
  });
  
  return patternMatch || null;
}

/**
 * 追加: アクティブリンクの判定
 */

export function isActiveLink(currentPath: string, linkPath: string, exact: boolean = false): boolean {
  if (exact) {
    return currentPath === linkPath;
  }
  
  // 部分マッチ（linkPathで始まるかどうか）
  if (linkPath === '/') {
    return currentPath === '/';
  }
  
  return currentPath.startsWith(linkPath);
}

/**
 * 追加: クエリパラメータの解析
 */

export function parseSearchParams(searchParams: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlParams = new URLSearchParams(searchParams);
  
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  
  return params;
}

/**
 * 追加: URLの正規化
 */

export function normalizeUrl(url: string): string {
  // 末尾のスラッシュを除去（ルート以外）
  if (url.length > 1 && url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  // 重複するスラッシュを除去
  url = url.replace(/\/+/g, '/');
  
  return url;
}