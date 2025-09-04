# Lesson 39: 高度なエラーハンドリング (Advanced Error Handling)

## 学習目標
- Result/Eitherパターンによる関数型エラーハンドリング
- カスタムエラー型と階層化されたエラー処理
- 型安全なtry-catchパターンの実装
- 関数型エラーハンドリングとモナド的処理
- async/awaitとPromiseでの高度なエラー処理

## 関数型エラーハンドリング

### Result パターンの実装

```typescript
// 基本的なResult型
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

// Result型のヘルパー関数
const Ok = <T>(data: T): Result<T, never> => ({ success: true, data })
const Err = <E>(error: E): Result<never, E> => ({ success: false, error })

// Result型の操作関数
function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (result.success) {
    return Ok(fn(result.data))
  } else {
    return result
  }
}

function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (result.success) {
    return fn(result.data)
  } else {
    return result
  }
}

function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (result.success) {
    return result
  } else {
    return Err(fn(result.error))
  }
}
```

### Either パターンの実装

```typescript
// Either型（Left: エラー、Right: 成功）
type Either<L, R> = 
  | { tag: 'left'; value: L }
  | { tag: 'right'; value: R }

const Left = <L>(value: L): Either<L, never> => ({ tag: 'left', value })
const Right = <R>(value: R): Either<never, R> => ({ tag: 'right', value })

// Either型の操作関数
function eitherMap<L, R, T>(
  either: Either<L, R>,
  fn: (value: R) => T
): Either<L, T> {
  if (either.tag === 'right') {
    return Right(fn(either.value))
  } else {
    return either
  }
}

function eitherChain<L, R, T>(
  either: Either<L, R>,
  fn: (value: R) => Either<L, T>
): Either<L, T> {
  if (either.tag === 'right') {
    return fn(either.value)
  } else {
    return either
  }
}
```

## カスタムエラー型

### エラー階層の定義

```typescript
// ベースエラークラス
abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  
  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
  }
}

// 具体的なエラータイプ
class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400
  
  constructor(
    message: string,
    public readonly field?: string,
    context?: Record<string, any>
  ) {
    super(message, context)
  }
}

class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404
  
  constructor(
    resource: string,
    id: string | number,
    context?: Record<string, any>
  ) {
    super(`${resource} with id ${id} not found`, context)
  }
}

class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR'
  readonly statusCode = 500
  
  constructor(
    message: string,
    public readonly query?: string,
    context?: Record<string, any>
  ) {
    super(message, context)
  }
}

class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR'
  readonly statusCode = 502
  
  constructor(
    message: string,
    public readonly url?: string,
    context?: Record<string, any>
  ) {
    super(message, context)
  }
}

// エラー型のユニオン
type DomainError = ValidationError | NotFoundError | DatabaseError | NetworkError
```

### 型安全なエラーハンドラー

```typescript
// エラーハンドラーの型定義
type ErrorHandler<T extends AppError, R> = (error: T) => R

// エラータイプ別のハンドラーマップ
type ErrorHandlers<R> = {
  ValidationError?: ErrorHandler<ValidationError, R>
  NotFoundError?: ErrorHandler<NotFoundError, R>
  DatabaseError?: ErrorHandler<DatabaseError, R>
  NetworkError?: ErrorHandler<NetworkError, R>
  default?: ErrorHandler<AppError, R>
}

// 型安全なエラー処理関数
function handleError<R>(
  error: DomainError,
  handlers: ErrorHandlers<R>
): R {
  const handler = handlers[error.constructor.name as keyof ErrorHandlers<R>] || handlers.default
  
  if (!handler) {
    throw new Error(`No handler found for error type: ${error.constructor.name}`)
  }
  
  return handler(error as any)
}
```

## 型安全なtry-catch

### Safe実行関数

```typescript
// 同期処理用のsafe関数
function safe<T>(fn: () => T): Result<T, Error> {
  try {
    return Ok(fn())
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)))
  }
}

// 非同期処理用のsafeAsync関数
async function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    const result = await fn()
    return Ok(result)
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)))
  }
}

// 使用例
const result = safe(() => JSON.parse('{"valid": "json"}'))
const asyncResult = await safeAsync(() => fetch('/api/data').then(r => r.json()))
```

### パイプライン処理

```typescript
// パイプライン処理でのエラーハンドリング
async function processUser(userId: string): Promise<Result<string, DomainError>> {
  const userResult = await getUserById(userId)
  if (!userResult.success) return userResult
  
  const validationResult = validateUser(userResult.data)
  if (!validationResult.success) return validationResult
  
  const updateResult = await updateUserProfile(validationResult.data)
  if (!updateResult.success) return updateResult
  
  return Ok(`User ${userId} processed successfully`)
}

// より関数型的なアプローチ
async function processUserFunctional(userId: string): Promise<Result<string, DomainError>> {
  return flatMap(
    await getUserById(userId),
    user => flatMap(
      validateUser(user),
      validUser => map(
        await updateUserProfile(validUser),
        () => `User ${userId} processed successfully`
      )
    )
  )
}
```

## モナド的エラーハンドリング

### Maybe モナド

```typescript
// Maybe型の実装
type Maybe<T> = 
  | { tag: 'some'; value: T }
  | { tag: 'none' }

const Some = <T>(value: T): Maybe<T> => ({ tag: 'some', value })
const None: Maybe<never> = { tag: 'none' }

// Maybe型の操作関数
function maybeMap<T, U>(maybe: Maybe<T>, fn: (value: T) => U): Maybe<U> {
  return maybe.tag === 'some' ? Some(fn(maybe.value)) : None
}

function maybeChain<T, U>(maybe: Maybe<T>, fn: (value: T) => Maybe<U>): Maybe<U> {
  return maybe.tag === 'some' ? fn(maybe.value) : None
}

function maybeFilter<T>(maybe: Maybe<T>, predicate: (value: T) => boolean): Maybe<T> {
  return maybe.tag === 'some' && predicate(maybe.value) ? maybe : None
}

// null/undefinedからMaybeへの変換
function fromNullable<T>(value: T | null | undefined): Maybe<T> {
  return value != null ? Some(value) : None
}
```

### IO モナド

```typescript
// IO操作の安全な実行
class IO<T> {
  constructor(private effect: () => T) {}
  
  static of<T>(value: T): IO<T> {
    return new IO(() => value)
  }
  
  map<U>(fn: (value: T) => U): IO<U> {
    return new IO(() => fn(this.effect()))
  }
  
  flatMap<U>(fn: (value: T) => IO<U>): IO<U> {
    return new IO(() => fn(this.effect()).effect())
  }
  
  run(): T {
    return this.effect()
  }
  
  // エラーハンドリング付きの実行
  safeRun(): Result<T, Error> {
    return safe(() => this.effect())
  }
}

// 使用例
const readFile = (filename: string): IO<string> =>
  new IO(() => require('fs').readFileSync(filename, 'utf8'))

const processFile = (filename: string): IO<Result<number, Error>> =>
  readFile(filename)
    .map(content => safe(() => JSON.parse(content)))
    .map(result => map(result, (data: any) => Object.keys(data).length))
```

## 実用的なエラーハンドリングパターン

### リトライ機構

```typescript
// リトライ設定
interface RetryOptions {
  maxRetries: number
  delay: number
  backoff?: 'linear' | 'exponential'
  retryIf?: (error: Error) => boolean
}

// リトライ機能付きの実行関数
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<Result<T, Error[]>> {
  const errors: Error[] = []
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const result = await operation()
      return Ok(result)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(err)
      
      if (attempt === options.maxRetries) {
        break
      }
      
      if (options.retryIf && !options.retryIf(err)) {
        break
      }
      
      const delay = options.backoff === 'exponential' 
        ? options.delay * Math.pow(2, attempt)
        : options.delay
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return Err(errors)
}

// 使用例
async function fetchDataWithRetry(url: string): Promise<Result<any, Error[]>> {
  return withRetry(
    () => fetch(url).then(r => r.json()),
    {
      maxRetries: 3,
      delay: 1000,
      backoff: 'exponential',
      retryIf: (error) => error.message.includes('network')
    }
  )
}
```

### サーキットブレーカー

```typescript
// サーキットブレーカーの状態
type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerOptions {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
}

class CircuitBreaker<T> {
  private state: CircuitState = 'closed'
  private failures = 0
  private lastFailureTime = 0
  private successCount = 0
  
  constructor(
    private operation: () => Promise<T>,
    private options: CircuitBreakerOptions
  ) {}
  
  async execute(): Promise<Result<T, Error>> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.recoveryTimeout) {
        this.state = 'half-open'
        this.successCount = 0
      } else {
        return Err(new Error('Circuit breaker is open'))
      }
    }
    
    try {
      const result = await this.operation()
      this.onSuccess()
      return Ok(result)
    } catch (error) {
      this.onFailure()
      return Err(error instanceof Error ? error : new Error(String(error)))
    }
  }
  
  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= 3) { // 3回成功で回復
        this.state = 'closed'
        this.failures = 0
      }
    } else {
      this.failures = 0
    }
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open'
    }
  }
}
```

## Promise とエラーハンドリング

### Promise チェーンでのエラー伝播

```typescript
// Promise チェーンでのResult型利用
async function processDataPipeline(input: string): Promise<Result<any, Error>> {
  const parseResult = safe(() => JSON.parse(input))
  if (!parseResult.success) return parseResult
  
  const validateResult = await safeAsync(() => validateSchema(parseResult.data))
  if (!validateResult.success) return validateResult
  
  const transformResult = safe(() => transformData(validateResult.data))
  if (!transformResult.success) return transformResult
  
  const saveResult = await safeAsync(() => saveToDatabase(transformResult.data))
  return saveResult
}

// 並列処理でのエラーハンドリング
async function processParallel<T>(
  items: T[],
  processor: (item: T) => Promise<Result<any, Error>>
): Promise<{ successes: any[]; failures: Error[] }> {
  const results = await Promise.all(items.map(processor))
  
  const successes: any[] = []
  const failures: Error[] = []
  
  results.forEach(result => {
    if (result.success) {
      successes.push(result.data)
    } else {
      failures.push(result.error)
    }
  })
  
  return { successes, failures }
}
```

## まとめ

高度なエラーハンドリングは以下の特徴を持ちます：

1. **関数型パターン**: Result/Either型による明示的エラー処理
2. **型安全性**: カスタムエラー型と型安全なハンドラー
3. **組み合わせ可能性**: モナド的な操作による処理の組み合わせ
4. **実用的パターン**: リトライ、サーキットブレーカー等
5. **非同期対応**: Promise/async-awaitでの高度なエラー制御

これらの技術を活用することで、堅牢で保守性の高いエラーハンドリングを実現できます。

## 次回予告

最後のLesson 40では、TypeScriptのパフォーマンス最適化について学習し、コンパイル時間の短縮やバンドルサイズの最適化を習得します。

## 実習

`src/exercise.ts`の演習問題に挑戦してみましょう。高度なエラーハンドリングパターンを実装することで、理解を深めることができます。