# Lesson 50: Web APIとデータフェッチ (Web APIs & Data Fetching)

## 学習目標
このレッスンでは、TypeScriptを使ったWeb APIとの連携、データフェッチの高度な手法を学習します。

### 学習内容
1. RESTful APIとの型安全な連携
2. GraphQLクライアントの実装
3. キャッシュ戦略とデータ正規化
4. 楽観的更新とオフラインサポート
5. APIエラーハンドリングとリトライロジック

## 実装する機能

### 1. RESTful APIクライアント
型安全なRESTful APIクライアントを実装し、レスポンスの型定義とバリデーションを行います。

### 2. GraphQLクライアント
GraphQLのクエリとミューテーションを型安全に実行するクライアントを作成します。

### 3. データキャッシュシステム
APIレスポンスをキャッシュし、効率的なデータ管理を行うシステムを実装します。

### 4. オフライン対応
ネットワーク状況に応じた楽観的更新とオフラインサポート機能を実装します。

### 5. エラーハンドリング
APIエラーの適切な処理とリトライロジックを実装します。

## 型定義の特徴

### APIレスポンス型
```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### GraphQLスキーマ型
```typescript
type GraphQLQuery<TVariables = {}> = {
  query: string;
  variables?: TVariables;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};
```

## 実用的な使用例

### APIクライアントの使用
```typescript
const apiClient = new ApiClient('https://api.example.com');

// 型安全なGETリクエスト
const users = await apiClient.get<User[]>('/users');

// キャッシュを使った効率的なデータ取得
const cachedUser = await apiClient.getCached<User>(`/users/${userId}`);
```

### GraphQLクライアントの使用
```typescript
const query = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        title
        content
      }
    }
  }
`;

const result = await graphqlClient.query<UserWithPosts>({
  query,
  variables: { id: 'user123' }
});
```

## パフォーマンス最適化

### 1. リクエストの最適化
- バッチング処理
- デバウンシング
- リクエストの重複排除

### 2. キャッシュ戦略
- メモリキャッシュ
- LocalStorageキャッシュ
- キャッシュの無効化戦略

### 3. ネットワーク最適化
- 圧縮の活用
- HTTP/2の利用
- CDNとの連携

## エラーハンドリングパターン

### 1. リトライロジック
- 指数バックオフ
- 条件付きリトライ
- サーキットブレーカー

### 2. フォールバック戦略
- キャッシュからのフォールバック
- デフォルト値の提供
- 部分的なデータ表示

## セキュリティ考慮事項

### 1. 認証とトークン管理
- JWTトークンの自動更新
- セキュアなトークン保存
- CSRF保護

### 2. データバリデーション
- レスポンススキーマ検証
- サニタイゼーション
- XSS対策

## ビルドとテスト

```bash
# ビルド
npm run build

# テスト実行
npm test

# 型チェック
npm run type-check
```

## 次のステップ
次のLesson 51では、ルーティングとナビゲーションについて学習し、SPA（Single Page Application）の基盤技術を習得します。