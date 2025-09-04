/**
 * Lesson 64: パッケージ管理 (Package Management) - 解答例
 */

import { promises as fs } from 'fs';
import { join } from 'path';

// =============================================================================
// 解答1: 依存関係分析
// =============================================================================

/**
 * 解答1: 依存関係分析の実装例
 */
export function analyzeDependencies(deps: Record<string, string>): string[] {
  const issues: string[] = [];
  
  for (const [packageName, version] of Object.entries(deps)) {
    // moment.js の問題
    if (packageName === 'moment') {
      issues.push(`${packageName}: Deprecated package. Consider using date-fns, dayjs, or native Date API`);
    }
    
    // jQuery の問題
    if (packageName === 'jquery') {
      issues.push(`${packageName}: Consider if jQuery is necessary in modern development. Use vanilla JS or modern frameworks`);
    }
    
    // left-pad の問題
    if (packageName === 'left-pad') {
      issues.push(`${packageName}: Tiny package that can be replaced with native String.prototype.padStart()`);
    }
    
    // バージョン範囲の問題
    if (version.startsWith('^0.')) {
      issues.push(`${packageName}: Using unstable version (0.x.x). Consider pinning to exact version`);
    }
    
    // 古いメジャーバージョンの警告
    if (packageName === 'lodash' && version.includes('3.')) {
      issues.push(`${packageName}: Using outdated major version. Consider upgrading to latest`);
    }
  }
  
  return issues;
}

// =============================================================================
// 解答2: パッケージマネージャー検出
// =============================================================================

/**
 * 解答2: パッケージマネージャー検出の実装例
 */
export function detectPackageManager(projectPath: string): 'npm' | 'yarn' | 'pnpm' | 'unknown' {
  try {
    const fs = require('fs');
    
    // pnpm-lock.yaml の存在チェック
    if (fs.existsSync(join(projectPath, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    
    // yarn.lock の存在チェック
    if (fs.existsSync(join(projectPath, 'yarn.lock'))) {
      return 'yarn';
    }
    
    // package-lock.json の存在チェック
    if (fs.existsSync(join(projectPath, 'package-lock.json'))) {
      return 'npm';
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// =============================================================================
// 解答3: バージョン比較
// =============================================================================

/**
 * 解答3: セマンティックバージョン比較の実装例
 */
export function compareVersions(version1: string, version2: string): -1 | 0 | 1 {
  // プレフィックス（^, ~, >=など）を除去
  const cleanVersion = (v: string): string => {
    return v.replace(/^[^\d]*/, '').split('-')[0]; // プレリリース部分も除去
  };
  
  const v1 = cleanVersion(version1);
  const v2 = cleanVersion(version2);
  
  // セマンティックバージョンを数値配列に分割
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  // 不足している部分を0で埋める
  while (parts1.length < 3) parts1.push(0);
  while (parts2.length < 3) parts2.push(0);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] < parts2[i]) return -1;
    if (parts1[i] > parts2[i]) return 1;
  }
  
  return 0;
}

// =============================================================================
// 解答4: 脆弱性チェック
// =============================================================================

interface VulnerabilityReport {
  package: string;
  version: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
}

/**
 * 解答4: 脆弱性チェックの実装例
 */
export async function checkVulnerabilities(packageName: string, version: string): Promise<VulnerabilityReport[]> {
  // 実際の実装では、National Vulnerability Database (NVD) や
  // npm audit API、Snyk API などを使用します
  
  const vulnerabilityDatabase = new Map([
    ['lodash@4.17.20', {
      package: 'lodash',
      version: '4.17.20',
      severity: 'high' as const,
      description: 'Prototype Pollution in lodash'
    }],
    ['moment@2.29.3', {
      package: 'moment',
      version: '2.29.3',
      severity: 'moderate' as const,
      description: 'Path Traversal vulnerability'
    }],
    ['serialize-javascript@5.0.0', {
      package: 'serialize-javascript',
      version: '5.0.0',
      severity: 'critical' as const,
      description: 'Cross-Site Scripting (XSS)'
    }]
  ]);
  
  const key = `${packageName}@${version}`;\n  const vulnerability = vulnerabilityDatabase.get(key);\n  \n  return vulnerability ? [vulnerability] : [];\n}\n\n// より高度な実装例：バージョン範囲チェック\nexport async function checkVulnerabilitiesAdvanced(\n  packageName: string, \n  version: string\n): Promise<VulnerabilityReport[]> {\n  const vulnerabilities: VulnerabilityReport[] = [];\n  \n  // 実際のAPIを呼び出す例（模擬実装）\n  try {\n    // const response = await fetch(`https://api.security-db.com/vulnerabilities/${packageName}`);\n    // const data = await response.json();\n    \n    // 模擬データ\n    const mockApiResponse = {\n      vulnerabilities: [\n        {\n          package: packageName,\n          affectedVersions: '>=4.0.0 <4.17.21',\n          severity: 'high',\n          description: 'Prototype Pollution vulnerability'\n        }\n      ]\n    };\n    \n    for (const vuln of mockApiResponse.vulnerabilities) {\n      if (isVersionAffected(version, vuln.affectedVersions)) {\n        vulnerabilities.push({\n          package: vuln.package,\n          version,\n          severity: vuln.severity as any,\n          description: vuln.description\n        });\n      }\n    }\n  } catch (error) {\n    console.error('Failed to check vulnerabilities:', error);\n  }\n  \n  return vulnerabilities;\n}\n\n// バージョン範囲チェックのヘルパー関数\nfunction isVersionAffected(version: string, range: string): boolean {\n  // 実際の実装では、semver ライブラリを使用することを推奨\n  // ここでは簡略化した例を示す\n  \n  if (range.includes('>=') && range.includes('<')) {\n    const [min, max] = range.split(' ');\n    const minVersion = min.replace('>=', '');\n    const maxVersion = max.replace('<', '');\n    \n    return compareVersions(version, minVersion) >= 0 && \n           compareVersions(version, maxVersion) < 0;\n  }\n  \n  return false;\n}\n\n// =============================================================================\n// 解答5: 依存関係ツリー構築\n// =============================================================================\n\ninterface DependencyNode {\n  name: string;\n  version: string;\n  dependencies: DependencyNode[];\n}\n\n/**\n * 解答5: 依存関係ツリー構築の実装例\n */\nexport function buildDependencyTree(packageJson: any, lockfile: any): DependencyNode {\n  const rootNode: DependencyNode = {\n    name: packageJson.name || 'root',\n    version: packageJson.version || '1.0.0',\n    dependencies: []\n  };\n  \n  // package.json の dependencies を処理\n  if (packageJson.dependencies) {\n    for (const [depName, depVersion] of Object.entries(packageJson.dependencies)) {\n      const childNode = buildDependencyNode(depName, depVersion as string, lockfile);\n      if (childNode) {\n        rootNode.dependencies.push(childNode);\n      }\n    }\n  }\n  \n  return rootNode;\n}\n\n/**\n * 個別の依存関係ノードを構築\n */\nfunction buildDependencyNode(\n  name: string, \n  version: string, \n  lockfile: any,\n  visited: Set<string> = new Set()\n): DependencyNode | null {\n  const key = `${name}@${version}`;\n  \n  // 循環依存を防ぐ\n  if (visited.has(key)) {\n    return null;\n  }\n  visited.add(key);\n  \n  const node: DependencyNode = {\n    name,\n    version: getResolvedVersion(name, version, lockfile),\n    dependencies: []\n  };\n  \n  // ロックファイルから依存関係を取得\n  const lockEntry = getLockEntry(name, lockfile);\n  if (lockEntry && lockEntry.dependencies) {\n    for (const [childName, childVersion] of Object.entries(lockEntry.dependencies)) {\n      const childNode = buildDependencyNode(\n        childName, \n        childVersion as string, \n        lockfile, \n        new Set(visited)\n      );\n      if (childNode) {\n        node.dependencies.push(childNode);\n      }\n    }\n  }\n  \n  return node;\n}\n\n/**\n * ロックファイルから解決されたバージョンを取得\n */\nfunction getResolvedVersion(name: string, version: string, lockfile: any): string {\n  // npm lockfile (package-lock.json) の場合\n  if (lockfile.dependencies && lockfile.dependencies[name]) {\n    return lockfile.dependencies[name].version || version;\n  }\n  \n  // yarn lockfile の場合\n  const yarnKey = `${name}@${version}`;\n  if (lockfile[yarnKey]) {\n    return lockfile[yarnKey].version || version;\n  }\n  \n  return version;\n}\n\n/**\n * ロックファイルからエントリを取得\n */\nfunction getLockEntry(name: string, lockfile: any): any {\n  // npm lockfile の場合\n  if (lockfile.dependencies && lockfile.dependencies[name]) {\n    return lockfile.dependencies[name];\n  }\n  \n  // その他の形式に対応\n  return null;\n}\n\n// =============================================================================\n// 統合的な解答例：パッケージ監査システム\n// =============================================================================\n\n/**\n * 包括的なパッケージ監査を実行するクラス\n */\nexport class PackageAuditor {\n  async auditProject(projectPath: string): Promise<AuditReport> {\n    console.log('🔍 Starting comprehensive package audit...');\n    \n    const packageJsonPath = join(projectPath, 'package.json');\n    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));\n    \n    // パッケージマネージャーを検出\n    const packageManager = detectPackageManager(projectPath);\n    \n    // 依存関係を分析\n    const dependencyIssues = analyzeDependencies(packageJson.dependencies || {});\n    const devDependencyIssues = analyzeDependencies(packageJson.devDependencies || {});\n    \n    // 脆弱性をチェック\n    const vulnerabilities: VulnerabilityReport[] = [];\n    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {\n      const vulns = await checkVulnerabilities(name, version as string);\n      vulnerabilities.push(...vulns);\n    }\n    \n    const report: AuditReport = {\n      packageManager,\n      totalDependencies: Object.keys(packageJson.dependencies || {}).length,\n      totalDevDependencies: Object.keys(packageJson.devDependencies || {}).length,\n      issues: [...dependencyIssues, ...devDependencyIssues],\n      vulnerabilities,\n      recommendations: this.generateRecommendations(dependencyIssues, vulnerabilities)\n    };\n    \n    console.log('✅ Audit completed');\n    return report;\n  }\n  \n  private generateRecommendations(\n    issues: string[], \n    vulnerabilities: VulnerabilityReport[]\n  ): string[] {\n    const recommendations: string[] = [];\n    \n    if (issues.length > 0) {\n      recommendations.push('Review and address dependency issues');\n    }\n    \n    if (vulnerabilities.length > 0) {\n      recommendations.push('Update packages with security vulnerabilities');\n      \n      const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;\n      if (criticalCount > 0) {\n        recommendations.push(`URGENT: ${criticalCount} critical vulnerabilities found`);\n      }\n    }\n    \n    return recommendations;\n  }\n}\n\ninterface AuditReport {\n  packageManager: string;\n  totalDependencies: number;\n  totalDevDependencies: number;\n  issues: string[];\n  vulnerabilities: VulnerabilityReport[];\n  recommendations: string[];\n}\n\n// 使用例\nexport async function demonstratePackageAuditing(): Promise<void> {\n  const auditor = new PackageAuditor();\n  const report = await auditor.auditProject(process.cwd());\n  \n  console.log('📊 Package Audit Report:');\n  console.log(`Package Manager: ${report.packageManager}`);\n  console.log(`Dependencies: ${report.totalDependencies}`);\n  console.log(`Dev Dependencies: ${report.totalDevDependencies}`);\n  console.log(`Issues Found: ${report.issues.length}`);\n  console.log(`Vulnerabilities: ${report.vulnerabilities.length}`);\n  \n  if (report.recommendations.length > 0) {\n    console.log('\\n🚨 Recommendations:');\n    report.recommendations.forEach(rec => console.log(`- ${rec}`));\n  }\n}\n\nif (typeof window === 'undefined' && require.main === module) {\n  demonstratePackageAuditing();\n}"