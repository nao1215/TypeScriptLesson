# Lesson 52: 認証と認可 (Authentication & Authorization)

## 学習目標
このレッスンでは、TypeScriptを使ったWebアプリケーションの認証と認可システムを学習します。

### 学習内容
1. JWTトークンベース認証システム
2. OAuth2/OpenID Connect実装
3. セッション管理とリフレッシュトークン
4. ロールベースアクセス制御 (RBAC)
5. セキュアなストレージとXSS防止

## 実装する機能

### 1. JWT認証システム
トークンの生成、検証、更新機能を含む完全なJWT認証システムを実装します。

### 2. OAuth2フロー
Google、GitHub、Microsoft等のOAuth2プロバイダーとの連携機能を実装します。

### 3. 認可システム
ユーザーロール、パーミッション、リソースベースアクセス制御システムを構築します。

### 4. セキュリティミドルウェア
XSS、CSRF、インジェクション攻撃から保護する包括的なセキュリティシステムを実装します。

### 5. セッション管理
サーバーサイドセッション、クライアントサイドトークン管理の両方に対応します。

## 型定義の特徴

### 認証関連型
```typescript
interface User {
  id: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  metadata: UserMetadata;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}
```

### 認可システム型
```typescript
interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

interface Role {
  name: string;
  permissions: Permission[];
  hierarchy: number;
}
```

## 実用的な使用例

### JWT認証の使用
```typescript
const authService = new AuthService();

// ログイン
const tokens = await authService.login('user@example.com', 'password');

// トークンの自動更新
authService.enableAutoRefresh();

// 認証状態の確認
if (authService.isAuthenticated()) {
  const user = authService.getCurrentUser();
}
```

### 認可チェック
```typescript
const authz = new AuthorizationService();

// リソースアクセス権限の確認
if (authz.can(user, 'posts', 'create')) {
  // 投稿作成処理
}

// ロールベースチェック
if (authz.hasRole(user, 'admin')) {
  // 管理者機能
}
```

## セキュリティ考慮事項

### 1. トークン管理
- HttpOnly Cookiesの使用
- セキュアなストレージ戦略
- トークンローテーション

### 2. 攻撃対策
- CSRF保護
- XSS防止
- SQL/NoSQLインジェクション対策

### 3. 暗号化
- パスワードハッシュ化
- データ暗号化
- セキュア通信

## ビルドとテスト

```bash
# ビルド
npm run build

# テスト実行
npm test

# セキュリティ監査
npm audit
```

## 次のステップ
次のLesson 53では、パフォーマンス最適化について学習し、高速で効率的なWebアプリケーション開発技術を習得します。