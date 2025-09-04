/**
 * Lesson 64: パッケージ管理 (Package Management)
 * 
 * このファイルは、TypeScriptプロジェクトでの効果的なパッケージ管理技術を
 * 実装したサンプルコードです。
 */

import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// =============================================================================
// 型定義
// =============================================================================

/**
 * Package.json の型定義
 */
export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  main?: string;
  module?: string;
  types?: string;
  exports?: PackageExports;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  bundledDependencies?: string[];
  engines?: Record<string, string>;
  os?: string[];
  cpu?: string[];
  private?: boolean;
  publishConfig?: PublishConfig;
  workspaces?: string[] | WorkspaceConfig;
  repository?: string | Repository;
  keywords?: string[];
  author?: string | Person;
  license?: string;
  bugs?: string | BugsConfig;
  homepage?: string;
}

export interface PackageExports {
  [key: string]: string | PackageExports | ConditionalExports;
}

export interface ConditionalExports {
  import?: string | PackageExports;
  require?: string | PackageExports;
  node?: string | PackageExports;
  browser?: string | PackageExports;
  types?: string;
  default?: string | PackageExports;
}

export interface PublishConfig {
  registry?: string;
  access?: 'public' | 'restricted';
  tag?: string;
}

export interface WorkspaceConfig {
  packages: string[];
  nohoist?: string[];
}

export interface Repository {
  type: string;
  url: string;
  directory?: string;
}

export interface Person {
  name: string;
  email?: string;
  url?: string;
}

export interface BugsConfig {
  url: string;
  email?: string;
}

/**
 * 依存関係分析の型定義
 */
export interface DependencyAnalysis {
  name: string;
  version: string;
  installedVersion?: string;
  latestVersion?: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
  size: {
    bundled: number;
    unpacked: number;
  };
  security: {
    vulnerabilities: Vulnerability[];
    auditScore: number;
  };
  usage: {
    imports: string[];
    frequency: number;
  };
  recommendations: Recommendation[];
}

export interface Vulnerability {
  id: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  patched?: string;
  recommendation: string;
}

export interface Recommendation {
  type: 'update' | 'remove' | 'replace' | 'security';
  message: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * パッケージマネージャーの型定義
 */
export type PackageManagerType = 'npm' | 'yarn' | 'pnpm';

export interface InstallOptions {
  dev?: boolean;
  global?: boolean;
  save?: boolean;
  exact?: boolean;
  force?: boolean;
  ignoreScripts?: boolean;
}

export interface AuditResult {
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
}

// =============================================================================
// 統合パッケージマネージャー
// =============================================================================

/**
 * 複数のパッケージマネージャーを統合管理するクラス
 */
export class UniversalPackageManager {
  private detectedPM: PackageManagerType;
  private projectPath: string;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = resolve(projectPath);
    this.detectedPM = this.detectPackageManager();
  }

  /**
 * プロジェクトで使用されているパッケージマネージャーを検出
   */
  private detectPackageManager(): PackageManagerType {
    try {
      if (this.fileExists('pnpm-lock.yaml')) return 'pnpm';
      if (this.fileExists('yarn.lock')) return 'yarn';
      return 'npm';
    } catch (error) {
      console.warn('Failed to detect package manager, defaulting to npm');
      return 'npm';
    }
  }

  private fileExists(filename: string): boolean {
    try {
      const path = join(this.projectPath, filename);
      return require('fs').existsSync(path);
    } catch {
      return false;
    }
  }

  /**
   * 依存関係のインストール
   */
  async install(packages?: string[], options: InstallOptions = {}): Promise<void> {
    const cmd = this.buildInstallCommand(packages, options);
    console.log(`🔄 Installing with ${this.detectedPM}: ${cmd}`);
    
    try {
      const { stdout, stderr } = await execAsync(cmd, { cwd: this.projectPath });
      if (stdout) console.log(stdout);
      if (stderr) console.warn(stderr);
    } catch (error) {
      throw new Error(`Installation failed: ${error.message}`);
    }
  }

  private buildInstallCommand(packages?: string[], options: InstallOptions = {}): string {
    let cmd: string;
    
    switch (this.detectedPM) {
      case 'npm':
        cmd = packages ? `npm install ${packages.join(' ')}` : 'npm install';
        if (options.dev) cmd += ' --save-dev';
        if (options.global) cmd += ' --global';
        if (options.exact) cmd += ' --save-exact';
        break;
        
      case 'yarn':
        cmd = packages ? `yarn add ${packages.join(' ')}` : 'yarn install';
        if (options.dev) cmd += ' --dev';
        if (options.global) cmd = `yarn global add ${packages?.join(' ')}`;
        if (options.exact) cmd += ' --exact';
        break;
        
      case 'pnpm':
        cmd = packages ? `pnpm add ${packages.join(' ')}` : 'pnpm install';
        if (options.dev) cmd += ' --save-dev';
        if (options.global) cmd += ' --global';
        if (options.exact) cmd += ' --save-exact';
        break;
        
      default:
        throw new Error(`Unsupported package manager: ${this.detectedPM}`);
    }
    
    return cmd;
  }

  /**
   * セキュリティ監査の実行
   */
  async audit(): Promise<AuditResult> {
    const cmd = this.buildAuditCommand();
    console.log(`🔍 Running security audit with ${this.detectedPM}`);
    
    try {
      const { stdout } = await execAsync(cmd, { cwd: this.projectPath });
      return this.parseAuditResult(stdout);
    } catch (error) {
      // audit コマンドは脆弱性がある場合にエラーコードを返すため、
      // stdout からの解析を試行
      if (error.stdout) {
        return this.parseAuditResult(error.stdout);
      }
      throw new Error(`Audit failed: ${error.message}`);
    }
  }

  private buildAuditCommand(): string {
    switch (this.detectedPM) {
      case 'npm':
        return 'npm audit --json';
      case 'yarn':
        return 'yarn audit --json';
      case 'pnpm':
        return 'pnpm audit --json';
      default:
        throw new Error(`Unsupported package manager: ${this.detectedPM}`);
    }
  }

  private parseAuditResult(output: string): AuditResult {
    try {
      const data = JSON.parse(output);
      const vulnerabilities: Vulnerability[] = [];
      
      // npm audit 形式の解析
      if (data.vulnerabilities) {
        Object.entries(data.vulnerabilities).forEach(([name, vuln]: [string, any]) => {
          vulnerabilities.push({
            id: vuln.id || `${name}-${Date.now()}`,
            severity: vuln.severity,
            title: vuln.title || `Vulnerability in ${name}`,
            description: vuln.url || 'No description available',
            patched: vuln.fixAvailable ? 'latest' : undefined,
            recommendation: vuln.fixAvailable ? 'Update to latest version' : 'No fix available'
          });
        });
      }
      
      const summary = {
        total: vulnerabilities.length,
        low: vulnerabilities.filter(v => v.severity === 'low').length,
        moderate: vulnerabilities.filter(v => v.severity === 'moderate').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        critical: vulnerabilities.filter(v => v.severity === 'critical').length
      };
      
      return { vulnerabilities, summary };
    } catch (error) {
      console.warn('Failed to parse audit result:', error);
      return {
        vulnerabilities: [],
        summary: { total: 0, low: 0, moderate: 0, high: 0, critical: 0 }
      };
    }
  }

  /**
   * 使用中のパッケージマネージャーを取得
   */
  getPackageManager(): PackageManagerType {
    return this.detectedPM;
  }

  /**
   * package.jsonの読み込み
   */
  async loadPackageJson(): Promise<PackageJson> {
    const packagePath = join(this.projectPath, 'package.json');
    const content = await fs.readFile(packagePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * package.jsonの保存
   */
  async savePackageJson(packageJson: PackageJson): Promise<void> {
    const packagePath = join(this.projectPath, 'package.json');
    const content = JSON.stringify(packageJson, null, 2) + '\n';
    await fs.writeFile(packagePath, content, 'utf-8');
  }
}

// =============================================================================
// 依存関係分析
// =============================================================================

/**
 * 依存関係分析を行うクラス
 */
export class DependencyAnalyzer {
  private packageManager: UniversalPackageManager;

  constructor(projectPath?: string) {
    this.packageManager = new UniversalPackageManager(projectPath);
  }

  /**
   * プロジェクトの依存関係を分析
   */
  async analyzeDependencies(): Promise<DependencyAnalysis[]> {
    console.log('🔍 Analyzing dependencies...');
    
    const packageJson = await this.packageManager.loadPackageJson();
    const analysis: DependencyAnalysis[] = [];
    
    // 各種依存関係を分析
    const dependencyTypes = [
      { deps: packageJson.dependencies, type: 'dependencies' as const },
      { deps: packageJson.devDependencies, type: 'devDependencies' as const },
      { deps: packageJson.peerDependencies, type: 'peerDependencies' as const },
      { deps: packageJson.optionalDependencies, type: 'optionalDependencies' as const }
    ];

    for (const { deps, type } of dependencyTypes) {
      if (deps) {
        for (const [name, version] of Object.entries(deps)) {
          const depAnalysis = await this.analyzePackage(name, version, type);
          analysis.push(depAnalysis);
        }
      }
    }
    
    return analysis.sort((a, b) => b.size.bundled - a.size.bundled);
  }

  private async analyzePackage(
    name: string,
    version: string,
    type: DependencyAnalysis['type']
  ): Promise<DependencyAnalysis> {
    const [size, security, usage] = await Promise.all([
      this.getPackageSize(name),
      this.getSecurityInfo(name),
      this.getUsageInfo(name)
    ]);

    const latestVersion = await this.getLatestVersion(name);
    const recommendations = this.generateRecommendations(name, version, latestVersion, size, security);

    return {
      name,
      version,
      latestVersion,
      type,
      size,
      security,
      usage,
      recommendations
    };
  }

  private async getPackageSize(name: string): Promise<{ bundled: number; unpacked: number }> {
    // 実際の実装では、bundlephobia APIや npm view を使用
    // ここではモックデータを返す
    const mockSize = Math.floor(Math.random() * 500000) + 10000; // 10KB-500KB
    return {
      bundled: mockSize,
      unpacked: mockSize * 1.5
    };
  }

  private async getSecurityInfo(name: string): Promise<{ vulnerabilities: Vulnerability[]; auditScore: number }> {
    // セキュリティ情報の取得（実装では実際のAPIを使用）
    return {
      vulnerabilities: [],
      auditScore: Math.floor(Math.random() * 100)
    };
  }

  private async getUsageInfo(name: string): Promise<{ imports: string[]; frequency: number }> {
    // 使用状況の分析（実装ではコード解析を行う）
    return {
      imports: [],
      frequency: Math.floor(Math.random() * 10)
    };
  }

  private async getLatestVersion(name: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`npm view ${name} version`);
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  private generateRecommendations(
    name: string,
    currentVersion: string,
    latestVersion: string,
    size: { bundled: number; unpacked: number },
    security: { vulnerabilities: Vulnerability[]; auditScore: number }
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // バージョン更新の推奨
    if (latestVersion !== 'unknown' && currentVersion !== latestVersion) {
      recommendations.push({
        type: 'update',
        message: `Update ${name} from ${currentVersion} to ${latestVersion}`,
        action: `npm install ${name}@${latestVersion}`,
        priority: 'medium'
      });
    }

    // 大きなパッケージの警告
    if (size.bundled > 200000) { // 200KB以上
      recommendations.push({
        type: 'replace',
        message: `${name} is large (${(size.bundled / 1024).toFixed(1)}KB). Consider alternatives.`,
        action: `Research lighter alternatives to ${name}`,
        priority: 'low'
      });
    }

    // セキュリティの推奨
    if (security.vulnerabilities.length > 0) {
      recommendations.push({
        type: 'security',
        message: `${name} has ${security.vulnerabilities.length} security vulnerabilities`,
        action: 'Update to a secure version or find alternatives',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * 依存関係のレポート生成
   */
  async generateReport(): Promise<string> {
    const analysis = await this.analyzeDependencies();
    const packageJson = await this.packageManager.loadPackageJson();
    
    let report = `# Dependency Analysis Report\n\n`;
    report += `**Project**: ${packageJson.name}@${packageJson.version}\n`;
    report += `**Package Manager**: ${this.packageManager.getPackageManager()}\n`;
    report += `**Total Dependencies**: ${analysis.length}\n\n`;
    
    // サマリー
    const totalSize = analysis.reduce((sum, dep) => sum + dep.size.bundled, 0);
    const highPriorityRecommendations = analysis.flatMap(dep => dep.recommendations)
      .filter(rec => rec.priority === 'high').length;
      
    report += `## Summary\n\n`;
    report += `- Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`;
    report += `- High priority recommendations: ${highPriorityRecommendations}\n\n`;
    
    // トップ10の大きな依存関係
    report += `## Largest Dependencies\n\n`;
    const largest = analysis.slice(0, 10);
    for (const dep of largest) {
      report += `- **${dep.name}**: ${(dep.size.bundled / 1024).toFixed(1)} KB\n`;
    }
    
    report += '\n';
    
    // 推奨事項
    const allRecommendations = analysis.flatMap(dep => dep.recommendations)
      .filter(rec => rec.priority === 'high')
      .slice(0, 10);
      
    if (allRecommendations.length > 0) {
      report += `## High Priority Recommendations\n\n`;
      for (const rec of allRecommendations) {
        report += `- ${rec.message}\n  - Action: ${rec.action}\n\n`;
      }
    }
    
    return report;
  }
}

// =============================================================================
// デモンストレーション
// =============================================================================

/**
 * パッケージ管理のデモンストレーション
 */
export async function demonstratePackageManagement(): Promise<void> {
  console.log('🎯 Starting package management demonstration...\n');

  try {
    // パッケージマネージャーの初期化
    const packageManager = new UniversalPackageManager();
    console.log(`📦 Detected package manager: ${packageManager.getPackageManager()}\n`);

    // package.json の読み込み
    const packageJson = await packageManager.loadPackageJson();
    console.log(`📄 Project: ${packageJson.name}@${packageJson.version}\n`);

    // 依存関係分析
    const analyzer = new DependencyAnalyzer();
    const analysis = await analyzer.analyzeDependencies();
    
    console.log('📊 Dependency Analysis Results:');
    console.log(`   Total dependencies: ${analysis.length}`);
    
    const totalSize = analysis.reduce((sum, dep) => sum + dep.size.bundled, 0);
    console.log(`   Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // 上位5つの大きな依存関係を表示
    console.log('\n🏆 Top 5 largest dependencies:');
    analysis.slice(0, 5).forEach((dep, index) => {
      console.log(`   ${index + 1}. ${dep.name}: ${(dep.size.bundled / 1024).toFixed(1)} KB`);
    });
    
    // セキュリティ監査（デモ用に簡略化）
    console.log('\n🔍 Security audit summary:');
    const auditResult = await packageManager.audit();
    console.log(`   Total vulnerabilities: ${auditResult.summary.total}`);
    console.log(`   Critical: ${auditResult.summary.critical}`);
    console.log(`   High: ${auditResult.summary.high}`);
    
    // レポート生成
    console.log('\n📋 Generating dependency report...');
    const report = await analyzer.generateReport();
    console.log('   Report generated successfully!');
    
    console.log('\n✅ Package management demonstration completed');
    
  } catch (error) {
    console.error('❌ Error during demonstration:', error.message);
  }
}

// Node.js環境での実行時は自動でデモを実行
if (typeof window === 'undefined' && require.main === module) {
  demonstratePackageManagement();
}
