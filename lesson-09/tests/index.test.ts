import {
    Direction,
    Status,
    Priority,
    Color,
    LogLevel,
    HttpMethod,
    Weekday,
    FileAccess,
    ApiStatus,
    HttpStatusCode,
    ApiClient,
    GameState,
    PlayerState,
    ItemType,
    WeaponType,
    DamageType,
    GameEngine,
    Theme,
    Language,
    NotificationLevel,
    SettingsManager,
    hasPermission,
    combinePermissions,
    getEnumKeys,
    getEnumValues,
    isValidEnumValue
} from '../src/index';

import {
    getStatusColor,
    isValidTransition,
    getPriorityLevel,
    getNextWorkday,
    calculatePermissions,
    TaskStatus
} from '../src/solution';

describe('Lesson 09: enum型', () => {
    describe('基本的なenum', () => {
        test('数値enumのテスト', () => {
            expect(Direction.Up).toBe(0);
            expect(Direction.Down).toBe(1);
            expect(Direction.Left).toBe(2);
            expect(Direction.Right).toBe(3);
            
            // リバースマッピング
            expect(Direction[0]).toBe("Up");
            expect(Direction[1]).toBe("Down");
        });

        test('明示的な数値enumのテスト', () => {
            expect(Status.Inactive).toBe(0);
            expect(Status.Active).toBe(1);
            expect(Status.Pending).toBe(2);
            expect(Status.Suspended).toBe(10);
        });

        test('部分的な数値指定enumのテスト', () => {
            expect(Priority.Low).toBe(1);
            expect(Priority.Medium).toBe(2);
            expect(Priority.High).toBe(3);
            expect(Priority.Urgent).toBe(10);
            expect(Priority.Critical).toBe(11);
        });

        test('文字列enumのテスト', () => {
            expect(Color.Red).toBe("red");
            expect(Color.Green).toBe("green");
            expect(Color.Blue).toBe("blue");
            expect(Color.Yellow).toBe("yellow");
        });

        test('const enumのテスト', () => {
            expect(Weekday.Monday).toBe("monday");
            expect(Weekday.Friday).toBe("friday");
        });
    });

    describe('ビット演算enum', () => {
        test('FileAccessの値', () => {
            expect(FileAccess.None).toBe(0);
            expect(FileAccess.Read).toBe(1);
            expect(FileAccess.Write).toBe(2);
            expect(FileAccess.ReadWrite).toBe(3);
            expect(FileAccess.Execute).toBe(4);
            expect(FileAccess.All).toBe(7);
        });

        test('権限のチェック', () => {
            expect(hasPermission(FileAccess.ReadWrite, FileAccess.Read)).toBe(true);
            expect(hasPermission(FileAccess.ReadWrite, FileAccess.Write)).toBe(true);
            expect(hasPermission(FileAccess.ReadWrite, FileAccess.Execute)).toBe(false);
            expect(hasPermission(FileAccess.All, FileAccess.Execute)).toBe(true);
        });

        test('権限の組み合わせ', () => {
            const readWrite = combinePermissions(FileAccess.Read, FileAccess.Write);
            expect(readWrite).toBe(FileAccess.ReadWrite);
            
            const all = combinePermissions(FileAccess.Read, FileAccess.Write, FileAccess.Execute);
            expect(all).toBe(FileAccess.All);
            
            const none = combinePermissions();
            expect(none).toBe(FileAccess.None);
        });
    });

    describe('APIクライアント', () => {
        let client: ApiClient;

        beforeEach(() => {
            client = new ApiClient("https://api.example.com");
        });

        test('成功レスポンス', async () => {
            const response = await client.request("/users");
            expect(response.status).toBe(ApiStatus.Success);
            expect(response.httpStatus).toBe(HttpStatusCode.OK);
            expect(response.data).toBeDefined();
        });

        test('POSTリクエスト', async () => {
            const response = await client.request("/users", HttpMethod.POST, { name: "test" });
            expect(response.status).toBe(ApiStatus.Success);
            expect(response.httpStatus).toBe(HttpStatusCode.Created);
        });

        test('エラーレスポンス', async () => {
            const response = await client.request("/error");
            expect(response.status).toBe(ApiStatus.Error);
            expect(response.httpStatus).toBe(HttpStatusCode.InternalServerError);
        });

        test('NotFoundレスポンス', async () => {
            const response = await client.request("/notfound");
            expect(response.status).toBe(ApiStatus.Error);
            expect(response.httpStatus).toBe(HttpStatusCode.NotFound);
        });

        test('ステータスメッセージ', () => {
            expect(client.getStatusMessage(ApiStatus.Idle)).toBe("待機中");
            expect(client.getStatusMessage(ApiStatus.Loading)).toBe("読み込み中...");
            expect(client.getStatusMessage(ApiStatus.Success)).toBe("成功");
            expect(client.getStatusMessage(ApiStatus.Error)).toBe("エラーが発生しました");
        });

        test('HTTPステータスの判定', () => {
            expect(client.isSuccessStatus(HttpStatusCode.OK)).toBe(true);
            expect(client.isSuccessStatus(HttpStatusCode.Created)).toBe(true);
            expect(client.isSuccessStatus(HttpStatusCode.BadRequest)).toBe(false);
            
            expect(client.isClientError(HttpStatusCode.BadRequest)).toBe(true);
            expect(client.isClientError(HttpStatusCode.NotFound)).toBe(true);
            expect(client.isClientError(HttpStatusCode.InternalServerError)).toBe(false);
            
            expect(client.isServerError(HttpStatusCode.InternalServerError)).toBe(true);
            expect(client.isServerError(HttpStatusCode.BadRequest)).toBe(false);
        });
    });

    describe('ゲームエンジン', () => {
        let gameEngine: GameEngine;

        beforeEach(() => {
            gameEngine = new GameEngine();
        });

        test('初期状態', () => {
            expect(gameEngine.getCurrentState()).toBe(GameState.Menu);
        });

        test('有効な状態遷移', () => {
            expect(gameEngine.changeState(GameState.Loading)).toBe(true);
            expect(gameEngine.getCurrentState()).toBe(GameState.Loading);
            
            expect(gameEngine.changeState(GameState.Playing)).toBe(true);
            expect(gameEngine.getCurrentState()).toBe(GameState.Playing);
        });

        test('無効な状態遷移', () => {
            expect(gameEngine.changeState(GameState.Playing)).toBe(false); // Menu -> Playing は無効
            expect(gameEngine.getCurrentState()).toBe(GameState.Menu); // 状態は変更されない
        });

        test('武器価値の計算', () => {
            const physicalValue = gameEngine.calculateWeaponValue(100, DamageType.Physical);
            const fireValue = gameEngine.calculateWeaponValue(100, DamageType.Fire);
            const lightningValue = gameEngine.calculateWeaponValue(100, DamageType.Lightning);
            
            expect(physicalValue).toBe(1000); // 100 * 10 * 1.0
            expect(fireValue).toBe(1300);     // 100 * 10 * 1.3
            expect(lightningValue).toBe(1400); // 100 * 10 * 1.4
        });
    });

    describe('設定管理', () => {
        let settings: SettingsManager;

        beforeEach(() => {
            settings = new SettingsManager();
        });

        test('デフォルト設定', () => {
            expect(settings.getTheme()).toBe(Theme.Auto);
            expect(settings.getLanguage()).toBe(Language.Japanese);
            expect(settings.getNotificationLevel()).toBe(NotificationLevel.Important);
        });

        test('設定の変更', () => {
            settings.setTheme(Theme.Dark);
            expect(settings.getTheme()).toBe(Theme.Dark);
            
            settings.setLanguage(Language.English);
            expect(settings.getLanguage()).toBe(Language.English);
            
            settings.setNotificationLevel(NotificationLevel.Critical);
            expect(settings.getNotificationLevel()).toBe(NotificationLevel.Critical);
        });

        test('テーマ説明の取得', () => {
            expect(settings.getThemeDescription(Theme.Light)).toBe("明るいテーマ");
            expect(settings.getThemeDescription(Theme.Dark)).toBe("暗いテーマ");
            expect(settings.getThemeDescription(Theme.Auto)).toBe("システム設定に従う");
        });

        test('利用可能な設定の取得', () => {
            expect(settings.getAvailableThemes()).toEqual([Theme.Light, Theme.Dark, Theme.Auto]);
            expect(settings.getAvailableLanguages()).toContain(Language.Japanese);
            expect(settings.getAvailableLanguages()).toContain(Language.English);
            expect(settings.getAvailableNotificationLevels()).toContain(NotificationLevel.All);
        });
    });

    describe('enumユーティリティ', () => {
        test('enumキーの取得', () => {
            const colorKeys = getEnumKeys(Color);
            expect(colorKeys).toEqual(["Red", "Green", "Blue", "Yellow"]);
        });

        test('enum値の取得', () => {
            const colorValues = getEnumValues(Color);
            expect(colorValues).toEqual(["red", "green", "blue", "yellow"]);
        });

        test('有効なenum値の判定', () => {
            expect(isValidEnumValue(Color, "red")).toBe(true);
            expect(isValidEnumValue(Color, "green")).toBe(true);
            expect(isValidEnumValue(Color, "purple")).toBe(false);
            expect(isValidEnumValue(Color, 123)).toBe(false);
        });
    });

    describe('演習問題の解答', () => {
        test('ステータス色の取得', () => {
            expect(getStatusColor(TaskStatus.Todo)).toBe("blue");
            expect(getStatusColor(TaskStatus.InProgress)).toBe("orange");
            expect(getStatusColor(TaskStatus.Review)).toBe("yellow");
            expect(getStatusColor(TaskStatus.Done)).toBe("green");
            expect(getStatusColor(TaskStatus.Cancelled)).toBe("red");
        });

        test('状態遷移の検証', () => {
            // 有効な遷移
            expect(isValidTransition(TaskStatus.Todo, TaskStatus.InProgress)).toBe(true);
            expect(isValidTransition(TaskStatus.Todo, TaskStatus.Cancelled)).toBe(true);
            expect(isValidTransition(TaskStatus.InProgress, TaskStatus.Review)).toBe(true);
            expect(isValidTransition(TaskStatus.InProgress, TaskStatus.Done)).toBe(true);
            expect(isValidTransition(TaskStatus.Review, TaskStatus.Done)).toBe(true);
            expect(isValidTransition(TaskStatus.Cancelled, TaskStatus.Todo)).toBe(true);
            
            // 無効な遷移
            expect(isValidTransition(TaskStatus.Done, TaskStatus.Todo)).toBe(false);
            expect(isValidTransition(TaskStatus.Done, TaskStatus.InProgress)).toBe(false);
            expect(isValidTransition(TaskStatus.Todo, TaskStatus.Done)).toBe(false); // 直接完了は不可
        });

        test('優先度レベルの取得', () => {
            expect(getPriorityLevel(Priority.Low)).toBe(1);
            expect(getPriorityLevel(Priority.Medium)).toBe(2);
            expect(getPriorityLevel(Priority.High)).toBe(3);
            expect(getPriorityLevel(Priority.Urgent)).toBe(4);
            expect(getPriorityLevel(Priority.Critical)).toBe(5);
        });

        test('次の平日の取得', () => {
            expect(getNextWorkday(Weekday.Monday)).toBe(Weekday.Tuesday);
            expect(getNextWorkday(Weekday.Tuesday)).toBe(Weekday.Wednesday);
            expect(getNextWorkday(Weekday.Wednesday)).toBe(Weekday.Thursday);
            expect(getNextWorkday(Weekday.Thursday)).toBe(Weekday.Friday);
            expect(getNextWorkday(Weekday.Friday)).toBe(Weekday.Monday); // 金曜日の次は月曜日
        });

        test('権限の計算', () => {
            expect(calculatePermissions([])).toBe(FileAccess.None);
            expect(calculatePermissions([FileAccess.Read])).toBe(FileAccess.Read);
            expect(calculatePermissions([FileAccess.Write])).toBe(FileAccess.Write);
            expect(calculatePermissions([FileAccess.Read, FileAccess.Write])).toBe(FileAccess.ReadWrite);
            expect(calculatePermissions([FileAccess.Read, FileAccess.Execute])).toBe(5); // 1 | 4
            expect(calculatePermissions([FileAccess.Read, FileAccess.Write, FileAccess.Execute])).toBe(FileAccess.All);
        });
    });

    describe('型安全性のテスト', () => {
        test('switchでの網羅性チェック', () => {
            function getStatusMessage(status: TaskStatus): string {
                switch (status) {
                    case TaskStatus.Todo:
                        return "作業予定";
                    case TaskStatus.InProgress:
                        return "作業中";
                    case TaskStatus.Review:
                        return "レビュー待ち";
                    case TaskStatus.Done:
                        return "完了";
                    case TaskStatus.Cancelled:
                        return "キャンセル";
                    default:
                        const exhaustiveCheck: never = status;
                        return "不明な状態";
                }
            }

            expect(getStatusMessage(TaskStatus.Todo)).toBe("作業予定");
            expect(getStatusMessage(TaskStatus.Done)).toBe("完了");
        });

        test('enumをキーとしたRecord型', () => {
            const statusPriority: Record<TaskStatus, number> = {
                [TaskStatus.Todo]: 1,
                [TaskStatus.InProgress]: 3,
                [TaskStatus.Review]: 2,
                [TaskStatus.Done]: 0,
                [TaskStatus.Cancelled]: 0
            };

            expect(statusPriority[TaskStatus.InProgress]).toBe(3);
            expect(statusPriority[TaskStatus.Done]).toBe(0);
        });
    });
});