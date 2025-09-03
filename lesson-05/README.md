# Lesson 05: 真偽値型 (Boolean Type)

## 学習目標
- TypeScriptのboolean型の基本的な使い方を理解する
- 論理演算子の使用方法を学ぶ
- 条件分岐とboolean型の関係を理解する
- 実用的な条件判定ロジックの実装方法を身につける

## 概要
TypeScriptの`boolean`型は、`true`または`false`の二つの値のみを持つ型です。プログラムの制御フローや条件判定において重要な役割を果たします。

## 主な内容

### 1. boolean型の基本
```typescript
// 明示的な型指定
let isActive: boolean = true;
let isCompleted: boolean = false;

// 型推論（推奨）
let hasPermission = true; // TypeScriptが自動的にboolean型と推論
let isLoading = false;
```

### 2. 論理演算子
```typescript
// AND演算子 (&&)
let canAccess = isActive && hasPermission;

// OR演算子 (||)
let shouldShow = isActive || isCompleted;

// NOT演算子 (!)
let isInactive = !isActive;

// 複合条件
let complexCondition = (isActive && hasPermission) || (!isLoading && isCompleted);
```

### 3. 比較演算子
```typescript
let age = 20;
let minAge = 18;

// 等価比較
let isEqual = age === minAge;        // false (厳密な等価)
let isLooseEqual = age == minAge;    // false (緩い等価、非推奨)

// 不等価比較
let isNotEqual = age !== minAge;     // true
let isLooseNotEqual = age != minAge; // true (非推奨)

// 大小比較
let isOldEnough = age >= minAge;     // true
let isYounger = age < 25;            // true
let isOlder = age > 30;              // false
let isExactly20 = age <= 20;         // true
```

### 4. Truthyと Falsy
```typescript
// Falsy値: false, 0, -0, 0n, "", null, undefined, NaN
function isTruthy(value: any): boolean {
    return Boolean(value);
}

// Falsy値の例
console.log(isTruthy(false));     // false
console.log(isTruthy(0));         // false
console.log(isTruthy(""));        // false
console.log(isTruthy(null));      // false
console.log(isTruthy(undefined)); // false
console.log(isTruthy(NaN));       // false

// Truthy値の例
console.log(isTruthy(true));      // true
console.log(isTruthy(1));         // true
console.log(isTruthy("hello"));   // true
console.log(isTruthy([]));        // true
console.log(isTruthy({}));        // true
```

### 5. 条件分岐での使用
```typescript
function checkUserStatus(user: { isActive: boolean; isVerified: boolean; age: number }) {
    // if文での使用
    if (user.isActive) {
        console.log("ユーザーはアクティブです");
    }
    
    // if-else文
    if (user.isVerified) {
        console.log("認証済みユーザー");
    } else {
        console.log("未認証ユーザー");
    }
    
    // 複合条件
    if (user.isActive && user.isVerified && user.age >= 18) {
        console.log("すべての条件を満たしています");
    }
    
    // 三項演算子
    const status = user.isActive ? "アクティブ" : "非アクティブ";
    const verification = user.isVerified ? "認証済み" : "未認証";
    
    return { status, verification };
}
```

## 実践的な使用例

### 例1: フォームバリデーション
```typescript
interface FormData {
    name: string;
    email: string;
    age: number;
    agreeToTerms: boolean;
}

function validateForm(formData: FormData): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    // 名前のバリデーション
    const hasValidName = formData.name.trim().length > 0;
    if (!hasValidName) {
        errors.push("名前を入力してください");
    }
    
    // メールのバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasValidEmail = emailRegex.test(formData.email);
    if (!hasValidEmail) {
        errors.push("有効なメールアドレスを入力してください");
    }
    
    // 年齢のバリデーション
    const hasValidAge = formData.age >= 18 && formData.age <= 120;
    if (!hasValidAge) {
        errors.push("年齢は18歳以上120歳以下である必要があります");
    }
    
    // 利用規約への同意
    if (!formData.agreeToTerms) {
        errors.push("利用規約に同意してください");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
```

### 例2: 権限チェックシステム
```typescript
interface User {
    id: number;
    role: 'admin' | 'user' | 'guest';
    isActive: boolean;
    permissions: string[];
}

function hasPermission(user: User, requiredPermission: string): boolean {
    // 非アクティブユーザーは何もできない
    if (!user.isActive) {
        return false;
    }
    
    // 管理者はすべての権限を持つ
    if (user.role === 'admin') {
        return true;
    }
    
    // 特定の権限を持っているかチェック
    return user.permissions.includes(requiredPermission);
}

function canAccessResource(user: User, resource: string): boolean {
    const isAuthenticated = user.role !== 'guest';
    const isActive = user.isActive;
    const hasResourcePermission = hasPermission(user, `read:${resource}`);
    
    return isAuthenticated && isActive && hasResourcePermission;
}

function canModifyResource(user: User, resource: string): boolean {
    const canAccess = canAccessResource(user, resource);
    const hasModifyPermission = hasPermission(user, `write:${resource}`);
    
    return canAccess && hasModifyPermission;
}
```

### 例3: ゲームロジック
```typescript
interface GameState {
    isGameRunning: boolean;
    playerHealth: number;
    hasKey: boolean;
    enemiesDefeated: number;
    timeRemaining: number;
}

function canPlayerWin(gameState: GameState): boolean {
    const isAlive = gameState.playerHealth > 0;
    const hasRequiredKey = gameState.hasKey;
    const defeatedEnoughEnemies = gameState.enemiesDefeated >= 5;
    const hasTimeLeft = gameState.timeRemaining > 0;
    
    return gameState.isGameRunning && 
           isAlive && 
           hasRequiredKey && 
           defeatedEnoughEnemies && 
           hasTimeLeft;
}

function shouldShowWarning(gameState: GameState): boolean {
    const lowHealth = gameState.playerHealth <= 20;
    const lowTime = gameState.timeRemaining <= 60; // 60秒以下
    const noKey = !gameState.hasKey;
    
    return gameState.isGameRunning && (lowHealth || lowTime || noKey);
}

function getGameStatus(gameState: GameState): string {
    if (!gameState.isGameRunning) {
        return "ゲーム停止中";
    }
    
    if (gameState.playerHealth <= 0) {
        return "ゲームオーバー";
    }
    
    if (canPlayerWin(gameState)) {
        return "クリア条件達成！";
    }
    
    if (shouldShowWarning(gameState)) {
        return "注意が必要です";
    }
    
    return "ゲーム進行中";
}
```

## よくある落とし穴と対処法

### 1. 緩い等価演算子の問題
```typescript
// 避けるべき書き方
// if (value == true) { ... }  // 緩い等価（非推奨）

// 推奨される書き方
function checkValue(value: unknown): boolean {
    // 明示的な真偽値変換
    return Boolean(value);
}

// または型ガードを使用
function isBooleanTrue(value: unknown): value is true {
    return value === true;
}
```

### 2. Null・Undefined チェック
```typescript
function safeCheck(value: boolean | null | undefined): boolean {
    // null や undefined の場合は false を返す
    return value === true;
}

// より明示的な書き方
function explicitCheck(value: boolean | null | undefined): boolean {
    if (value === null || value === undefined) {
        return false;
    }
    return value;
}
```

### 3. 短絡評価の活用
```typescript
// AND短絡評価
function processIfCondition(condition: boolean, data: any): void {
    condition && console.log("条件が真の場合のみ実行");
}

// OR短絡評価（デフォルト値）
function getValueOrDefault(value: boolean | undefined): boolean {
    return value || false;
}

// Null合体演算子（ES2020+）
function getValueOrFallback(value: boolean | null | undefined): boolean {
    return value ?? false;
}
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `isEven(num: number): boolean` - 偶数かどうかを判定
2. `isInRange(value: number, min: number, max: number): boolean` - 範囲内かどうかを判定
3. `isValidPassword(password: string): boolean` - パスワードの強度チェック
4. `canVote(age: number, isCitizen: boolean): boolean` - 投票資格チェック
5. `isWeekend(date: Date): boolean` - 週末かどうかを判定

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-05
```

## 次のレッスン
[Lesson 06: null と undefined](../lesson-06/README.md)では、null型とundefined型について学習します。