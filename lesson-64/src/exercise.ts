/**
 * Lesson 64: パッケージ管理 (Package Management) - 演習問題
 */

// =============================================================================
// 演習1: 依存関係分析
// =============================================================================

/**
 * 演習1: 以下のパッケージ情報を分析し、問題を特定してください
 */
const packageDependencies = {
  "lodash": "^4.17.21",
  "moment": "^2.29.4", // 🐛 問題: momentは非推奨、代替案は？
  "jquery": "^3.6.0",  // 🐛 問題: jQueryは現代的な開発では必要？
  "left-pad": "^1.3.0" // 🐛 問題: 小さすぎるパッケージ
};

// TODO: 上記の依存関係の問題点を特定し、改善案を提案してください
export function analyzeDependencies(deps: Record<string, string>): string[] {
  const issues: string[] = [];
  
  // ここに分析ロジックを実装してください
  
  return issues;
}

// =============================================================================
// 演習2: パッケージマネージャー検出
// =============================================================================

/**
 * 演習2: プロジェクトディレクトリからパッケージマネージャーを検出する関数を実装してください
 */
export function detectPackageManager(projectPath: string): 'npm' | 'yarn' | 'pnpm' | 'unknown' {
  // TODO: ロックファイルの存在をチェックして適切なパッケージマネージャーを返してください
  // - pnpm-lock.yaml → 'pnpm'
  // - yarn.lock → 'yarn'  
  // - package-lock.json → 'npm'
  // - どれもない場合 → 'unknown'
  
  return 'unknown';
}

// =============================================================================
// 演習3: バージョン比較
// =============================================================================

/**
 * 演習3: セマンティックバージョンの比較関数を実装してください
 */
export function compareVersions(version1: string, version2: string): -1 | 0 | 1 {
  // TODO: セマンティックバージョンを比較して結果を返してください
  // version1 < version2 なら -1
  // version1 = version2 なら 0  
  // version1 > version2 なら 1
  
  return 0;
}

// =============================================================================
// 演習4: 脆弱性チェック
// =============================================================================

interface VulnerabilityReport {
  package: string;
  version: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
}

/**
 * 演習4: パッケージの脆弱性をチェックする関数を実装してください
 */
export async function checkVulnerabilities(packageName: string, version: string): Promise<VulnerabilityReport[]> {
  // TODO: 実際の脆弱性データベースをチェックする実装
  // （この演習では、模擬データを使用してください）
  
  const mockVulnerabilities: VulnerabilityReport[] = [
    {
      package: 'lodash',
      version: '4.17.20',
      severity: 'high',
      description: 'Prototype Pollution'
    }
  ];
  
  // パッケージ名とバージョンに基づいて関連する脆弱性を返してください
  return [];
}

// =============================================================================
// 演習5: 依存関係ツリー構築
// =============================================================================

interface DependencyNode {
  name: string;
  version: string;
  dependencies: DependencyNode[];
}

/**
 * 演習5: 依存関係ツリーを構築する関数を実装してください
 */
export function buildDependencyTree(packageJson: any, lockfile: any): DependencyNode {
  // TODO: package.jsonとロックファイルから依存関係ツリーを構築してください
  
  return {
    name: packageJson.name || 'unknown',
    version: packageJson.version || '0.0.0',
    dependencies: []
  };
}