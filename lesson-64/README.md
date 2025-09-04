# Lesson 64: パッケージ管理 (Package Management)

## 学習目標
このレッスンでは、TypeScriptプロジェクトでの効果的なパッケージ管理技術と最新のツールチェーンを学習します。

### 学習内容
1. npm、yarn、pnpmの比較と使い分け
2. package.jsonの詳細設定とスクリプト管理
3. 依存関係管理とバージョン戦略
4. Monorepo設定とワークスペース管理
5. プライベートパッケージレジストリの構築
6. セキュリティ監査と脆弱性管理

## 実装する機能

### 1. パッケージマネージャー統合システム
複数のパッケージマネージャーを統合した管理システムを実装します。

### 2. 依存関係分析ツール
プロジェクトの依存関係を分析し、最適化提案を行うシステムを実装します。

### 3. Monorepoワークスペース管理
効率的なMonorepo構成とワークスペース管理システムを実装します。

### 4. セキュリティ監査システム
自動化されたセキュリティチェックと脆弱性管理システムを実装します。

### 5. パッケージ公開自動化
CI/CDパイプラインと連携したパッケージ公開システムを実装します。

## 型定義の特徴

### Package.json 型定義
```typescript
interface PackageJson {
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

interface PackageExports {
  [key: string]: string | PackageExports | ConditionalExports;
}

interface ConditionalExports {
  import?: string | PackageExports;
  require?: string | PackageExports;
  node?: string | PackageExports;
  browser?: string | PackageExports;
  types?: string;
  default?: string | PackageExports;
}
```

### 依存関係分析型
```typescript
interface DependencyAnalysis {
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

interface Vulnerability {
  id: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  patched?: string;
  recommendation: string;
}
```

### Monorepoワークスペース型
```typescript
interface WorkspaceConfig {
  packages: string[];
  nohoist?: string[];
}

interface MonorepoConfig {
  root: string;
  packages: PackageInfo[];
  dependencies: DependencyGraph;
  scripts: Record<string, string>;
  configuration: {
    packageManager: 'npm' | 'yarn' | 'pnpm';
    hoisting: boolean;
    workspaceProtocol: boolean;
  };
}

interface PackageInfo {
  name: string;
  path: string;
  version: string;
  private: boolean;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
}
```

## 実用的な使用例

### パッケージマネージャー統合
```typescript
// 統合パッケージマネージャー
class UniversalPackageManager {
  private detectedPM: 'npm' | 'yarn' | 'pnpm';

  constructor(projectPath: string = process.cwd()) {
    this.detectedPM = this.detectPackageManager(projectPath);
  }

  private detectPackageManager(path: string): 'npm' | 'yarn' | 'pnpm' {
    if (fs.existsSync(join(path, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(join(path, 'yarn.lock'))) return 'yarn';
    return 'npm';
  }

  async install(packages?: string[], options?: InstallOptions): Promise<void> {
    const cmd = this.buildInstallCommand(packages, options);
    await this.execute(cmd);
  }

  async audit(): Promise<AuditResult> {
    const cmd = this.buildAuditCommand();
    const result = await this.execute(cmd);
    return this.parseAuditResult(result);
  }
}
```

### 依存関係分析
```typescript
class DependencyAnalyzer {
  async analyzeDependencies(packagePath: string): Promise<DependencyAnalysis[]> {
    const packageJson = await this.loadPackageJson(packagePath);
    const lockfile = await this.loadLockfile(packagePath);
    
    const analysis: DependencyAnalysis[] = [];
    
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      const depAnalysis = await this.analyzePackage(name, version, lockfile);
      analysis.push(depAnalysis);
    }
    
    return analysis.sort((a, b) => b.size.bundled - a.size.bundled);
  }

  private async analyzePackage(
    name: string, 
    version: string, 
    lockfile: any
  ): Promise<DependencyAnalysis> {
    const [size, security, usage] = await Promise.all([
      this.getPackageSize(name, version),
      this.getSecurityInfo(name, version),
      this.getUsageInfo(name)
    ]);

    return {
      name,
      version,
      installedVersion: lockfile[name]?.version,
      latestVersion: await this.getLatestVersion(name),
      type: 'dependencies',
      size,
      security,
      usage,
      recommendations: this.generateRecommendations(name, size, security, usage)
    };
  }
}
```

## ベストプラクティス

### 1. バージョン管理戦略
- セマンティックバージョニングの厳格な適用
- 段階的アップグレード戦略
- Breaking changesの適切な管理
- 依存関係のピンニング戦略

### 2. セキュリティ対策
- 定期的なセキュリティ監査
- 自動化された脆弱性スキャン
- 依存関係の最小化
- プライベートレジストリの活用

### 3. パフォーマンス最適化
- 不要な依存関係の除去
- Tree shakingの最適化
- バンドルサイズの監視
- CDNキャッシュ戦略

## 高度な機能

### 1. Monorepo管理
```typescript
class MonorepoManager {
  private config: MonorepoConfig;

  constructor(rootPath: string) {
    this.config = this.loadMonorepoConfig(rootPath);
  }

  async bootstrapWorkspaces(): Promise<void> {
    // 全ワークスペースの依存関係をインストール
    await this.installWorkspaceDependencies();
    
    // ワークスペース間のリンクを設定
    await this.linkWorkspaces();
    
    // 共通スクリプトの実行
    await this.runBootstrapScripts();
  }

  async runWorkspaceScript(
    workspace: string, 
    script: string, 
    args: string[] = []
  ): Promise<void> {
    const workspacePath = this.getWorkspacePath(workspace);
    const fullScript = `${script} ${args.join(' ')}`.trim();
    
    await this.executeInWorkspace(workspacePath, fullScript);
  }

  async publishWorkspaces(options: PublishOptions = {}): Promise<void> {
    const publishablePackages = await this.getPublishablePackages();
    
    for (const pkg of publishablePackages) {
      if (await this.shouldPublish(pkg, options)) {
        await this.publishPackage(pkg, options);
      }
    }
  }
}
```

### 2. 自動依存関係更新
```typescript
class AutoUpdater {
  private analyzer: DependencyAnalyzer;
  private packageManager: UniversalPackageManager;

  constructor() {
    this.analyzer = new DependencyAnalyzer();
    this.packageManager = new UniversalPackageManager();
  }

  async updateDependencies(strategy: UpdateStrategy = 'safe'): Promise<UpdateResult> {
    const current = await this.analyzer.analyzeDependencies('./');
    const updates = await this.findAvailableUpdates(current);
    
    const plannedUpdates = this.planUpdates(updates, strategy);
    const results: UpdateResult = {
      successful: [],
      failed: [],
      skipped: []
    };

    for (const update of plannedUpdates) {
      try {
        await this.applyUpdate(update);
        await this.verifyUpdate(update);
        results.successful.push(update);
      } catch (error) {
        results.failed.push({ update, error });
      }
    }

    return results;
  }

  private planUpdates(
    updates: AvailableUpdate[], 
    strategy: UpdateStrategy
  ): PlannedUpdate[] {
    return updates
      .filter(update => this.shouldUpdate(update, strategy))
      .map(update => this.createUpdatePlan(update, strategy))
      .sort((a, b) => a.priority - b.priority);
  }
}
```

### 3. プライベートレジストリ
```typescript
class PrivateRegistry {
  private config: RegistryConfig;

  constructor(config: RegistryConfig) {
    this.config = config;
  }

  async setupRegistry(): Promise<void> {
    await this.createRegistryConfiguration();
    await this.setupAuthentication();
    await this.configureScopes();
  }

  async publishPackage(
    packagePath: string, 
    options: PublishOptions = {}
  ): Promise<PublishResult> {
    const packageInfo = await this.validatePackage(packagePath);
    
    if (options.dryRun) {
      return this.simulatePublish(packageInfo);
    }

    // パッケージのビルドとテスト
    await this.buildPackage(packagePath);
    await this.testPackage(packagePath);

    // セキュリティスキャン
    const securityResult = await this.scanPackage(packagePath);
    if (securityResult.vulnerabilities.length > 0) {
      throw new Error('Security vulnerabilities found');
    }

    // 公開実行
    const result = await this.performPublish(packagePath, options);
    
    // 公開後の処理
    await this.notifyPublish(result);
    await this.updateDependents(result);

    return result;
  }
}
```

## セキュリティ対策

### 1. 依存関係監査
```typescript
class SecurityAuditor {
  async auditProject(projectPath: string): Promise<SecurityReport> {
    const [dependencies, vulnerabilities, licenses] = await Promise.all([
      this.scanDependencies(projectPath),
      this.scanVulnerabilities(projectPath),
      this.scanLicenses(projectPath)
    ]);

    return {
      summary: this.createSummary(dependencies, vulnerabilities, licenses),
      dependencies: dependencies,
      vulnerabilities: vulnerabilities,
      licenses: licenses,
      recommendations: this.generateSecurityRecommendations(
        dependencies, 
        vulnerabilities, 
        licenses
      )
    };
  }

  private async scanVulnerabilities(projectPath: string): Promise<Vulnerability[]> {
    const auditResult = await this.runSecurityAudit(projectPath);
    return this.parseVulnerabilities(auditResult);
  }

  private generateSecurityRecommendations(
    dependencies: DependencyInfo[],
    vulnerabilities: Vulnerability[],
    licenses: LicenseInfo[]
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // 高重要度の脆弱性に対する推奨事項
    for (const vuln of vulnerabilities.filter(v => v.severity === 'critical')) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: `Critical vulnerability in ${vuln.package}: ${vuln.title}`,
        action: vuln.patched ? `Update to version ${vuln.patched}` : 'Find alternative package',
        automated: vuln.patched !== undefined
      });
    }

    return recommendations;
  }
}
```

### 2. ライセンス管理
```typescript
class LicenseManager {
  private allowedLicenses: Set<string>;
  private prohibitedLicenses: Set<string>;

  constructor(config: LicenseConfig) {
    this.allowedLicenses = new Set(config.allowed);
    this.prohibitedLicenses = new Set(config.prohibited);
  }

  async auditLicenses(projectPath: string): Promise<LicenseAuditResult> {
    const dependencies = await this.getAllDependencies(projectPath);
    const licenseInfo = await this.getLicenseInfo(dependencies);

    const violations: LicenseViolation[] = [];
    const warnings: LicenseWarning[] = [];

    for (const [packageName, license] of Object.entries(licenseInfo)) {
      if (this.prohibitedLicenses.has(license)) {
        violations.push({
          package: packageName,
          license,
          reason: 'Prohibited license',
          severity: 'high'
        });
      } else if (!this.allowedLicenses.has(license)) {
        warnings.push({
          package: packageName,
          license,
          reason: 'License not in allowed list',
          severity: 'medium'
        });
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      summary: this.createLicenseSummary(licenseInfo)
    };
  }
}
```

## CI/CD統合

### 1. GitHub Actions統合
```yaml
# .github/workflows/package-management.yml
name: Package Management

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Security Audit
        run: npm audit --audit-level=high
        
      - name: License Check
        run: npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause'
        
      - name: Dependency Analysis
        run: npm run analyze:dependencies
```

### 2. 自動更新ワークフロー
```typescript
class AutoUpdateWorkflow {
  async createUpdatePR(updates: PlannedUpdate[]): Promise<string> {
    const branch = `auto-update-${Date.now()}`;
    
    // 新しいブランチを作成
    await this.git.createBranch(branch);
    
    // 依存関係を更新
    for (const update of updates) {
      await this.applyUpdate(update);
    }
    
    // テストを実行
    const testResult = await this.runTests();
    if (!testResult.success) {
      throw new Error('Tests failed after update');
    }
    
    // プルリクエストを作成
    const pr = await this.github.createPR({
      title: `Automated dependency updates`,
      body: this.generateUpdateDescription(updates),
      base: 'main',
      head: branch
    });
    
    return pr.url;
  }
}
```

## パフォーマンス最適化

### 1. バンドル分析
```typescript
class BundleAnalyzer {
  async analyzeBundleSize(buildPath: string): Promise<BundleAnalysis> {
    const files = await this.findBundleFiles(buildPath);
    const analysis: BundleAnalysis = {
      totalSize: 0,
      files: [],
      dependencies: new Map(),
      recommendations: []
    };

    for (const file of files) {
      const fileAnalysis = await this.analyzeFile(file);
      analysis.files.push(fileAnalysis);
      analysis.totalSize += fileAnalysis.size;
      
      // 依存関係別のサイズを集計
      for (const [dep, size] of fileAnalysis.dependencies) {
        const current = analysis.dependencies.get(dep) || 0;
        analysis.dependencies.set(dep, current + size);
      }
    }

    // 最適化推奨事項を生成
    analysis.recommendations = this.generateOptimizationRecommendations(analysis);
    
    return analysis;
  }

  private generateOptimizationRecommendations(
    analysis: BundleAnalysis
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // 大きな依存関係の特定
    const largeDependencies = Array.from(analysis.dependencies.entries())
      .filter(([_, size]) => size > 100 * 1024) // 100KB以上
      .sort(([_, a], [__, b]) => b - a);
      
    for (const [dep, size] of largeDependencies) {
      recommendations.push({
        type: 'large-dependency',
        message: `${dep} is ${(size / 1024).toFixed(1)}KB. Consider code splitting or alternatives.`,
        impact: 'high',
        effort: 'medium'
      });
    }
    
    return recommendations;
  }
}
```

## ビルドと実行

```bash
# 依存関係のインストール
npm install

# パッケージ監査
npm run audit

# 依存関係分析
npm run analyze:deps

# セキュリティチェック
npm run security:check

# ライセンス確認
npm run license:check

# Monorepo bootstrap
npm run bootstrap

# 全ワークスペースでのテスト実行
npm run test:workspaces

# パッケージ更新
npm run update:deps

# バンドル分析
npm run analyze:bundle
```

## 次のステップ
次のLesson 65では、テストフレームワークについて学習し、Jest、Vitest、Playwrightを使った包括的なテスト戦略を習得します。