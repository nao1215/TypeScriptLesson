interface FormData {
    name: string;
    email: string;
    age: number;
    agreeToTerms: boolean;
}

export function validateForm(formData: FormData): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    const hasValidName = formData.name.trim().length > 0;
    if (!hasValidName) {
        errors.push("名前を入力してください");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasValidEmail = emailRegex.test(formData.email);
    if (!hasValidEmail) {
        errors.push("有効なメールアドレスを入力してください");
    }
    
    const hasValidAge = formData.age >= 18 && formData.age <= 120;
    if (!hasValidAge) {
        errors.push("年齢は18歳以上120歳以下である必要があります");
    }
    
    if (!formData.agreeToTerms) {
        errors.push("利用規約に同意してください");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

interface User {
    id: number;
    role: 'admin' | 'user' | 'guest';
    isActive: boolean;
    permissions: string[];
}

export function hasPermission(user: User, requiredPermission: string): boolean {
    if (!user.isActive) {
        return false;
    }
    
    if (user.role === 'admin') {
        return true;
    }
    
    return user.permissions.includes(requiredPermission);
}

export function canAccessResource(user: User, resource: string): boolean {
    const isAuthenticated = user.role !== 'guest';
    const isActive = user.isActive;
    const hasResourcePermission = hasPermission(user, `read:${resource}`);
    
    return isAuthenticated && isActive && hasResourcePermission;
}

export function canModifyResource(user: User, resource: string): boolean {
    const canAccess = canAccessResource(user, resource);
    const hasModifyPermission = hasPermission(user, `write:${resource}`);
    
    return canAccess && hasModifyPermission;
}

interface GameState {
    isGameRunning: boolean;
    playerHealth: number;
    hasKey: boolean;
    enemiesDefeated: number;
    timeRemaining: number;
}

export function canPlayerWin(gameState: GameState): boolean {
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

export function shouldShowWarning(gameState: GameState): boolean {
    const lowHealth = gameState.playerHealth <= 20;
    const lowTime = gameState.timeRemaining <= 60;
    const noKey = !gameState.hasKey;
    
    return gameState.isGameRunning && (lowHealth || lowTime || noKey);
}

export function getGameStatus(gameState: GameState): string {
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

export function isTruthy(value: any): boolean {
    return Boolean(value);
}

export function safeCheck(value: boolean | null | undefined): boolean {
    return value === true;
}

export function getValueOrDefault(value: boolean | undefined): boolean {
    return value || false;
}

export function getValueOrFallback(value: boolean | null | undefined): boolean {
    return value ?? false;
}

function main() {
    console.log("=== Lesson 05: 真偽値型の例 ===\n");

    console.log("1. 基本的なboolean操作");
    const isActive = true;
    const hasPermission = false;
    const canAccess = isActive && hasPermission;
    const shouldShow = isActive || hasPermission;
    const isInactive = !isActive;
    
    console.log(`isActive: ${isActive}`);
    console.log(`hasPermission: ${hasPermission}`);
    console.log(`canAccess (AND): ${canAccess}`);
    console.log(`shouldShow (OR): ${shouldShow}`);
    console.log(`isInactive (NOT): ${isInactive}`);
    console.log();

    console.log("2. 比較演算子");
    const age = 20;
    const minAge = 18;
    console.log(`age (${age}) >= minAge (${minAge}): ${age >= minAge}`);
    console.log(`age === 20: ${age === 20}`);
    console.log(`age !== minAge: ${age !== minAge}`);
    console.log();

    console.log("3. Truthyと Falsy値");
    const values = [true, false, 1, 0, "hello", "", null, undefined, [], {}];
    values.forEach(value => {
        console.log(`isTruthy(${JSON.stringify(value)}): ${isTruthy(value)}`);
    });
    console.log();

    console.log("4. フォームバリデーション例");
    const formData: FormData = {
        name: "田中太郎",
        email: "tanaka@example.com",
        age: 25,
        agreeToTerms: true
    };
    
    const validation = validateForm(formData);
    console.log(`フォームバリデーション結果: ${validation.isValid ? "成功" : "失敗"}`);
    if (!validation.isValid) {
        validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    console.log();

    console.log("5. ユーザー権限チェック例");
    const user: User = {
        id: 1,
        role: 'user',
        isActive: true,
        permissions: ['read:profile', 'write:profile']
    };
    
    console.log(`ユーザーはprofileを読める: ${canAccessResource(user, 'profile')}`);
    console.log(`ユーザーはprofileを書ける: ${canModifyResource(user, 'profile')}`);
    console.log(`ユーザーはadminページを読める: ${canAccessResource(user, 'admin')}`);
    console.log();

    console.log("6. ゲーム状態の例");
    const gameState: GameState = {
        isGameRunning: true,
        playerHealth: 15,
        hasKey: true,
        enemiesDefeated: 6,
        timeRemaining: 45
    };
    
    console.log(`ゲーム状態: ${getGameStatus(gameState)}`);
    console.log(`勝利可能: ${canPlayerWin(gameState)}`);
    console.log(`警告表示: ${shouldShowWarning(gameState)}`);
}

if (require.main === module) {
    main();
}