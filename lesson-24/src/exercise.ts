// Lesson 24 演習問題: アクセス修飾子 (Access Modifiers)

// 演習1: ライブラリ管理システム
// Book クラスと Library クラスを実装してください

class Book {
    // TODO: 以下の要件を満たすプロパティを定義してください
    // - id: 読み取り専用のpublic
    // - title: 読み取り専用のpublic  
    // - author: 読み取り専用のpublic
    // - isbn: private
    // - isAvailable: private（デフォルト true）
    // - borrowedDate: private（デフォルト null）
    
    private static nextId = 1;
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: プロパティを初期化
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // public borrowBook(): boolean
    // - 本が利用可能な場合、借用状態にして現在日時を記録
    // - 成功時はtrue、失敗時はfalseを返す
    
    // public returnBook(): boolean  
    // - 本が借用中の場合、利用可能状態に戻す
    // - 成功時はtrue、失敗時はfalseを返す
    
    // public getBookInfo(): object
    // - 本の基本情報を返す（isbn は含まない）
    
    // protected getBorrowDuration(): number | null
    // - 借用期間（日数）を返す。借用中でない場合はnull
    
    // private calculateLateFee(): number
    // - 延滞料金を計算（30日以上で1日10円）
}

class Library {
    // TODO: 以下のプロパティを定義
    // - name: 読み取り専用のpublic
    // - books: private（Book配列）
    // - maxBooks: private読み取り専用
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: プロパティを初期化
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // public addBook(book: Book): boolean
    // - 本を追加（最大冊数チェック）
    
    // public removeBook(bookId: number): boolean
    // - 本を削除（借用中の本は削除不可）
    
    // public findBook(bookId: number): Book | undefined
    // - IDで本を検索
    
    // public getAvailableBooks(): Book[]
    // - 利用可能な本の一覧
    
    // public getLibraryStats(): object
    // - 図書館の統計情報
}

// 演習2: 銀行口座システム
// Account クラスと SavingsAccount クラスを実装してください

abstract class Account {
    // TODO: 以下のプロパティを定義
    // - accountNumber: 読み取り専用のpublic
    // - balance: protected
    // - accountType: protected読み取り専用
    // - transactions: private（取引履歴）
    
    private static nextAccountNumber = 1000;
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: プロパティを初期化
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // abstract calculateInterest(): number
    // - 利息計算（継承クラスで実装）
    
    // public deposit(amount: number): boolean
    // - 入金処理
    
    // public getBalance(): number
    // - 残高取得
    
    // protected addTransaction(type: string, amount: number): void
    // - 取引履歴の追加
    
    // private validateAmount(amount: number): boolean
    // - 金額の妥当性チェック
}

class SavingsAccount extends Account {
    // TODO: 以下のプロパティを定義
    // - interestRate: private読み取り専用
    // - minimumBalance: private読み取り専用
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: 親クラスのコンストラクタ呼び出しと初期化
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // calculateInterest(): number
    // - 年利に基づく利息計算
    
    // public withdraw(amount: number): boolean
    // - 出金処理（最小残高チェック含む）
    
    // public getAccountInfo(): object
    // - 口座情報の取得
}

// 演習3: ゲームキャラクターシステム
// Character クラスと Player クラスを実装してください

class Character {
    // TODO: 以下のプロパティを定義（Parameter Properties使用）
    // - name: 読み取り専用のpublic
    // - level: protected（デフォルト 1）
    // - health: protected
    // - maxHealth: protected
    // - experience: private（デフォルト 0）
    
    #inventory: string[] = []; // Private Field
    
    constructor(/* TODO: Parameter Propertiesで定義 */) {
        // TODO: maxHealthをhealthと同じ値に設定
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // public takeDamage(damage: number): boolean
    // - ダメージを受ける、HP0以下でfalse返す
    
    // protected heal(amount: number): void
    // - 回復処理（maxHealthまで）
    
    // protected gainExperience(exp: number): boolean
    // - 経験値取得、レベルアップ判定
    
    // public addItem(item: string): void
    // - アイテム追加
    
    // public getInventory(): string[]
    // - インベントリのコピーを返す
    
    // public getCharacterInfo(): object
    // - キャラクター情報を返す
}

class Player extends Character {
    // TODO: 以下のプロパティを定義
    // - playerId: 読み取り専用のpublic
    // - playerClass: private
    
    private static playerCount = 0;
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: 実装
        Player.playerCount++;
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // public levelUp(): boolean
    // - 強制レベルアップ
    
    // public usePotion(): boolean
    // - ポーションを使用してHP回復
    
    // public getPlayerStats(): object
    // - プレイヤー統計情報
    
    // public static getPlayerCount(): number
    // - 総プレイヤー数
}

// 演習4: データベース接続プールシステム
// DatabaseConnection クラスと ConnectionPool クラスを実装してください

class DatabaseConnection {
    // TODO: 以下のプロパティを定義
    // - id: 読み取り専用のpublic
    // - isActive: private
    // - lastUsed: private
    // - connectionString: private読み取り専用
    
    #isConnected = false; // Private Field
    
    private static connectionCount = 0;
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: 実装
        DatabaseConnection.connectionCount++;
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // public connect(): boolean
    // - 接続開始
    
    // public disconnect(): void
    // - 接続終了
    
    // public executeQuery(query: string): string
    // - クエリ実行（接続状態チェック）
    
    // protected updateLastUsed(): void
    // - 最終使用時刻更新
    
    // public getConnectionInfo(): object
    // - 接続情報を返す
    
    // public static getTotalConnections(): number
    // - 総接続数を返す
}

class ConnectionPool {
    // TODO: 以下のプロパティを定義
    // - poolSize: 読み取り専用のprivate
    // - connections: private
    // - availableConnections: private
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: 実装（指定サイズの接続プールを作成）
    }
    
    // TODO: 以下のメソッドを実装してください
    
    // public getConnection(): DatabaseConnection | null
    // - 利用可能な接続を取得
    
    // public releaseConnection(connection: DatabaseConnection): boolean
    // - 接続をプールに戻す
    
    // public getPoolStats(): object
    // - プール統計情報
    
    // private createConnection(): DatabaseConnection
    // - 新しい接続を作成
}

// テスト関数（実装後にコメントアウトを外してください）

/*
function testLibrarySystem(): void {
    console.log("=== Library System Test ===");
    
    const library = new Library("Central Library", 5);
    const book1 = new Book("TypeScript Guide", "Author A", "123-456");
    const book2 = new Book("JavaScript Basics", "Author B", "789-012");
    
    library.addBook(book1);
    library.addBook(book2);
    
    console.log("Available books:", library.getAvailableBooks().length);
    console.log("Borrow book1:", book1.borrowBook());
    console.log("Available books after borrow:", library.getAvailableBooks().length);
    console.log("Book1 info:", book1.getBookInfo());
}

function testBankingSystem(): void {
    console.log("=== Banking System Test ===");
    
    const savings = new SavingsAccount(1000, 0.05, 100);
    
    console.log("Initial balance:", savings.getBalance());
    console.log("Deposit 500:", savings.deposit(500));
    console.log("Withdraw 200:", savings.withdraw(200));
    console.log("Interest:", savings.calculateInterest());
    console.log("Account info:", savings.getAccountInfo());
}

function testGameSystem(): void {
    console.log("=== Game System Test ===");
    
    const player = new Player("Hero", 100, 1, "Warrior");
    
    console.log("Player info:", player.getCharacterInfo());
    player.addItem("Sword");
    player.addItem("Potion");
    console.log("Inventory:", player.getInventory());
    console.log("Take damage:", player.takeDamage(30));
    console.log("Use potion:", player.usePotion());
}

function testDatabaseSystem(): void {
    console.log("=== Database System Test ===");
    
    const pool = new ConnectionPool(3, "localhost:5432");
    const conn = pool.getConnection();
    
    if (conn) {
        console.log("Got connection:", conn.getConnectionInfo());
        console.log("Execute query:", conn.executeQuery("SELECT * FROM users"));
        pool.releaseConnection(conn);
    }
    
    console.log("Pool stats:", pool.getPoolStats());
}

// テスト実行
testLibrarySystem();
testBankingSystem(); 
testGameSystem();
testDatabaseSystem();
*/

export {};