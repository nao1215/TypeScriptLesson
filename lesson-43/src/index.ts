/**
 * Lesson 43: async/await (Async/Await)
 * Promiseからasync/awaitへの変換とエラーハンドリング
 */

// ============================================================================
// 1. 基本的なPromiseからasync/awaitへの変換
// ============================================================================

// Promise版：チェーンが複雑になりがち
function fetchUserDataWithPromise(userId: number): Promise<string> {
  return fetch(`/api/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(userData => {
      return fetch(`/api/users/${userId}/profile`);
    })
    .then(response => response.json())
    .then(profileData => {
      return `User: ${profileData.name}, Email: ${profileData.email}`;
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      throw error;
    });
}

// async/await版：読みやすく、デバッグしやすい
async function fetchUserDataWithAsyncAwait(userId: number): Promise<string> {
  try {
    // 順次実行
    const userResponse = await fetch(`/api/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error(`HTTP error! status: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    
    const profileResponse = await fetch(`/api/users/${userId}/profile`);
    if (!profileResponse.ok) {
      throw new Error(`HTTP error! status: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    
    return `User: ${profileData.name}, Email: ${profileData.email}`;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// ============================================================================
// 2. エラーハンドリングパターン
// ============================================================================

// カスタムエラークラス
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class NetworkError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

// 包括的なエラーハンドリング
async function robustApiCall<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    
    // HTTPエラーのチェック
    if (!response.ok) {
      throw new APIError(
        `API call failed: ${response.statusText}`,
        response.status,
        url
      );
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // ネットワークエラー vs API エラーの区別
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new NetworkError('Network connection failed', error);
    }
    
    if (error instanceof APIError) {
      // APIエラーはそのまま再スロー
      throw error;
    }
    
    // その他の予期しないエラー
    throw new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// エラーハンドリングの使用例
async function handleUserRequest(userId: number): Promise<void> {
  try {
    const userData = await robustApiCall<{name: string; email: string}>(`/api/users/${userId}`);
    console.log(`Retrieved user: ${userData.name}`);
  } catch (error) {
    if (error instanceof APIError) {
      if (error.statusCode === 404) {
        console.log('User not found');
      } else if (error.statusCode >= 500) {
        console.error('Server error:', error.message);
      } else {
        console.error('Client error:', error.message);
      }
    } else if (error instanceof NetworkError) {
      console.error('Network issue:', error.message);
      // リトライロジックを実装可能
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// ============================================================================
// 3. 並列実行 vs 順次実行
// ============================================================================

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface UserPosts {
  userId: number;
  posts: Array<{id: number; title: string; content: string}>;
}

interface UserSettings {
  userId: number;
  theme: string;
  notifications: boolean;
}

// 順次実行（遅い）
async function fetchUserDataSequential(userId: number): Promise<{
  profile: UserProfile;
  posts: UserPosts;
  settings: UserSettings;
}> {
  console.time('Sequential execution');
  
  const profile = await robustApiCall<UserProfile>(`/api/users/${userId}`);
  const posts = await robustApiCall<UserPosts>(`/api/users/${userId}/posts`);
  const settings = await robustApiCall<UserSettings>(`/api/users/${userId}/settings`);
  
  console.timeEnd('Sequential execution');
  
  return { profile, posts, settings };
}

// 並列実行（速い）
async function fetchUserDataParallel(userId: number): Promise<{
  profile: UserProfile;
  posts: UserPosts;
  settings: UserSettings;
}> {
  console.time('Parallel execution');
  
  // 並列実行
  const [profile, posts, settings] = await Promise.all([
    robustApiCall<UserProfile>(`/api/users/${userId}`),
    robustApiCall<UserPosts>(`/api/users/${userId}/posts`),
    robustApiCall<UserSettings>(`/api/users/${userId}/settings`)
  ]);
  
  console.timeEnd('Parallel execution');
  
  return { profile, posts, settings };
}

// 一部失敗を許容する並列実行
async function fetchUserDataWithFallback(userId: number): Promise<{
  profile: UserProfile | null;
  posts: UserPosts | null;
  settings: UserSettings | null;
}> {
  const results = await Promise.allSettled([
    robustApiCall<UserProfile>(`/api/users/${userId}`),
    robustApiCall<UserPosts>(`/api/users/${userId}/posts`),
    robustApiCall<UserSettings>(`/api/users/${userId}/settings`)
  ]);
  
  return {
    profile: results[0].status === 'fulfilled' ? results[0].value : null,
    posts: results[1].status === 'fulfilled' ? results[1].value : null,
    settings: results[2].status === 'fulfilled' ? results[2].value : null,
  };
}

// ============================================================================
// 4. 非同期イテレーターとジェネレーター
// ============================================================================

// 非同期ジェネレーター：ページネーション対応APIクライアント
async function* fetchAllPages<T>(baseUrl: string, pageSize: number = 20): AsyncGenerator<T, void, undefined> {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await robustApiCall<{
        data: T[];
        pagination: { hasNext: boolean; total: number };
      }>(`${baseUrl}?page=${page}&size=${pageSize}`);
      
      // 各アイテムを個別にyield
      for (const item of response.data) {
        yield item;
      }
      
      hasMore = response.pagination.hasNext;
      page++;
    } catch (error) {
      console.error(`Failed to fetch page ${page}:`, error);
      throw error;
    }
  }
}

// 非同期イテレーターの使用例
async function processAllUsers(): Promise<void> {
  try {
    for await (const user of fetchAllPages<UserProfile>('/api/users')) {
      console.log(`Processing user: ${user.name}`);
      
      // 各ユーザーに対する処理
      await processUser(user);
    }
  } catch (error) {
    console.error('Error processing users:', error);
  }
}

async function processUser(user: UserProfile): Promise<void> {
  // 実際の処理をシミュレート
  await new Promise(resolve => setTimeout(resolve, 100));
}

// ============================================================================
// 5. 高度なパターン：リトライ機能付きAPI呼び出し
// ============================================================================

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === options.maxRetries) {
        throw new Error(`Operation failed after ${options.maxRetries + 1} attempts. Last error: ${lastError.message}`);
      }
      
      // 指数バックオフで待機
      const delay = Math.min(
        options.baseDelay * Math.pow(options.backoffFactor, attempt),
        options.maxDelay
      );
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// リトライ機能の使用例
async function fetchWithRetry<T>(url: string): Promise<T> {
  return withRetry(
    () => robustApiCall<T>(url),
    {
      maxRetries: 3,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 2
    }
  );
}

// ============================================================================
// 6. タイムアウト付き非同期処理
// ============================================================================

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// タイムアウトの使用例
async function fetchUserWithTimeout(userId: number): Promise<UserProfile> {
  return withTimeout(
    robustApiCall<UserProfile>(`/api/users/${userId}`),
    5000 // 5秒でタイムアウト
  );
}

// ============================================================================
// 7. 実用的なサンプル：バッチ処理
// ============================================================================

// バッチ処理：大量のデータを効率的に処理
async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  concurrency: number = 3
): Promise<R[]> {
  const results: R[] = [];
  
  // アイテムをバッチに分割
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // 並列度を制限して処理
    const batchPromises: Promise<R>[] = [];
    for (let j = 0; j < batch.length; j += concurrency) {
      const concurrentBatch = batch.slice(j, j + concurrency);
      const concurrentPromises = concurrentBatch.map(processor);
      batchPromises.push(...concurrentPromises);
    }
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
  }
  
  return results;
}

// バッチ処理の使用例
async function processAllUserEmails(userIds: number[]): Promise<void> {
  const results = await processBatch(
    userIds,
    async (userId) => {
      const user = await fetchWithRetry<UserProfile>(`/api/users/${userId}`);
      // メール送信処理
      await sendEmail(user.email, 'Welcome!', 'Thank you for joining us!');
      return { userId, sent: true };
    },
    5,  // バッチサイズ
    2   // 並列度
  );
  
  console.log(`Processed ${results.length} users`);
}

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // メール送信のシミュレート
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Email sent to ${to}: ${subject}`);
}

// ============================================================================
// 使用例とデモンストレーション
// ============================================================================

export {
  fetchUserDataWithAsyncAwait,
  robustApiCall,
  fetchUserDataParallel,
  fetchUserDataWithFallback,
  fetchAllPages,
  withRetry,
  withTimeout,
  processBatch,
  processAllUsers,
  APIError,
  NetworkError
};

// デモンストレーション関数
export async function demonstrateAsyncAwait(): Promise<void> {
  console.log('=== Lesson 43: async/await Demonstration ===');
  
  try {
    // 並列処理のデモ
    console.log('\n1. Parallel vs Sequential execution:');
    const userId = 123;
    
    // 注意: 実際のAPIがない場合、これらは失敗します
    // const sequentialResult = await fetchUserDataSequential(userId);
    // const parallelResult = await fetchUserDataParallel(userId);
    
    // エラーハンドリングのデモ
    console.log('\n2. Error handling:');
    try {
      await handleUserRequest(999); // 存在しないユーザー
    } catch (error) {
      console.log('Handled error gracefully');
    }
    
    // リトライ機能のデモ
    console.log('\n3. Retry mechanism:');
    try {
      const result = await withRetry(
        () => Promise.reject(new Error('Simulated failure')),
        { maxRetries: 2, baseDelay: 100, maxDelay: 1000, backoffFactor: 2 }
      );
    } catch (error) {
      console.log('Max retries reached');
    }
    
    // タイムアウトのデモ
    console.log('\n4. Timeout handling:');
    try {
      await withTimeout(
        new Promise(resolve => setTimeout(resolve, 2000)),
        1000
      );
    } catch (error) {
      console.log('Operation timed out as expected');
    }
    
    console.log('\nAsync/await demonstration completed!');
  } catch (error) {
    console.error('Demo error:', error);
  }
}