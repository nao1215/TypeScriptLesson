import {
    validateForm,
    hasPermission,
    canAccessResource,
    canModifyResource,
    canPlayerWin,
    shouldShowWarning,
    getGameStatus,
    isTruthy,
    safeCheck,
    getValueOrDefault,
    getValueOrFallback
} from '../src/index';

import {
    isEven,
    isInRange,
    isValidPassword,
    canVote,
    isWeekend
} from '../src/solution';

describe('Lesson 05: 真偽値型', () => {
    describe('フォームバリデーション', () => {
        test('有効なフォームデータ', () => {
            const validForm = {
                name: "田中太郎",
                email: "tanaka@example.com",
                age: 25,
                agreeToTerms: true
            };
            
            const result = validateForm(validForm);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('無効なフォームデータ', () => {
            const invalidForm = {
                name: "",
                email: "invalid-email",
                age: 15,
                agreeToTerms: false
            };
            
            const result = validateForm(invalidForm);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors).toContain("名前を入力してください");
            expect(result.errors).toContain("有効なメールアドレスを入力してください");
            expect(result.errors).toContain("年齢は18歳以上120歳以下である必要があります");
            expect(result.errors).toContain("利用規約に同意してください");
        });
    });

    describe('ユーザー権限システム', () => {
        const adminUser = {
            id: 1,
            role: 'admin' as const,
            isActive: true,
            permissions: ['read:users', 'write:users']
        };

        const regularUser = {
            id: 2,
            role: 'user' as const,
            isActive: true,
            permissions: ['read:profile']
        };

        const inactiveUser = {
            id: 3,
            role: 'user' as const,
            isActive: false,
            permissions: ['read:profile']
        };

        test('権限チェック', () => {
            expect(hasPermission(adminUser, 'any:permission')).toBe(true);
            expect(hasPermission(regularUser, 'read:profile')).toBe(true);
            expect(hasPermission(regularUser, 'write:profile')).toBe(false);
            expect(hasPermission(inactiveUser, 'read:profile')).toBe(false);
        });

        test('リソースアクセス権限', () => {
            expect(canAccessResource(adminUser, 'users')).toBe(true);
            expect(canAccessResource(regularUser, 'profile')).toBe(true);
            expect(canAccessResource(regularUser, 'admin')).toBe(false);
            expect(canAccessResource(inactiveUser, 'profile')).toBe(false);
        });

        test('リソース変更権限', () => {
            expect(canModifyResource(adminUser, 'users')).toBe(true);
            expect(canModifyResource(regularUser, 'profile')).toBe(false);
            expect(canModifyResource(inactiveUser, 'profile')).toBe(false);
        });
    });

    describe('ゲーム状態管理', () => {
        const winningGameState = {
            isGameRunning: true,
            playerHealth: 100,
            hasKey: true,
            enemiesDefeated: 10,
            timeRemaining: 300
        };

        const warningGameState = {
            isGameRunning: true,
            playerHealth: 15,
            hasKey: false,
            enemiesDefeated: 3,
            timeRemaining: 30
        };

        test('勝利条件チェック', () => {
            expect(canPlayerWin(winningGameState)).toBe(true);
            expect(canPlayerWin(warningGameState)).toBe(false);
        });

        test('警告表示判定', () => {
            expect(shouldShowWarning(winningGameState)).toBe(false);
            expect(shouldShowWarning(warningGameState)).toBe(true);
        });

        test('ゲームステータス取得', () => {
            expect(getGameStatus(winningGameState)).toBe("クリア条件達成！");
            expect(getGameStatus(warningGameState)).toBe("注意が必要です");
            expect(getGameStatus({ ...winningGameState, isGameRunning: false })).toBe("ゲーム停止中");
            expect(getGameStatus({ ...winningGameState, playerHealth: 0 })).toBe("ゲームオーバー");
        });
    });

    describe('Truthy/Falsyと安全なチェック', () => {
        test('Truthy値の判定', () => {
            expect(isTruthy(true)).toBe(true);
            expect(isTruthy(1)).toBe(true);
            expect(isTruthy("hello")).toBe(true);
            expect(isTruthy([])).toBe(true);
            expect(isTruthy({})).toBe(true);
        });

        test('Falsy値の判定', () => {
            expect(isTruthy(false)).toBe(false);
            expect(isTruthy(0)).toBe(false);
            expect(isTruthy("")).toBe(false);
            expect(isTruthy(null)).toBe(false);
            expect(isTruthy(undefined)).toBe(false);
            expect(isTruthy(NaN)).toBe(false);
        });

        test('安全なboolean値チェック', () => {
            expect(safeCheck(true)).toBe(true);
            expect(safeCheck(false)).toBe(false);
            expect(safeCheck(null)).toBe(false);
            expect(safeCheck(undefined)).toBe(false);
        });

        test('デフォルト値の取得', () => {
            expect(getValueOrDefault(true)).toBe(true);
            expect(getValueOrDefault(false)).toBe(false);
            expect(getValueOrDefault(undefined)).toBe(false);

            expect(getValueOrFallback(true)).toBe(true);
            expect(getValueOrFallback(false)).toBe(false);
            expect(getValueOrFallback(null)).toBe(false);
            expect(getValueOrFallback(undefined)).toBe(false);
        });
    });

    describe('演習問題の解答', () => {
        test('偶数判定', () => {
            expect(isEven(2)).toBe(true);
            expect(isEven(4)).toBe(true);
            expect(isEven(1)).toBe(false);
            expect(isEven(3)).toBe(false);
            expect(isEven(0)).toBe(true);
            expect(isEven(-2)).toBe(true);
        });

        test('範囲内判定', () => {
            expect(isInRange(5, 1, 10)).toBe(true);
            expect(isInRange(1, 1, 10)).toBe(true);
            expect(isInRange(10, 1, 10)).toBe(true);
            expect(isInRange(0, 1, 10)).toBe(false);
            expect(isInRange(11, 1, 10)).toBe(false);
        });

        test('パスワード強度チェック', () => {
            expect(isValidPassword('Password123!')).toBe(true);
            expect(isValidPassword('MySecret@1')).toBe(true);
            expect(isValidPassword('password')).toBe(false); // 短い、大文字なし、数字なし、特殊文字なし
            expect(isValidPassword('PASSWORD123!')).toBe(false); // 小文字なし
            expect(isValidPassword('Password!')).toBe(false); // 数字なし
            expect(isValidPassword('Password123')).toBe(false); // 特殊文字なし
        });

        test('投票資格チェック', () => {
            expect(canVote(20, true)).toBe(true);
            expect(canVote(18, true)).toBe(true);
            expect(canVote(17, true)).toBe(false);
            expect(canVote(20, false)).toBe(false);
            expect(canVote(17, false)).toBe(false);
        });

        test('週末判定', () => {
            // 土曜日
            expect(isWeekend(new Date('2023-12-16'))).toBe(true);
            // 日曜日
            expect(isWeekend(new Date('2023-12-17'))).toBe(true);
            // 月曜日
            expect(isWeekend(new Date('2023-12-18'))).toBe(false);
            // 金曜日
            expect(isWeekend(new Date('2023-12-15'))).toBe(false);
        });
    });
});