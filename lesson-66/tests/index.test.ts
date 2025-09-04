/**
 * Lesson 66: ビルドツール (Build Tools) - テスト
 */

import { ModernBuildSystem, BuildConfig } from '../src/index';

describe('ModernBuildSystem', () => {
  let buildSystem: ModernBuildSystem;
  let config: BuildConfig;

  beforeEach(() => {
    config = {
      entry: './src/index.ts',
      output: './dist',
      mode: 'development',
      sourceMaps: true,
      minify: false,
      target: 'es2022'
    };
    buildSystem = new ModernBuildSystem(config);
  });

  test('should create build system with config', () => {
    expect(buildSystem).toBeDefined();
  });

  test('should handle build process', async () => {
    // Mock console.log to capture output
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await buildSystem.build();
    
    expect(consoleSpy).toHaveBeenCalledWith('🚀 Starting modern build process...');
    expect(consoleSpy).toHaveBeenCalledWith('✅ Build completed successfully');
    
    consoleSpy.mockRestore();
  });
});