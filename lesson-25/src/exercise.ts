// Lesson 25 演習問題: 抽象クラス (Abstract Classes)

// 演習1: 図形計算システム
// Shape抽象クラスと具象クラスを実装してください

abstract class Shape {
    // TODO: 以下の要件を満たす実装をしてください
    
    // プロパティ:
    // - name: protected string (図形名)
    // - color: protected string (色)
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: プロパティの初期化
    }
    
    // 抽象メソッド（子クラスで実装が必要）:
    // - abstract calculateArea(): number
    // - abstract calculatePerimeter(): number
    // - abstract getShapeType(): string
    
    // 具象メソッド（共通実装）:
    // - getInfo(): object - 図形の基本情報を返す
    // - isLarger(other: Shape): boolean - 面積比較
    // - displayDetails(): void - 詳細情報を表示
    
    // protected scaleArea(scale: number): number
    // - 面積をスケールする（子クラスで使用）
}

class Triangle extends Shape {
    // TODO: 三角形クラスを実装
    // - base: private number (底辺)
    // - height: private number (高さ)
    // - side1, side2, side3: private number (三辺の長さ)
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装
    // calculateArea(): number - 面積計算 (0.5 * base * height)
    // calculatePerimeter(): number - 周囲長計算
    // getShapeType(): string - "Triangle"を返す
    
    // TODO: 独自メソッド
    // isValidTriangle(): boolean - 三角形の成立条件チェック
    // getAngles(): number[] - 角度計算（概算）
}

class Circle extends Shape {
    // TODO: 円クラスを実装
    // - radius: private number
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装
    // calculateArea(): number - 面積計算 (π * r²)
    // calculatePerimeter(): number - 周囲長計算 (2π * r)
    // getShapeType(): string - "Circle"を返す
    
    // TODO: 独自メソッド
    // getDiameter(): number - 直径取得
    // getCircumference(): number - 円周取得（calculatePerimeterのエイリアス）
}

class Rectangle extends Shape {
    // TODO: 長方形クラスを実装
    // - width: private number
    // - height: private number
    
    constructor(/* TODO: 必要な引数を定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装と独自メソッド
    // isSquare(): boolean - 正方形かどうか判定
    // getDiagonal(): number - 対角線の長さ
}

// 演習2: ファイル処理システム
// FileProcessor抽象クラスを実装してください

abstract class FileProcessor {
    // TODO: 以下の要件を満たす実装をしてください
    
    // プロパティ:
    // - fileName: protected string
    // - processed: protected boolean (初期値: false)
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // Template Methodパターンを実装:
    // public async processFile(): Promise<boolean>
    // 1. validateFile() を呼び出し
    // 2. readFile() を呼び出し
    // 3. transformContent() を呼び出し
    // 4. writeFile() を呼び出し
    // 5. cleanUp() を呼び出し
    
    // 抽象メソッド（子クラスで実装）:
    // - abstract validateFile(): boolean
    // - abstract readFile(): Promise<string>
    // - abstract transformContent(content: string): Promise<string>
    // - abstract writeFile(content: string): Promise<boolean>
    
    // 具象メソッド:
    // - protected cleanUp(): void - 共通のクリーンアップ処理
    // - public getStatus(): object - 処理状況を返す
}

class TextFileProcessor extends FileProcessor {
    // TODO: テキストファイル処理クラスを実装
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装
    // validateFile(): boolean - .txtファイルかチェック
    // readFile(): Promise<string> - ファイル内容読み込み（シミュレート）
    // transformContent(content: string): Promise<string> - 大文字変換
    // writeFile(content: string): Promise<boolean> - ファイル書き込み（シミュレート）
}

class ImageFileProcessor extends FileProcessor {
    // TODO: 画像ファイル処理クラスを実装
    // - quality: private number (画質設定)
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装
    // validateFile(): boolean - 画像ファイル拡張子チェック
    // readFile(): Promise<string> - 画像データ読み込み（シミュレート）
    // transformContent(content: string): Promise<string> - 画像変換処理
    // writeFile(content: string): Promise<boolean> - 変換済み画像保存
    
    // TODO: 独自メソッド
    // setQuality(quality: number): void - 画質設定
    // getImageInfo(): object - 画像情報取得
}

// 演習3: ゲームキャラクターシステム
// GameEntity抽象クラスを実装してください

abstract class GameEntity {
    // TODO: ゲームエンティティの基底クラス
    
    // プロパティ:
    // - id: readonly string
    // - position: protected {x: number, y: number}
    // - isActive: protected boolean
    
    // 抽象プロパティ:
    // - abstract entityType: string
    // - abstract maxHealth: number
    // - abstract currentHealth: number
    
    private static entityCount = 0;
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装（IDは自動生成）
    }
    
    // 抽象メソッド:
    // - abstract update(): void - エンティティの更新処理
    // - abstract render(): void - 描画処理
    // - abstract takeDamage(damage: number): boolean
    // - abstract getStats(): object
    
    // 具象メソッド:
    // - moveTo(x: number, y: number): void - 位置移動
    // - getPosition(): {x: number, y: number} - 位置取得
    // - isAlive(): boolean - 生存判定
    // - activate()/deactivate(): void - アクティブ状態制御
    
    // static getTotalEntities(): number - 総エンティティ数
}

interface Attackable {
    attack(target: GameEntity): number;
    attackPower: number;
}

interface Defendable {
    defend(): void;
    armor: number;
}

class Player extends GameEntity implements Attackable, Defendable {
    // TODO: プレイヤークラス実装
    // - name: private string
    // - level: private number
    // - experience: private number
    // - attackPower: number (interface実装)
    // - armor: number (interface実装)
    
    entityType = "Player";
    maxHealth: number;
    currentHealth: number;
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドとインターフェースメソッドの実装
    // update(): void - プレイヤー更新処理
    // render(): void - プレイヤー描画
    // takeDamage(damage: number): boolean - ダメージ処理
    // getStats(): object - プレイヤー統計
    // attack(target: GameEntity): number - 攻撃処理
    // defend(): void - 防御処理
    
    // TODO: 独自メソッド
    // gainExperience(exp: number): boolean - 経験値獲得（レベルアップ判定）
    // levelUp(): void - レベルアップ処理
}

class Enemy extends GameEntity implements Attackable {
    // TODO: 敵クラス実装
    // - enemyType: private string
    // - attackPower: number
    // - dropItems: private string[]
    
    entityType = "Enemy";
    maxHealth: number;
    currentHealth: number;
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドとインターフェースメソッドの実装
    // AI行動パターンの実装も含む
}

// 演習4: 通知システム
// NotificationSender抽象クラスを実装してください

abstract class NotificationSender {
    // TODO: 通知送信の抽象クラス
    
    // プロパティ:
    // - senderId: protected string
    // - isEnabled: protected boolean
    // - sentCount: private number
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // Template Methodパターン:
    // public async sendNotification(message: string, recipients: string[]): Promise<boolean>
    // 1. validateMessage() チェック
    // 2. validateRecipients() チェック
    // 3. formatMessage() でメッセージ整形
    // 4. deliverMessage() で送信
    // 5. logDelivery() でログ記録
    
    // 抽象メソッド:
    // - abstract validateMessage(message: string): boolean
    // - abstract validateRecipients(recipients: string[]): boolean  
    // - abstract formatMessage(message: string): string
    // - abstract deliverMessage(message: string, recipients: string[]): Promise<boolean>
    
    // 具象メソッド:
    // - protected logDelivery(success: boolean, recipients: string[]): void
    // - public getSenderInfo(): object
    // - public getSentCount(): number
}

class EmailSender extends NotificationSender {
    // TODO: メール送信クラス
    // - smtpServer: private string
    // - fromAddress: private string
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装
    // validateMessage(): メールとして有効かチェック
    // validateRecipients(): メールアドレス形式チェック
    // formatMessage(): HTMLメール形式に変換
    // deliverMessage(): SMTP経由送信（シミュレート）
}

class SMSSender extends NotificationSender {
    // TODO: SMS送信クラス
    // - phoneNumberRegex: private RegExp
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装
    // validateMessage(): SMS制限（文字数など）チェック
    // validateRecipients(): 電話番号形式チェック
    // formatMessage(): SMS用にフォーマット
    // deliverMessage(): SMS API経由送信（シミュレート）
}

class PushNotificationSender extends NotificationSender {
    // TODO: プッシュ通知送信クラス
    // - appId: private string
    // - apiKey: private string
    
    constructor(/* TODO: 引数定義 */) {
        // TODO: 実装
    }
    
    // TODO: 抽象メソッドの実装とプッシュ通知特有の機能
}

// テスト関数（実装後にコメントアウトを外してください）

/*
function testShapeSystem(): void {
    console.log("=== Shape System Test ===");
    
    const circle = new Circle("Red Circle", "red", 5);
    const triangle = new Triangle("Blue Triangle", "blue", 6, 8, 6, 8, 10);
    const rectangle = new Rectangle("Green Rectangle", "green", 4, 6);
    
    const shapes: Shape[] = [circle, triangle, rectangle];
    
    shapes.forEach(shape => {
        shape.displayDetails();
        console.log(`Is larger than circle: ${shape.isLarger(circle)}`);
        console.log();
    });
}

async function testFileSystem(): Promise<void> {
    console.log("=== File Processing System Test ===");
    
    const textProcessor = new TextFileProcessor("example.txt");
    const imageProcessor = new ImageFileProcessor("photo.jpg", 80);
    
    console.log("Processing text file:", await textProcessor.processFile());
    console.log("Text processor status:", textProcessor.getStatus());
    
    console.log("Processing image file:", await imageProcessor.processFile());
    console.log("Image processor status:", imageProcessor.getStatus());
}

function testGameSystem(): void {
    console.log("=== Game System Test ===");
    
    const player = new Player("Hero", 1, 100, 100, 15, 5);
    const enemy = new Enemy("Orc", "orc", 80, 80, 12, ["Gold", "Sword"]);
    
    console.log("Initial stats:");
    console.log("Player:", player.getStats());
    console.log("Enemy:", enemy.getStats());
    
    // Combat simulation
    const damage = player.attack(enemy);
    console.log(`Player attacks for ${damage} damage`);
    console.log("Enemy health after attack:", enemy.getStats());
    
    console.log("Total game entities:", GameEntity.getTotalEntities());
}

async function testNotificationSystem(): Promise<void> {
    console.log("=== Notification System Test ===");
    
    const emailSender = new EmailSender("MAIL001", "smtp.example.com", "noreply@example.com");
    const smsSender = new SMSSender("SMS001");
    const pushSender = new PushNotificationSender("PUSH001", "app123", "key456");
    
    const message = "Test notification message";
    const emailRecipients = ["user@example.com", "admin@example.com"];
    const phoneRecipients = ["+1234567890", "+0987654321"];
    
    console.log("Sending email:", await emailSender.sendNotification(message, emailRecipients));
    console.log("Sending SMS:", await smsSender.sendNotification(message, phoneRecipients));
    
    console.log("Email sender info:", emailSender.getSenderInfo());
    console.log("SMS sender info:", smsSender.getSenderInfo());
}

// テスト実行
testShapeSystem();
await testFileSystem();
testGameSystem();
await testNotificationSystem();
*/

export {};