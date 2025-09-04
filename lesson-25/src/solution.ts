// Lesson 25 解答例: 抽象クラス (Abstract Classes)

// 解答1: 図形計算システム
abstract class Shape {
    protected name: string;
    protected color: string;
    
    constructor(name: string, color: string) {
        this.name = name;
        this.color = color;
    }
    
    // 抽象メソッド
    abstract calculateArea(): number;
    abstract calculatePerimeter(): number;
    abstract getShapeType(): string;
    
    // 具象メソッド
    public getInfo(): object {
        return {
            name: this.name,
            color: this.color,
            type: this.getShapeType(),
            area: this.calculateArea(),
            perimeter: this.calculatePerimeter()
        };
    }
    
    public isLarger(other: Shape): boolean {
        return this.calculateArea() > other.calculateArea();
    }
    
    public displayDetails(): void {
        const info = this.getInfo();
        console.log(`${this.name} (${this.color} ${this.getShapeType()})`);
        console.log(`Area: ${(info.area as number).toFixed(2)}`);
        console.log(`Perimeter: ${(info.perimeter as number).toFixed(2)}`);
    }
    
    protected scaleArea(scale: number): number {
        return this.calculateArea() * scale * scale;
    }
}

class Triangle extends Shape {
    private base: number;
    private height: number;
    private side1: number;
    private side2: number;
    private side3: number;
    
    constructor(name: string, color: string, base: number, height: number, side1: number, side2: number, side3: number) {
        super(name, color);
        this.base = base;
        this.height = height;
        this.side1 = side1;
        this.side2 = side2;
        this.side3 = side3;
    }
    
    calculateArea(): number {
        return 0.5 * this.base * this.height;
    }
    
    calculatePerimeter(): number {
        return this.side1 + this.side2 + this.side3;
    }
    
    getShapeType(): string {
        return "Triangle";
    }
    
    public isValidTriangle(): boolean {
        return (this.side1 + this.side2 > this.side3) &&
               (this.side1 + this.side3 > this.side2) &&
               (this.side2 + this.side3 > this.side1);
    }
    
    public getAngles(): number[] {
        // コサインの法則を使用した概算
        const a = this.side1, b = this.side2, c = this.side3;
        const angleA = Math.acos((b*b + c*c - a*a) / (2*b*c)) * (180/Math.PI);
        const angleB = Math.acos((a*a + c*c - b*b) / (2*a*c)) * (180/Math.PI);
        const angleC = 180 - angleA - angleB;
        return [angleA, angleB, angleC];
    }
}

class Circle extends Shape {
    private radius: number;
    
    constructor(name: string, color: string, radius: number) {
        super(name, color);
        this.radius = radius;
    }
    
    calculateArea(): number {
        return Math.PI * this.radius * this.radius;
    }
    
    calculatePerimeter(): number {
        return 2 * Math.PI * this.radius;
    }
    
    getShapeType(): string {
        return "Circle";
    }
    
    public getDiameter(): number {
        return this.radius * 2;
    }
    
    public getCircumference(): number {
        return this.calculatePerimeter();
    }
}

class Rectangle extends Shape {
    private width: number;
    private height: number;
    
    constructor(name: string, color: string, width: number, height: number) {
        super(name, color);
        this.width = width;
        this.height = height;
    }
    
    calculateArea(): number {
        return this.width * this.height;
    }
    
    calculatePerimeter(): number {
        return 2 * (this.width + this.height);
    }
    
    getShapeType(): string {
        return "Rectangle";
    }
    
    public isSquare(): boolean {
        return this.width === this.height;
    }
    
    public getDiagonal(): number {
        return Math.sqrt(this.width * this.width + this.height * this.height);
    }
}

// 解答2: ファイル処理システム
abstract class FileProcessor {
    protected fileName: string;
    protected processed: boolean = false;
    
    constructor(fileName: string) {
        this.fileName = fileName;
    }
    
    // Template Method
    public async processFile(): Promise<boolean> {
        try {
            console.log(`Processing file: ${this.fileName}`);
            
            if (!this.validateFile()) {
                console.log("File validation failed");
                return false;
            }
            
            const content = await this.readFile();
            const transformedContent = await this.transformContent(content);
            const writeSuccess = await this.writeFile(transformedContent);
            
            if (writeSuccess) {
                this.processed = true;
                console.log(`File ${this.fileName} processed successfully`);
            }
            
            this.cleanUp();
            return writeSuccess;
            
        } catch (error) {
            console.error(`Error processing ${this.fileName}:`, error);
            return false;
        }
    }
    
    // 抽象メソッド
    abstract validateFile(): boolean;
    abstract readFile(): Promise<string>;
    abstract transformContent(content: string): Promise<string>;
    abstract writeFile(content: string): Promise<boolean>;
    
    // 具象メソッド
    protected cleanUp(): void {
        console.log(`Cleaning up resources for ${this.fileName}`);
    }
    
    public getStatus(): object {
        return {
            fileName: this.fileName,
            processed: this.processed,
            timestamp: new Date().toISOString()
        };
    }
}

class TextFileProcessor extends FileProcessor {
    validateFile(): boolean {
        return this.fileName.endsWith('.txt');
    }
    
    async readFile(): Promise<string> {
        // ファイル読み込みシミュレーション
        await new Promise(resolve => setTimeout(resolve, 100));
        return `Content of ${this.fileName}: Hello, this is a sample text file.`;
    }
    
    async transformContent(content: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return content.toUpperCase();
    }
    
    async writeFile(content: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`Writing transformed content to ${this.fileName.replace('.txt', '_processed.txt')}`);
        console.log(`Content preview: ${content.substring(0, 50)}...`);
        return true;
    }
}

class ImageFileProcessor extends FileProcessor {
    private quality: number;
    
    constructor(fileName: string, quality: number = 100) {
        super(fileName);
        this.quality = quality;
    }
    
    validateFile(): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        return imageExtensions.some(ext => this.fileName.toLowerCase().endsWith(ext));
    }
    
    async readFile(): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return `Binary data of ${this.fileName} (${Math.random() * 1000 + 100} KB)`;
    }
    
    async transformContent(content: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return `${content} - Processed with quality: ${this.quality}%`;
    }
    
    async writeFile(content: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 250));
        console.log(`Writing processed image to ${this.fileName.replace(/\.[^.]+$/, '_processed.jpg')}`);
        return true;
    }
    
    public setQuality(quality: number): void {
        this.quality = Math.max(1, Math.min(100, quality));
    }
    
    public getImageInfo(): object {
        return {
            fileName: this.fileName,
            quality: this.quality,
            estimatedSize: `${Math.random() * 500 + 200} KB`
        };
    }
}

// 解答3: ゲームキャラクターシステム
abstract class GameEntity {
    public readonly id: string;
    protected position: {x: number, y: number};
    protected isActive: boolean;
    
    abstract entityType: string;
    abstract maxHealth: number;
    abstract currentHealth: number;
    
    private static entityCount = 0;
    
    constructor(x: number = 0, y: number = 0) {
        this.id = `ENTITY_${++GameEntity.entityCount}`;
        this.position = {x, y};
        this.isActive = true;
    }
    
    // 抽象メソッド
    abstract update(): void;
    abstract render(): void;
    abstract takeDamage(damage: number): boolean;
    abstract getStats(): object;
    
    // 具象メソッド
    public moveTo(x: number, y: number): void {
        this.position = {x, y};
        console.log(`${this.entityType} ${this.id} moved to (${x}, ${y})`);
    }
    
    public getPosition(): {x: number, y: number} {
        return {...this.position};
    }
    
    public isAlive(): boolean {
        return this.currentHealth > 0;
    }
    
    public activate(): void {
        this.isActive = true;
    }
    
    public deactivate(): void {
        this.isActive = false;
    }
    
    public static getTotalEntities(): number {
        return GameEntity.entityCount;
    }
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
    entityType = "Player";
    maxHealth: number;
    currentHealth: number;
    attackPower: number;
    armor: number;
    
    private name: string;
    private level: number;
    private experience: number;
    
    constructor(name: string, level: number, maxHealth: number, currentHealth: number, attackPower: number, armor: number) {
        super();
        this.name = name;
        this.level = level;
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.attackPower = attackPower;
        this.armor = armor;
        this.experience = 0;
    }
    
    update(): void {
        if (this.isActive && this.isAlive()) {
            // プレイヤー更新ロジック
            console.log(`${this.name} is active at level ${this.level}`);
        }
    }
    
    render(): void {
        console.log(`Rendering ${this.name} at (${this.position.x}, ${this.position.y})`);
    }
    
    takeDamage(damage: number): boolean {
        const actualDamage = Math.max(1, damage - this.armor);
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        console.log(`${this.name} took ${actualDamage} damage. Health: ${this.currentHealth}/${this.maxHealth}`);
        return this.isAlive();
    }
    
    getStats(): object {
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            health: `${this.currentHealth}/${this.maxHealth}`,
            attackPower: this.attackPower,
            armor: this.armor,
            experience: this.experience,
            position: this.position
        };
    }
    
    attack(target: GameEntity): number {
        const damage = this.attackPower + Math.floor(Math.random() * 5);
        console.log(`${this.name} attacks ${target.entityType} for ${damage} damage`);
        target.takeDamage(damage);
        return damage;
    }
    
    defend(): void {
        const tempArmor = Math.floor(this.armor * 1.5);
        console.log(`${this.name} defends, temporarily increasing armor to ${tempArmor}`);
        // 防御状態の実装
    }
    
    public gainExperience(exp: number): boolean {
        this.experience += exp;
        const expForNextLevel = this.level * 100;
        
        if (this.experience >= expForNextLevel) {
            this.levelUp();
            return true;
        }
        return false;
    }
    
    public levelUp(): void {
        this.level++;
        this.experience = 0;
        this.maxHealth += 20;
        this.currentHealth = this.maxHealth;
        this.attackPower += 3;
        this.armor += 1;
        console.log(`${this.name} leveled up to ${this.level}!`);
    }
}

class Enemy extends GameEntity implements Attackable {
    entityType = "Enemy";
    maxHealth: number;
    currentHealth: number;
    attackPower: number;
    
    private enemyType: string;
    private dropItems: string[];
    
    constructor(name: string, enemyType: string, maxHealth: number, currentHealth: number, attackPower: number, dropItems: string[]) {
        super();
        this.enemyType = enemyType;
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.attackPower = attackPower;
        this.dropItems = dropItems;
    }
    
    update(): void {
        if (this.isActive && this.isAlive()) {
            // 簡単なAI行動
            console.log(`${this.enemyType} ${this.id} is patrolling...`);
        }
    }
    
    render(): void {
        console.log(`Rendering ${this.enemyType} at (${this.position.x}, ${this.position.y})`);
    }
    
    takeDamage(damage: number): boolean {
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        console.log(`${this.enemyType} took ${damage} damage. Health: ${this.currentHealth}/${this.maxHealth}`);
        
        if (!this.isAlive()) {
            console.log(`${this.enemyType} defeated! Drops: ${this.dropItems.join(', ')}`);
        }
        
        return this.isAlive();
    }
    
    getStats(): object {
        return {
            id: this.id,
            enemyType: this.enemyType,
            health: `${this.currentHealth}/${this.maxHealth}`,
            attackPower: this.attackPower,
            dropItems: this.dropItems,
            position: this.position
        };
    }
    
    attack(target: GameEntity): number {
        const damage = this.attackPower + Math.floor(Math.random() * 3);
        console.log(`${this.enemyType} attacks for ${damage} damage`);
        target.takeDamage(damage);
        return damage;
    }
}

// 解答4: 通知システム
abstract class NotificationSender {
    protected senderId: string;
    protected isEnabled: boolean;
    private sentCount: number = 0;
    
    constructor(senderId: string, isEnabled: boolean = true) {
        this.senderId = senderId;
        this.isEnabled = isEnabled;
    }
    
    // Template Method
    public async sendNotification(message: string, recipients: string[]): Promise<boolean> {
        if (!this.isEnabled) {
            console.log(`Sender ${this.senderId} is disabled`);
            return false;
        }
        
        try {
            if (!this.validateMessage(message)) {
                console.log("Message validation failed");
                return false;
            }
            
            if (!this.validateRecipients(recipients)) {
                console.log("Recipients validation failed");
                return false;
            }
            
            const formattedMessage = this.formatMessage(message);
            const success = await this.deliverMessage(formattedMessage, recipients);
            
            this.logDelivery(success, recipients);
            
            if (success) {
                this.sentCount++;
            }
            
            return success;
            
        } catch (error) {
            console.error("Error sending notification:", error);
            return false;
        }
    }
    
    // 抽象メソッド
    abstract validateMessage(message: string): boolean;
    abstract validateRecipients(recipients: string[]): boolean;
    abstract formatMessage(message: string): string;
    abstract deliverMessage(message: string, recipients: string[]): Promise<boolean>;
    
    // 具象メソッド
    protected logDelivery(success: boolean, recipients: string[]): void {
        const status = success ? "SUCCESS" : "FAILED";
        console.log(`[${this.senderId}] Delivery ${status} to ${recipients.length} recipients`);
    }
    
    public getSenderInfo(): object {
        return {
            senderId: this.senderId,
            isEnabled: this.isEnabled,
            sentCount: this.sentCount
        };
    }
    
    public getSentCount(): number {
        return this.sentCount;
    }
}

class EmailSender extends NotificationSender {
    private smtpServer: string;
    private fromAddress: string;
    
    constructor(senderId: string, smtpServer: string, fromAddress: string) {
        super(senderId);
        this.smtpServer = smtpServer;
        this.fromAddress = fromAddress;
    }
    
    validateMessage(message: string): boolean {
        return message.length > 0 && message.length <= 10000;
    }
    
    validateRecipients(recipients: string[]): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return recipients.every(email => emailRegex.test(email));
    }
    
    formatMessage(message: string): string {
        return `
            <html>
                <body>
                    <h2>Notification</h2>
                    <p>${message}</p>
                    <hr>
                    <small>Sent from ${this.fromAddress}</small>
                </body>
            </html>
        `;
    }
    
    async deliverMessage(message: string, recipients: string[]): Promise<boolean> {
        console.log(`Connecting to SMTP server: ${this.smtpServer}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        for (const recipient of recipients) {
            console.log(`Sending email to ${recipient}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return true;
    }
}

class SMSSender extends NotificationSender {
    private phoneNumberRegex: RegExp = /^\+?[\d\s\-\(\)]+$/;
    
    constructor(senderId: string) {
        super(senderId);
    }
    
    validateMessage(message: string): boolean {
        return message.length > 0 && message.length <= 160;
    }
    
    validateRecipients(recipients: string[]): boolean {
        return recipients.every(phone => this.phoneNumberRegex.test(phone));
    }
    
    formatMessage(message: string): string {
        if (message.length > 160) {
            return message.substring(0, 157) + "...";
        }
        return message;
    }
    
    async deliverMessage(message: string, recipients: string[]): Promise<boolean> {
        console.log("Connecting to SMS API...");
        await new Promise(resolve => setTimeout(resolve, 150));
        
        for (const phone of recipients) {
            console.log(`Sending SMS to ${phone}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return true;
    }
}

class PushNotificationSender extends NotificationSender {
    private appId: string;
    private apiKey: string;
    
    constructor(senderId: string, appId: string, apiKey: string) {
        super(senderId);
        this.appId = appId;
        this.apiKey = apiKey;
    }
    
    validateMessage(message: string): boolean {
        return message.length > 0 && message.length <= 500;
    }
    
    validateRecipients(recipients: string[]): boolean {
        // デバイストークンの簡単な検証
        return recipients.every(token => token.length >= 10);
    }
    
    formatMessage(message: string): string {
        return JSON.stringify({
            title: "Notification",
            body: message,
            appId: this.appId,
            timestamp: new Date().toISOString()
        });
    }
    
    async deliverMessage(message: string, recipients: string[]): Promise<boolean> {
        console.log(`Connecting to Push Notification service for app ${this.appId}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`Sending push notification to ${recipients.length} devices`);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return true;
    }
}

// テスト関数
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
    
    console.log("Triangle validation:", triangle.isValidTriangle());
    console.log("Triangle angles:", triangle.getAngles().map(a => `${a.toFixed(1)}°`));
    console.log("Rectangle is square:", rectangle.isSquare());
    console.log("Circle diameter:", circle.getDiameter());
}

async function testFileSystem(): Promise<void> {
    console.log("=== File Processing System Test ===");
    
    const textProcessor = new TextFileProcessor("example.txt");
    const imageProcessor = new ImageFileProcessor("photo.jpg", 80);
    
    console.log("Processing text file:", await textProcessor.processFile());
    console.log("Text processor status:", textProcessor.getStatus());
    console.log();
    
    console.log("Processing image file:", await imageProcessor.processFile());
    console.log("Image processor status:", imageProcessor.getStatus());
    console.log("Image info:", imageProcessor.getImageInfo());
}

function testGameSystem(): void {
    console.log("=== Game System Test ===");
    
    const player = new Player("Hero", 1, 100, 100, 15, 5);
    const enemy = new Enemy("Orc", "orc", 80, 80, 12, ["Gold", "Sword"]);
    
    console.log("Initial stats:");
    console.log("Player:", player.getStats());
    console.log("Enemy:", enemy.getStats());
    console.log();
    
    // Combat simulation
    const damage = player.attack(enemy);
    console.log(`Player attacks for ${damage} damage`);
    
    if (enemy.isAlive()) {
        enemy.attack(player);
    }
    
    console.log("\nAfter combat:");
    console.log("Player:", player.getStats());
    console.log("Enemy:", enemy.getStats());
    
    // Experience and level up
    player.gainExperience(150);
    
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
    const deviceTokens = ["device123token", "device456token"];
    
    console.log("Sending email:", await emailSender.sendNotification(message, emailRecipients));
    console.log("Email sender info:", emailSender.getSenderInfo());
    console.log();
    
    console.log("Sending SMS:", await smsSender.sendNotification("Short SMS message", phoneRecipients));
    console.log("SMS sender info:", smsSender.getSenderInfo());
    console.log();
    
    console.log("Sending push notification:", await pushSender.sendNotification(message, deviceTokens));
    console.log("Push sender info:", pushSender.getSenderInfo());
}

// テスト実行
console.log("=== Abstract Classes Solutions Tests ===\n");

testShapeSystem();
console.log();

await testFileSystem();
console.log();

testGameSystem();
console.log();

await testNotificationSystem();

console.log("\n=== All tests completed! ===");

export {};