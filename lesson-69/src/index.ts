/**
 * Lesson 69: モニタリングとログ (Monitoring & Logging)
 * 
 * このファイルは、TypeScriptアプリケーションの包括的なモニタリングと
 * ログシステムを実装します。
 */

export interface MonitoringConfig {
  appName: string;
  environment: 'development' | 'staging' | 'production';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableTracing: boolean;
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  labels: Record<string, string>;
}

export class MonitoringSystem {
  private config: MonitoringConfig;
  private metrics: MetricData[] = [];

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🔍 Initializing monitoring system...');
    
    await this.setupLogger();
    await this.setupMetrics();
    await this.setupTracing();
    await this.setupAlerts();
    
    console.log('✅ Monitoring system initialized successfully');
  }

  private async setupLogger(): Promise<void> {
    console.log('Setting up structured logging...');
    // Setup Winston or Pino logger
  }

  private async setupMetrics(): Promise<void> {
    if (this.config.enableMetrics) {
      console.log('Setting up metrics collection...');
      // Setup Prometheus metrics
    }
  }

  private async setupTracing(): Promise<void> {
    if (this.config.enableTracing) {
      console.log('Setting up distributed tracing...');
      // Setup OpenTelemetry
    }
  }

  private async setupAlerts(): Promise<void> {
    console.log('Setting up alerting system...');
    // Setup alert rules and notifications
  }

  logError(error: Error, context?: Record<string, any>): void {
    console.error('Error logged:', error.message, context);
  }

  recordMetric(metric: Omit<MetricData, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: new Date()
    });
  }

  async generateHealthReport(): Promise<object> {
    return {
      status: 'healthy',
      timestamp: new Date(),
      metrics: this.metrics.slice(-10),
      systemInfo: {
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  }
}

export function demonstrateMonitoring(): void {
  const monitoring = new MonitoringSystem({
    appName: 'sample-app',
    environment: 'development',
    logLevel: 'info',
    enableMetrics: true,
    enableTracing: true
  });

  monitoring.initialize();
  
  // Record some sample metrics
  monitoring.recordMetric({
    name: 'http_requests_total',
    value: 1,
    labels: { method: 'GET', status: '200' }
  });
}

if (typeof window === 'undefined' && require.main === module) {
  demonstrateMonitoring();
}