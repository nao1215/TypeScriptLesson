/**
 * Lesson 21: インターフェース演習問題
 * 
 * 各問題を解いて、インターフェースの理解を深めましょう。
 * TODO コメントを削除して、実装を完成させてください。
 */

// 演習1: ECサイトの商品とカート機能のインターフェース設計
console.log("=== 演習1: ECサイトインターフェース ===");

// TODO: 以下のインターフェースを定義してください

// 商品の基本情報
interface IProduct {
    // TODO: 商品ID（読み取り専用）
    // TODO: 商品名
    // TODO: 価格
    // TODO: カテゴリー
    // TODO: 在庫数
    // TODO: 商品画像URL（オプショナル）
    // TODO: 商品説明（オプショナル）
}

// カートアイテム
interface ICartItem {
    // TODO: 商品情報
    // TODO: 数量
    // TODO: カートに追加した日時
}

// カート機能
interface IShoppingCart {
    // TODO: カートアイテムの配列
    // TODO: カートの合計金額を計算するメソッド
    // TODO: 商品を追加するメソッド
    // TODO: 商品を削除するメソッド
    // TODO: 数量を更新するメソッド
    // TODO: カートを空にするメソッド
}

// TODO: 上記のインターフェースを実装したクラスを作成
class ShoppingCart implements IShoppingCart {
    // TODO: 実装
}

// TODO: テスト用のサンプルデータを作成して動作確認


// 演習2: 図書館管理システムのインターフェース（継承を使用）
console.log("\n=== 演習2: 図書館管理システム ===");

// 基本的な図書館アイテム
interface ILibraryItem {
    // TODO: 一意のID
    // TODO: タイトル
    // TODO: 出版年
    // TODO: 利用可能かどうか
    // TODO: 貸出メソッド
    // TODO: 返却メソッド
}

// 本のインターフェース（ILibraryItemを継承）
interface IBook extends ILibraryItem {
    // TODO: 著者
    // TODO: ISBN
    // TODO: ページ数
    // TODO: ジャンル
}

// 雑誌のインターフェース（ILibraryItemを継承）
interface IMagazine extends ILibraryItem {
    // TODO: 発行者
    // TODO: 号数
    // TODO: 月刊/週刊などの頻度
}

// DVD/Blu-rayのインターフェース（ILibraryItemを継承）
interface IMedia extends ILibraryItem {
    // TODO: 監督または制作者
    // TODO: 時間（分）
    // TODO: メディアタイプ（DVD/Blu-ray）
    // TODO: ジャンル
}

// TODO: 各インターフェースを実装したクラスを作成
// TODO: テスト用のサンプルデータを作成して動作確認


// 演習3: APIレスポンス用のジェネリックインターフェース
console.log("\n=== 演習3: APIレスポンスインターフェース ===");

// 基本的なAPIレスポンス構造
interface IApiResponse<T> {
    // TODO: 成功/失敗フラグ
    // TODO: HTTPステータスコード
    // TODO: メッセージ
    // TODO: データ（ジェネリック型T、オプショナル）
    // TODO: エラー詳細（オプショナル）
    // TODO: タイムスタンプ
}

// ページネーション情報
interface IPagination {
    // TODO: 現在のページ
    // TODO: 1ページあたりのアイテム数
    // TODO: 総アイテム数
    // TODO: 総ページ数
    // TODO: 次のページが存在するか
    // TODO: 前のページが存在するか
}

// ページネーション付きのAPIレスポンス
interface IPaginatedApiResponse<T> extends IApiResponse<T[]> {
    // TODO: ページネーション情報
}

// ユーザー情報の型定義
interface IUser {
    // TODO: ユーザーID
    // TODO: ユーザー名
    // TODO: メールアドレス
    // TODO: 作成日時
    // TODO: 最終ログイン日時（オプショナル）
}

// TODO: 以下の関数を実装してください
// ユーザー一覧を取得するAPI（ページネーション付き）のシミュレーション
function fetchUsers(page: number, limit: number): Promise<IPaginatedApiResponse<IUser>> {
    // TODO: モックデータを使用してPromiseを返す実装
    return Promise.resolve({} as IPaginatedApiResponse<IUser>);
}

// 単一ユーザーを取得するAPIのシミュレーション
function fetchUser(userId: number): Promise<IApiResponse<IUser>> {
    // TODO: モックデータを使用してPromiseを返す実装
    return Promise.resolve({} as IApiResponse<IUser>);
}

// TODO: 上記の関数をテストする非同期関数を作成


// 演習4: イベント処理システムのコールシグネチャ
console.log("\n=== 演習4: イベント処理システム ===");

// イベントリスナーの型定義
interface IEventListener<T = any> {
    // TODO: イベントを受け取る関数のシグネチャ
    (event: T): void;
}

// イベントの基本構造
interface IEvent {
    // TODO: イベントタイプ
    // TODO: タイムスタンプ
    // TODO: イベント発生源（オプショナル）
}

// カスタムイベントの例
interface IUserEvent extends IEvent {
    type: 'user_login' | 'user_logout' | 'user_register';
    // TODO: ユーザー情報
}

interface ISystemEvent extends IEvent {
    type: 'system_start' | 'system_stop' | 'system_error';
    // TODO: システム情報やエラーメッセージ
}

// イベントエミッター
interface IEventEmitter {
    // TODO: イベントリスナーを追加するメソッド
    // TODO: イベントリスナーを削除するメソッド
    // TODO: イベントを発火するメソッド
    // TODO: すべてのリスナーを削除するメソッド
    // TODO: 特定タイプのリスナー数を取得するメソッド
}

// TODO: IEventEmitterを実装したクラスを作成
class EventEmitter implements IEventEmitter {
    // TODO: 実装
}

// TODO: 以下のテストケースが動作するように実装を完成させてください
/*
const emitter = new EventEmitter();

// ユーザーログインイベントのリスナーを追加
const loginListener: IEventListener<IUserEvent> = (event) => {
    console.log(`User ${event.user.name} logged in at ${event.timestamp}`);
};

emitter.on('user_login', loginListener);

// システムエラーイベントのリスナーを追加
const errorListener: IEventListener<ISystemEvent> = (event) => {
    console.log(`System error: ${event.message} at ${event.timestamp}`);
};

emitter.on('system_error', errorListener);

// イベントを発火
emitter.emit('user_login', {
    type: 'user_login',
    timestamp: new Date(),
    user: { id: 1, name: 'Alice', email: 'alice@example.com' }
});

emitter.emit('system_error', {
    type: 'system_error',
    timestamp: new Date(),
    message: 'Database connection failed'
});
*/

// 演習5: 設定システムのインターフェース設計
console.log("\n=== 演習5: 設定システム ===");

// アプリケーション設定の基本構造
interface IBaseConfig {
    // TODO: 設定の読み取り専用ID
    // TODO: 設定名
    // TODO: 説明（オプショナル）
    // TODO: デフォルト値
    // TODO: 現在の値
    // TODO: 作成日時
    // TODO: 更新日時
}

// 数値設定
interface INumericConfig extends IBaseConfig {
    defaultValue: number;
    currentValue: number;
    // TODO: 最小値（オプショナル）
    // TODO: 最大値（オプショナル）
    // TODO: ステップ（オプショナル）
}

// 文字列設定
interface IStringConfig extends IBaseConfig {
    defaultValue: string;
    currentValue: string;
    // TODO: 最大長（オプショナル）
    // TODO: パターン（正規表現、オプショナル）
}

// 真偽値設定
interface IBooleanConfig extends IBaseConfig {
    defaultValue: boolean;
    currentValue: boolean;
}

// 選択肢設定
interface ISelectConfig extends IBaseConfig {
    defaultValue: string;
    currentValue: string;
    // TODO: 選択可能なオプション
}

// 設定管理システム
interface IConfigManager {
    // TODO: 設定を取得するメソッド（ジェネリック）
    // TODO: 設定を更新するメソッド（ジェネリック）
    // TODO: 設定をリセットするメソッド
    // TODO: すべての設定を取得するメソッド
    // TODO: 設定をインポートするメソッド
    // TODO: 設定をエクスポートするメソッド
}

// TODO: IConfigManagerを実装したクラスを作成
// TODO: 各種設定タイプのサンプルデータを作成して動作確認

console.log("\n=== 演習問題完了 ===");
console.log("solution.ts で解答例を確認してください。");