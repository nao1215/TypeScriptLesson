# Lesson 100: 総合プロジェクト：企業級Webアプリケーション

## 学習目標
- これまでの全レッスンの知識を統合した企業級アプリケーションを構築する
- マイクロサービスアーキテクチャとモノリスの選択基準を理解する
- エンタープライズレベルのセキュリティとスケーラビリティを実装する
- 運用・保守を考慮した持続可能なシステム設計を学ぶ

## 概要

この最終レッスンでは、これまでの100レッスンで学んだすべての技術を統合し、実際の企業で使用されるレベルの大規模Webアプリケーションを構築します。

## プロジェクト概要：統合ビジネス管理プラットフォーム

### システム要件

```typescript
// types/enterprise.ts
export interface EnterpriseRequirements {
  // 機能要件
  userManagement: {
    authentication: 'SSO' | 'OAuth' | 'SAML'
    authorization: 'RBAC' | 'ABAC'
    multiTenant: boolean
  }
  
  // 非機能要件
  performance: {
    responseTime: number // ミリ秒
    throughput: number   // リクエスト/秒
    availability: number // %
  }
  
  // スケーラビリティ
  scalability: {
    horizontalScaling: boolean
    loadBalancing: boolean
    autoScaling: boolean
    caching: 'Redis' | 'Memcached' | 'CDN'
  }
  
  // セキュリティ
  security: {
    encryption: 'AES-256' | 'RSA'
    compliance: 'GDPR' | 'SOX' | 'HIPAA'[]
    auditLogging: boolean
    rateLimiting: boolean
  }
}
```

### アーキテクチャ設計

```
Enterprise Platform Architecture

┌─────────────────────────────────────────────────────┐
│                    Load Balancer                    │
│                   (Nginx/HAProxy)                   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────┐
│                 │         Web Layer                 │
├─────────────────┼───────────────────────────────────┤
│  ┌─────────────┴──────────┐  ┌─────────────────────┐ │
│  │      Next.js App       │  │    Admin Panel      │ │
│  │   (User Interface)     │  │   (Management)      │ │
│  └─────────────┬──────────┘  └─────────────────────┘ │
└─────────────────┼───────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────┐
│                 │       API Gateway                 │
├─────────────────┼───────────────────────────────────┤
│  ┌─────────────┴──────────┐  ┌─────────────────────┐ │
│  │    Authentication      │  │    Rate Limiting    │ │
│  │      Service           │  │      Service        │ │
│  └────────────────────────┘  └─────────────────────┘ │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────┐
│                 │    Application Layer              │
├─────────────────┼───────────────────────────────────┤
│  ┌──────────────┴────┐ ┌──────────┐ ┌─────────────┐  │
│  │   User Service    │ │ Product  │ │   Order     │  │
│  │                   │ │ Service  │ │  Service    │  │
│  └───────────────────┘ └──────────┘ └─────────────┘  │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────┐
│                 │      Data Layer                   │
├─────────────────┼───────────────────────────────────┤
│  ┌──────────────┴────┐ ┌──────────┐ ┌─────────────┐  │
│  │   PostgreSQL      │ │  Redis   │ │ Elasticsearch│  │
│  │   (Primary DB)    │ │ (Cache)  │ │   (Search)   │  │
│  └───────────────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

## マルチテナントアーキテクチャ

### データベース設計

```prisma
// prisma/schema.prisma - マルチテナント対応
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// テナント管理
model Tenant {
  id          String   @id @default(cuid())
  name        String
  domain      String   @unique
  plan        Plan     @default(BASIC)
  status      TenantStatus @default(ACTIVE)
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  projects    Project[]
  subscriptions Subscription[]
  auditLogs   AuditLog[]
  
  @@map("tenants")
}

// ユーザー管理（テナント分離）
model User {
  id          String   @id @default(cuid())
  tenantId    String
  email       String
  name        String
  role        UserRole @default(MEMBER)
  permissions Permission[]
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, email])
  @@index([tenantId, email])
  @@map("users")
}

// RBAC (Role-Based Access Control)
model Permission {
  id          String @id @default(cuid())
  name        String
  resource    String
  action      Action
  conditions  Json?
  
  users       User[]
  roles       Role[]
  
  @@unique([resource, action])
  @@map("permissions")
}

model Role {
  id          String @id @default(cuid())
  tenantId    String
  name        String
  description String?
  permissions Permission[]
  users       User[]
  
  tenant      Tenant @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, name])
  @@map("roles")
}

// 監査ログ
model AuditLog {
  id          String   @id @default(cuid())
  tenantId    String
  userId      String
  action      String
  resource    String
  resourceId  String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, createdAt])
  @@index([userId, createdAt])
  @@map("audit_logs")
}

enum Plan {
  BASIC
  PROFESSIONAL
  ENTERPRISE
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  TERMINATED
}

enum UserRole {
  SUPER_ADMIN
  TENANT_ADMIN
  MANAGER
  MEMBER
  VIEWER
}

enum Action {
  CREATE
  READ
  UPDATE
  DELETE
  EXECUTE
}
```

## エンタープライズセキュリティ

### セキュリティミドルウェア

```typescript
// lib/security/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { verifyJWT } from './jwt'
import { checkPermissions } from './rbac'
import { auditLogger } from './audit'

export class SecurityMiddleware {
  // レート制限
  static rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      auditLogger.log({
        action: 'RATE_LIMIT_EXCEEDED',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      })
    }
  })

  // CSRF保護
  static async csrfProtection(request: NextRequest) {
    const token = request.headers.get('x-csrf-token')
    const sessionToken = request.cookies.get('csrf-token')?.value

    if (!token || !sessionToken || token !== sessionToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
  }

  // 入力値検証
  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .trim()
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item))
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value)
      }
      return sanitized
    }
    
    return data
  }

  // SQL インジェクション保護
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /('|(\\)|;|--|\||\/\*|\*\/)/g,
      /(script|javascript|vbscript|onload|onerror|onclick)/gi
    ]
    
    return sqlPatterns.some(pattern => pattern.test(input))
  }
}
```

### 暗号化サービス

```typescript
// lib/security/encryption.ts
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

  // データ暗号化
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.ALGORITHM, this.KEY)
    cipher.setAAD(Buffer.from('additional-data'))

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const tag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  // データ復号化
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.ALGORITHM, this.KEY)
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))
    decipher.setAAD(Buffer.from('additional-data'))

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // パスワードハッシュ化
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  // パスワード検証
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // ランダムトークン生成
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // デジタル署名
  static sign(data: string, privateKey: string): string {
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(data)
    return sign.sign(privateKey, 'hex')
  }

  // デジタル署名検証
  static verify(data: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(data)
    return verify.verify(publicKey, signature, 'hex')
  }
}
```

## 高可用性とスケーラビリティ

### ロードバランシング

```typescript
// lib/loadbalancer/healthcheck.ts
export class HealthCheckService {
  private servers: Server[] = []
  
  constructor(servers: ServerConfig[]) {
    this.servers = servers.map(config => new Server(config))
  }

  async checkHealth(): Promise<HealthReport[]> {
    const checks = this.servers.map(async (server) => {
      try {
        const response = await fetch(`${server.url}/health`, {
          timeout: 5000
        })
        
        const metrics = await response.json()
        
        return {
          serverId: server.id,
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: metrics.responseTime,
          cpuUsage: metrics.cpuUsage,
          memoryUsage: metrics.memoryUsage,
          activeConnections: metrics.activeConnections,
          lastCheck: new Date()
        }
      } catch (error) {
        return {
          serverId: server.id,
          status: 'unhealthy',
          error: error.message,
          lastCheck: new Date()
        }
      }
    })

    return Promise.all(checks)
  }

  getHealthyServers(): Server[] {
    return this.servers.filter(server => server.isHealthy)
  }

  // ラウンドロビン負荷分散
  getNextServer(): Server | null {
    const healthyServers = this.getHealthyServers()
    if (healthyServers.length === 0) return null

    const server = healthyServers[this.currentIndex % healthyServers.length]
    this.currentIndex++
    return server
  }

  // 重み付きロードバランシング
  getWeightedServer(): Server | null {
    const healthyServers = this.getHealthyServers()
    if (healthyServers.length === 0) return null

    const totalWeight = healthyServers.reduce((sum, server) => sum + server.weight, 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    for (const server of healthyServers) {
      currentWeight += server.weight
      if (random <= currentWeight) {
        return server
      }
    }

    return healthyServers[0]
  }
}
```

### キャッシング戦略

```typescript
// lib/cache/distributed-cache.ts
import Redis from 'ioredis'

export class DistributedCache {
  private redis: Redis
  private localCache: Map<string, CacheEntry> = new Map()

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    })
  }

  // 多層キャッシュ
  async get(key: string): Promise<any> {
    // L1: メモリキャッシュ
    const localEntry = this.localCache.get(key)
    if (localEntry && !this.isExpired(localEntry)) {
      return localEntry.value
    }

    // L2: Redis キャッシュ
    try {
      const redisValue = await this.redis.get(key)
      if (redisValue) {
        const parsed = JSON.parse(redisValue)
        // ローカルキャッシュにも保存
        this.setLocal(key, parsed.value, 60) // 1分間
        return parsed.value
      }
    } catch (error) {
      console.error('Redis get error:', error)
    }

    return null
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const cacheValue = {
      value,
      timestamp: Date.now(),
      ttl: ttlSeconds
    }

    // Redis に保存
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(cacheValue))
    } catch (error) {
      console.error('Redis set error:', error)
    }

    // ローカルキャッシュにも保存
    this.setLocal(key, value, Math.min(ttlSeconds, 300)) // 最大5分
  }

  // キャッシュ無効化
  async invalidate(pattern: string): Promise<void> {
    // Redis からの削除
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis invalidate error:', error)
    }

    // ローカルキャッシュからの削除
    for (const [key] of this.localCache) {
      if (this.matchPattern(key, pattern)) {
        this.localCache.delete(key)
      }
    }
  }

  // キャッシュアサイド パターン
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetchFn()
    await this.set(key, value, ttlSeconds)
    return value
  }

  private setLocal(key: string, value: any, ttlSeconds: number): void {
    this.localCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return regex.test(key)
  }
}

interface CacheEntry {
  value: any
  timestamp: number
  ttl: number
}
```

## 監視とアラート

### 包括的監視システム

```typescript
// lib/monitoring/comprehensive-monitor.ts
import { EventEmitter } from 'events'

export class ComprehensiveMonitor extends EventEmitter {
  private metrics: Map<string, MetricData[]> = new Map()
  private alerts: AlertRule[] = []
  
  // メトリクス収集
  recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    const metric: MetricData = {
      name,
      value,
      tags,
      timestamp: Date.now()
    }

    const existing = this.metrics.get(name) || []
    existing.push(metric)
    
    // 直近1時間のデータのみ保持
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const filtered = existing.filter(m => m.timestamp > oneHourAgo)
    
    this.metrics.set(name, filtered)

    // アラート評価
    this.evaluateAlerts(metric)

    // 外部監視サービスに送信
    this.sendToExternalMonitoring(metric)
  }

  // ビジネスメトリクス
  recordBusinessMetric(metric: BusinessMetric): void {
    this.recordMetric(`business.${metric.type}`, metric.value, {
      tenantId: metric.tenantId,
      userId: metric.userId,
      ...metric.metadata
    })
  }

  // アプリケーションパフォーマンス
  recordPerformanceMetric(operation: string, duration: number, success: boolean): void {
    this.recordMetric(`performance.${operation}.duration`, duration)
    this.recordMetric(`performance.${operation}.success`, success ? 1 : 0)
  }

  // システムヘルス
  recordSystemHealth(): void {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    this.recordMetric('system.memory.used', memUsage.heapUsed)
    this.recordMetric('system.memory.total', memUsage.heapTotal)
    this.recordMetric('system.cpu.user', cpuUsage.user)
    this.recordMetric('system.cpu.system', cpuUsage.system)

    // イベントループラグ
    const start = process.hrtime()
    setImmediate(() => {
      const delta = process.hrtime(start)
      const lag = delta[0] * 1000 + delta[1] * 1e-6
      this.recordMetric('system.eventloop.lag', lag)
    })
  }

  // アラートルール追加
  addAlert(rule: AlertRule): void {
    this.alerts.push(rule)
  }

  private evaluateAlerts(metric: MetricData): void {
    for (const alert of this.alerts) {
      if (alert.metricName === metric.name) {
        const shouldTrigger = this.evaluateAlertCondition(alert, metric)
        
        if (shouldTrigger && !alert.triggered) {
          alert.triggered = true
          alert.triggeredAt = new Date()
          this.triggerAlert(alert, metric)
        } else if (!shouldTrigger && alert.triggered) {
          alert.triggered = false
          this.resolveAlert(alert)
        }
      }
    }
  }

  private async triggerAlert(alert: AlertRule, metric: MetricData): Promise<void> {
    const alertData = {
      rule: alert,
      metric,
      timestamp: new Date(),
      severity: alert.severity
    }

    this.emit('alert', alertData)

    // 通知の送信
    await this.sendNotification(alertData)
  }

  private async sendNotification(alertData: any): Promise<void> {
    // Slack 通知
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Alert: ${alertData.rule.name}`,
          attachments: [{
            color: alertData.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Metric', value: alertData.metric.name, short: true },
              { title: 'Value', value: alertData.metric.value.toString(), short: true },
              { title: 'Threshold', value: alertData.rule.threshold.toString(), short: true },
              { title: 'Time', value: alertData.timestamp.toISOString(), short: true }
            ]
          }]
        })
      })
    }

    // メール通知
    if (alertData.severity === 'critical') {
      await this.sendEmailAlert(alertData)
    }
  }

  private async sendToExternalMonitoring(metric: MetricData): Promise<void> {
    // Prometheus/Grafana
    if (process.env.PROMETHEUS_GATEWAY) {
      // Push Gateway に送信
    }

    // DataDog
    if (process.env.DATADOG_API_KEY) {
      // DataDog API に送信
    }

    // New Relic
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      // New Relic API に送信
    }
  }

  // ダッシュボード用データ取得
  getDashboardData(timeRange: TimeRange): DashboardData {
    const now = Date.now()
    const startTime = now - timeRange.duration

    const data: DashboardData = {
      systemHealth: this.getSystemHealthData(startTime),
      performance: this.getPerformanceData(startTime),
      business: this.getBusinessData(startTime),
      alerts: this.getActiveAlerts(),
      uptime: this.calculateUptime(startTime)
    }

    return data
  }
}

interface MetricData {
  name: string
  value: number
  tags: Record<string, string>
  timestamp: number
}

interface AlertRule {
  name: string
  metricName: string
  condition: 'gt' | 'lt' | 'eq'
  threshold: number
  duration: number
  severity: 'warning' | 'critical'
  triggered: boolean
  triggeredAt?: Date
}

interface BusinessMetric {
  type: 'user_signup' | 'order_placed' | 'payment_completed' | 'error_occurred'
  value: number
  tenantId: string
  userId?: string
  metadata: Record<string, any>
}
```

## DevOps統合

### Infrastructure as Code

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        max_attempts: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    deploy:
      resources:
        limits:
          memory: 2G

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  prometheus_data:
  grafana_data:
```

### Kubernetes デプロイメント

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enterprise-app
  labels:
    app: enterprise-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: enterprise-app
  template:
    metadata:
      labels:
        app: enterprise-app
    spec:
      containers:
      - name: app
        image: enterprise-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
      volumes:
      - name: config-volume
        configMap:
          name: app-config

---
apiVersion: v1
kind: Service
metadata:
  name: enterprise-app-service
spec:
  selector:
    app: enterprise-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: enterprise-app-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - app.company.com
    secretName: app-tls
  rules:
  - host: app.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: enterprise-app-service
            port:
              number: 80
```

## 演習問題

1. **災害復旧計画**: バックアップ・リストア戦略の設計と実装
2. **セキュリティ監査**: 脆弱性スキャンと対策の実装
3. **パフォーマンスチューニング**: ボトルネック特定と最適化
4. **運用自動化**: 監視・アラート・自動復旧システムの構築

## 最終プロジェクト要件

### 必須機能
- [ ] マルチテナント対応
- [ ] RBAC認証・認可システム
- [ ] 監査ログ機能
- [ ] リアルタイム通信
- [ ] 高可用性アーキテクチャ
- [ ] セキュリティ対策（OWASP Top 10対応）
- [ ] 包括的テスト（カバレッジ90%以上）
- [ ] パフォーマンス監視
- [ ] CI/CDパイプライン
- [ ] コンテナ化・オーケストレーション

### 品質基準
- Response Time: 平均 < 200ms
- Availability: 99.9%
- Security: OWASP準拠
- Scalability: 水平スケーリング対応
- Maintainability: コードレビュー・ドキュメント完備

## 実行方法

```bash
# 開発環境
npm run dev:enterprise

# テスト実行
npm run test:all

# ビルド
npm run build:production

# デプロイ
npm run deploy:production

# 監視
npm run monitoring:start
```

## 総まとめ

🎉 **おめでとうございます！**

100レッスンを通じて、以下を習得しました：

### 🏗️ **技術スタック**
- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: API Routes, Server Actions
- **Database**: Prisma, PostgreSQL
- **Cache**: Redis
- **Search**: Elasticsearch
- **Auth**: NextAuth.js, JWT
- **Testing**: Jest, Playwright
- **DevOps**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana

### 📈 **開発スキル**
1. **基礎**: TypeScript完全理解
2. **中級**: 状態管理、認証、データベース設計
3. **応用**: 実践的Webアプリケーション開発
4. **発展**: パフォーマンス最適化、セキュリティ
5. **企業級**: スケーラブルなシステム設計

### 🚀 **実践経験**
- Eコマースサイト構築
- ブログシステム開発
- ダッシュボード作成
- チャットアプリケーション
- タスク管理システム

これで、あなたは**本格的なNext.js開発者**として、企業レベルのWebアプリケーションを設計・開発・運用できるスキルを身につけました。

今後は、この知識を基に更なる挑戦を続け、素晴らしいWebアプリケーションを創造してください！

**Happy Coding! 🎯**