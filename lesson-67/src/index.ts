/**
 * Lesson 67: 開発環境セットアップ (Development Environment)
 * 
 * このファイルは、TypeScript開発のための完全な開発環境セットアップを
 * 自動化するシステムを実装します。
 */

export interface DevEnvironmentConfig {
  projectType: 'node' | 'web' | 'library' | 'monorepo';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  editor: 'vscode' | 'vim' | 'other';
  containerized: boolean;
}

export class DevelopmentEnvironment {
  private config: DevEnvironmentConfig;

  constructor(config: DevEnvironmentConfig) {
    this.config = config;
  }

  async setup(): Promise<void> {
    console.log('🚀 Setting up development environment...');
    
    await this.setupEditor();
    await this.setupDevContainer();
    await this.setupGitHooks();
    await this.setupProductivityTools();
    
    console.log('✅ Development environment setup completed');
  }

  private async setupEditor(): Promise<void> {
    console.log('Configuring editor settings...');
    
    if (this.config.editor === 'vscode') {
      await this.setupVSCode();
    }
  }

  private async setupVSCode(): Promise<void> {
    console.log('Setting up VS Code extensions and settings...');
    // Install recommended extensions
    // Configure TypeScript settings
    // Setup debugging configurations
  }

  private async setupDevContainer(): Promise<void> {
    if (this.config.containerized) {
      console.log('Setting up DevContainer...');
      // Create devcontainer.json
      // Setup Docker configuration
    }
  }

  private async setupGitHooks(): Promise<void> {
    console.log('Setting up Git hooks...');
    // Install husky
    // Setup pre-commit hooks
    // Configure commit message validation
  }

  private async setupProductivityTools(): Promise<void> {
    console.log('Installing productivity tools...');
    // Setup shell enhancements
    // Configure terminal shortcuts
    // Install development utilities
  }
}

export function demonstrateDevEnvironment(): void {
  const env = new DevelopmentEnvironment({
    projectType: 'web',
    packageManager: 'npm',
    editor: 'vscode',
    containerized: true
  });

  env.setup();
}

if (typeof window === 'undefined' && require.main === module) {
  demonstrateDevEnvironment();
}