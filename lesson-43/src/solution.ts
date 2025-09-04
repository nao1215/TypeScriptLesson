/**
 * Lesson 43 解答例: async/await (Async/Await)
 */

// ============================================================================
// 演習 1 解答: Promise からasync/awaitへの変換
// ============================================================================

async function getUserDataWithAsyncAwait(userId: string): Promise<{name: string, posts: any[]}> {
  try {
    // ユーザー情報を取得
    const userResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error('User not found');
    }
    const user = await userResponse.json();
    
    // 投稿一覧を取得
    const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}/posts`);
    if (!postsResponse.ok) {
      throw new Error('Posts not found');
    }
    const posts = await postsResponse.json();
    
    return {
      name: user.name,
      posts: posts
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// ============================================================================
// 演習 2 解答: エラーハンドリングの実装
// ============================================================================

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class HTTPError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'HTTPError';
  }
}

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

async function robustFetch<T>(url: string): Promise<T> {
  try {
    // ネットワークリクエスト
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      // fetch自体が失敗した場合（ネットワークエラー）
      throw new NetworkError(`Network error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // HTTPステータスチェック
    if (!response.ok) {
      throw new HTTPError(`HTTP Error: ${response.status} ${response.statusText}`, response.status);
    }
    
    // JSON解析
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new ParseError(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    // エラータイプに応じた適切なログ出力
    if (error instanceof NetworkError) {
      console.error('Network issue detected:', error.message);
    } else if (error instanceof HTTPError) {
      console.error(`HTTP error ${error.status}:`, error.message);
    } else if (error instanceof ParseError) {
      console.error('Data parsing failed:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    
    throw error;
  }
}

// ============================================================================
// 演習 3 解答: 並列実行の最適化
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

interface Comment {
  id: number;
  postId: number;
  name: string;
  body: string;
}

interface UserDashboard {
  user: User;
  posts: Post[];
  comments: Comment[];
  stats: {
    postsCount: number;
    commentsCount: number;
  };
}

async function fetchUserDashboard(userId: number): Promise<UserDashboard> {
  try {
    // ステップ1: ユーザー情報を取得（他のリクエストに必要）
    const user = await robustFetch<User>(`https://jsonplaceholder.typicode.com/users/${userId}`);
    
    // ステップ2: 投稿一覧を取得（コメント取得に必要）
    const posts = await robustFetch<Post[]>(`https://jsonplaceholder.typicode.com/users/${userId}/posts`);
    
    // ステップ3: 各投稿のコメントを並列取得
    const commentPromises = posts.map(post =>
      robustFetch<Comment[]>(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
        .catch(error => {
          console.warn(`Failed to fetch comments for post ${post.id}:`, error);
          return []; // 個別の失敗は許容し、空配列を返す
        })
    );
    
    const commentsArrays = await Promise.all(commentPromises);
    const allComments = commentsArrays.flat();
    
    // ステップ4: 統計情報を計算
    const stats = {
      postsCount: posts.length,
      commentsCount: allComments.length
    };
    
    return {
      user,
      posts,
      comments: allComments,
      stats
    };
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    throw new Error(`Failed to load dashboard for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// 演習 4 解答: 非同期イテレーターの実装
// ============================================================================

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

async function* fetchAllItems<T>(
  baseUrl: string,
  options: {
    perPage?: number;
    rateLimitDelay?: number;
    maxRetries?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): AsyncGenerator<T, void, unknown> {
  const {
    perPage = 20,
    rateLimitDelay = 100,
    maxRetries = 3,
    onProgress
  } = options;
  
  let currentPage = 1;
  let totalPages = 1;
  let totalItems = 0;
  let processedItems = 0;
  
  while (currentPage <= totalPages) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // ページデータを取得
        const url = `${baseUrl}?page=${currentPage}&perPage=${perPage}`;
        const response = await robustFetch<PaginatedResponse<T>>(url);
        
        // 最初のページで全体の情報を設定
        if (currentPage === 1) {
          totalPages = response.totalPages;
          totalItems = response.total;
        }
        
        // 各アイテムをyield
        for (const item of response.data) {
          yield item;
          processedItems++;
          
          // プログレスレポート
          if (onProgress) {
            onProgress(processedItems, totalItems);
          }
        }
        
        break; // 成功したらリトライループを抜ける
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          throw new Error(`Failed to fetch page ${currentPage} after ${maxRetries} retries: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // 指数バックオフでリトライ
        const delay = rateLimitDelay * Math.pow(2, retries - 1);
        console.warn(`Retry ${retries}/${maxRetries} for page ${currentPage} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    currentPage++;
    
    // レート制限を考慮した遅延
    if (currentPage <= totalPages && rateLimitDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
    }
  }
}

// ============================================================================
// 演習 5 解答: 高度なパターン - バッチ処理とキューイング
// ============================================================================

interface Task<T> {
  id: string;
  data: T;
}

interface TaskResult<R> {
  taskId: string;
  success: boolean;
  result?: R;
  error?: string;
  retries: number;
}

interface BatchProcessorOptions {
  concurrency: number;
  maxRetries: number;
  retryDelay: number;
  onProgress?: (completed: number, total: number, failed: number) => void;
  onTaskComplete?: (result: TaskResult<any>) => void;
}

class BatchProcessor<T, R> {
  private options: BatchProcessorOptions;
  
  constructor(options: BatchProcessorOptions) {
    this.options = options;
  }
  
  async processBatch(
    tasks: Task<T>[],
    processor: (data: T) => Promise<R>
  ): Promise<TaskResult<R>[]> {
    const results: TaskResult<R>[] = [];
    const retryQueue: Array<Task<T> & { retries: number }> = [];
    let completed = 0;
    let failed = 0;
    
    // 初期タスクキューの準備
    const taskQueue = tasks.map(task => ({ ...task, retries: 0 }));
    
    // 並列処理の実行
    while (taskQueue.length > 0 || retryQueue.length > 0) {
      // 処理するタスクを選択（通常キュー優先、リトライキューは後で）
      const currentBatch = [
        ...taskQueue.splice(0, this.options.concurrency),
        ...retryQueue.splice(0, this.options.concurrency - taskQueue.length)
      ];
      
      if (currentBatch.length === 0) break;
      
      // バッチを並列実行
      const batchPromises = currentBatch.map(async (task) => {
        try {
          const result = await processor(task.data);
          const taskResult: TaskResult<R> = {
            taskId: task.id,
            success: true,
            result,
            retries: task.retries
          };
          
          completed++;
          this.options.onTaskComplete?.(taskResult);
          this.options.onProgress?.(completed, tasks.length, failed);
          
          return taskResult;
        } catch (error) {
          const taskResult: TaskResult<R> = {
            taskId: task.id,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            retries: task.retries
          };
          
          // リトライロジック
          if (task.retries < this.options.maxRetries) {
            // リトライキューに追加
            retryQueue.push({ ...task, retries: task.retries + 1 });
            
            // リトライ遅延
            setTimeout(() => {}, this.options.retryDelay * (task.retries + 1));
          } else {
            // 最大リトライ回数に達した場合は失敗として記録
            failed++;
            completed++;
            this.options.onTaskComplete?.(taskResult);
            this.options.onProgress?.(completed, tasks.length, failed);
            return taskResult;
          }
          
          return taskResult;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result.success || result.retries >= this.options.maxRetries));
    }
    
    return results;
  }
}

// ============================================================================
// 演習 6 解答: リアルタイム処理のシミュレーション
// ============================================================================

interface StreamData {
  timestamp: number;
  value: number;
  type: 'metric' | 'event' | 'alert';
}

interface StreamStats {
  totalMessages: number;
  messagesPerSecond: number;
  errors: number;
  uptime: number;
}

class RealTimeStreamProcessor {
  private isRunning: boolean = false;
  private stats: StreamStats = {
    totalMessages: 0,
    messagesPerSecond: 0,
    errors: 0,
    uptime: 0
  };
  private startTime: number = 0;
  private messageCountWindow: number[] = [];
  private readonly windowSize = 10; // 10秒間の移動平均
  
  constructor(
    private dataSource: () => Promise<StreamData>,
    private processor: (data: StreamData) => Promise<void>
  ) {}
  
  async start(): Promise<void> {
    this.isRunning = true;
    this.startTime = Date.now();
    
    // 統計更新の定期実行
    const statsInterval = setInterval(() => {
      this.updateStats();
    }, 1000);
    
    // メイン処理ループ
    try {
      while (this.isRunning) {
        try {
          // データ取得
          const data = await this.dataSource();
          
          // データ処理
          await this.processor(data);
          
          // 統計更新
          this.stats.totalMessages++;
          this.messageCountWindow.push(Date.now());
          
          // ウィンドウサイズを維持
          const cutoff = Date.now() - (this.windowSize * 1000);
          this.messageCountWindow = this.messageCountWindow.filter(timestamp => timestamp > cutoff);
          
        } catch (error) {
          this.stats.errors++;
          console.error('Stream processing error:', error);
          
          // エラー時は少し待ってから再試行
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // バックプレッシャー制御（適度な間隔を置く）
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } finally {
      clearInterval(statsInterval);
    }
  }
  
  stop(): void {
    this.isRunning = false;
  }
  
  private updateStats(): void {
    const now = Date.now();
    this.stats.uptime = Math.floor((now - this.startTime) / 1000);
    
    // メッセージ/秒の計算（移動平均）
    const cutoff = now - (this.windowSize * 1000);
    const recentMessages = this.messageCountWindow.filter(timestamp => timestamp > cutoff);
    this.stats.messagesPerSecond = recentMessages.length / this.windowSize;
  }
  
  getStats(): StreamStats {
    return { ...this.stats };
  }
}

// ============================================================================
// テスト用のモック実装例
// ============================================================================

// モックデータソース
export const createMockDataSource = (): (() => Promise<StreamData>) => {
  return async () => {
    // ランダムな遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    // ときどきエラーを発生させる
    if (Math.random() < 0.05) {
      throw new Error('Mock data source error');
    }
    
    return {
      timestamp: Date.now(),
      value: Math.random() * 100,
      type: ['metric', 'event', 'alert'][Math.floor(Math.random() * 3)] as 'metric' | 'event' | 'alert'
    };
  };
};

// モックプロセッサー
export const createMockProcessor = (): ((data: StreamData) => Promise<void>) => {
  return async (data) => {
    // 処理時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    // アラートタイプの場合は特別な処理
    if (data.type === 'alert') {
      console.log(`ALERT: ${data.value} at ${new Date(data.timestamp).toISOString()}`);
    }
  };
};

// エクスポート
export {
  getUserDataWithAsyncAwait,
  NetworkError,
  HTTPError,
  ParseError,
  robustFetch,
  fetchUserDashboard,
  fetchAllItems,
  BatchProcessor,
  RealTimeStreamProcessor
};

// 使用例のデモンストレーション
export async function demonstrateSolutions(): Promise<void> {
  console.log('=== Lesson 43 Solutions Demonstration ===');
  
  try {
    // 1. エラーハンドリングのデモ
    console.log('\n1. Error handling:');
    try {
      await robustFetch('https://httpstat.us/404');
    } catch (error) {
      if (error instanceof HTTPError) {
        console.log(`Caught HTTP error: ${error.status}`);
      }
    }
    
    // 2. バッチ処理のデモ
    console.log('\n2. Batch processing:');
    const processor = new BatchProcessor<number, string>({
      concurrency: 3,
      maxRetries: 2,
      retryDelay: 100,
      onProgress: (completed, total, failed) => {
        console.log(`Progress: ${completed}/${total} (${failed} failed)`);
      }
    });
    
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i}`,
      data: i
    }));
    
    const results = await processor.processBatch(tasks, async (data) => {
      if (data === 5) throw new Error('Simulated failure');
      return `Processed: ${data}`;
    });
    
    console.log(`Batch completed: ${results.length} results`);
    
    // 3. ストリームプロセッサーのデモ
    console.log('\n3. Stream processor:');
    const streamProcessor = new RealTimeStreamProcessor(
      createMockDataSource(),
      createMockProcessor()
    );
    
    // 3秒間実行
    const streamPromise = streamProcessor.start();
    setTimeout(() => {
      streamProcessor.stop();
    }, 3000);
    
    await streamPromise;
    console.log('Stream stats:', streamProcessor.getStats());
    
    console.log('\nSolutions demonstration completed!');
  } catch (error) {
    console.error('Demo error:', error);
  }
}