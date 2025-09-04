/**
 * Lesson 18: リテラル型 - テストコード
 */

import {
    Weekday,
    TimeSlot,
    ScheduleEntry,
    isWeekday,
    createScheduleEntry,
    getScheduleByDay,
    SuccessStatus,
    ClientErrorStatus,
    ServerErrorStatus,
    HttpStatus,
    getStatusMessage,
    getStatusType,
    Size,
    Color,
    Component,
    ButtonClass,
    StateModifier,
    ModifiedButtonClass,
    createButtonClass,
    addStateModifier,
    Environment,
    LogLevel,
    DatabaseConfig,
    AppConfig,
    createDevelopmentConfig,
    createProductionConfig,
    adjustConfigForEnvironment
} from '../src/solution';

describe('Lesson 18: リテラル型', () => {
    describe('スケジュール管理システム', () => {
        test('isWeekday: 平日を正しく判定', () => {
            expect(isWeekday("monday")).toBe(true);
            expect(isWeekday("tuesday")).toBe(true);
            expect(isWeekday("wednesday")).toBe(true);
            expect(isWeekday("thursday")).toBe(true);
            expect(isWeekday("friday")).toBe(true);
        });

        test('isWeekday: 週末を正しく判定', () => {
            expect(isWeekday("saturday")).toBe(false);
            expect(isWeekday("sunday")).toBe(false);
        });

        test('createScheduleEntry: スケジュールエントリを作成', () => {
            const entry = createScheduleEntry("monday", "morning", "Meeting");
            expect(entry).toEqual({
                day: "monday",
                timeSlot: "morning",
                activity: "Meeting"
            });
        });

        test('getScheduleByDay: 指定した曜日のスケジュールを取得', () => {
            const schedule: ScheduleEntry[] = [
                createScheduleEntry("monday", "morning", "Meeting"),
                createScheduleEntry("tuesday", "afternoon", "Review"),
                createScheduleEntry("monday", "evening", "Study"),
                createScheduleEntry("wednesday", "morning", "Workshop")
            ];

            const mondaySchedule = getScheduleByDay(schedule, "monday");
            expect(mondaySchedule).toHaveLength(2);
            expect(mondaySchedule[0].activity).toBe("Meeting");
            expect(mondaySchedule[1].activity).toBe("Study");

            const tuesdaySchedule = getScheduleByDay(schedule, "tuesday");
            expect(tuesdaySchedule).toHaveLength(1);
            expect(tuesdaySchedule[0].activity).toBe("Review");

            const sundaySchedule = getScheduleByDay(schedule, "sunday");
            expect(sundaySchedule).toHaveLength(0);
        });
    });

    describe('HTTP ステータス管理システム', () => {
        test('getStatusMessage: 成功ステータスのメッセージ', () => {
            expect(getStatusMessage(200)).toBe("OK");
            expect(getStatusMessage(201)).toBe("Created");
            expect(getStatusMessage(204)).toBe("No Content");
        });

        test('getStatusMessage: クライアントエラーのメッセージ', () => {
            expect(getStatusMessage(400)).toBe("Bad Request");
            expect(getStatusMessage(401)).toBe("Unauthorized");
            expect(getStatusMessage(403)).toBe("Forbidden");
            expect(getStatusMessage(404)).toBe("Not Found");
        });

        test('getStatusMessage: サーバーエラーのメッセージ', () => {
            expect(getStatusMessage(500)).toBe("Internal Server Error");
            expect(getStatusMessage(502)).toBe("Bad Gateway");
            expect(getStatusMessage(503)).toBe("Service Unavailable");
        });

        test('getStatusType: ステータスタイプの判定', () => {
            expect(getStatusType(200)).toBe("success");
            expect(getStatusType(201)).toBe("success");
            expect(getStatusType(400)).toBe("client_error");
            expect(getStatusType(404)).toBe("client_error");
            expect(getStatusType(500)).toBe("server_error");
            expect(getStatusType(503)).toBe("server_error");
        });
    });

    describe('CSS クラス名生成システム', () => {
        test('createButtonClass: ボタンクラス名の生成', () => {
            expect(createButtonClass("md", "primary")).toBe("btn-md-primary");
            expect(createButtonClass("lg", "danger")).toBe("btn-lg-danger");
            expect(createButtonClass("sm", "secondary")).toBe("btn-sm-secondary");
        });

        test('addStateModifier: 状態修飾子の追加', () => {
            const buttonClass = createButtonClass("md", "primary");
            expect(addStateModifier(buttonClass, "hover")).toBe("btn-md-primary-hover");
            expect(addStateModifier(buttonClass, "active")).toBe("btn-md-primary-active");
            expect(addStateModifier(buttonClass, "disabled")).toBe("btn-md-primary-disabled");
        });

        test('複合的なクラス名生成', () => {
            const baseClass = createButtonClass("xl", "warning");
            const hoverClass = addStateModifier(baseClass, "hover");
            const focusClass = addStateModifier(baseClass, "focus");

            expect(baseClass).toBe("btn-xl-warning");
            expect(hoverClass).toBe("btn-xl-warning-hover");
            expect(focusClass).toBe("btn-xl-warning-focus");
        });
    });

    describe('設定管理システム', () => {
        test('createDevelopmentConfig: 開発環境設定の作成', () => {
            const config = createDevelopmentConfig();
            expect(config.environment).toBe("development");
            expect(config.logLevel).toBe("debug");
            expect(config.database.port).toBe(5432);
            expect(config.database.ssl).toBe(false);
            expect(config.features.feature1).toBe(true);
        });

        test('createProductionConfig: 本番環境設定の作成', () => {
            const config = createProductionConfig();
            expect(config.environment).toBe("production");
            expect(config.logLevel).toBe("error");
            expect(config.database.ssl).toBe(true);
            expect(config.features.feature1).toBe(false);
        });

        test('adjustConfigForEnvironment: 環境に応じた設定調整', () => {
            const baseConfig = createDevelopmentConfig();

            const stagingConfig = adjustConfigForEnvironment(baseConfig, "staging");
            expect(stagingConfig.environment).toBe("staging");
            expect(stagingConfig.logLevel).toBe("info");

            const prodConfig = adjustConfigForEnvironment(baseConfig, "production");
            expect(prodConfig.environment).toBe("production");
            expect(prodConfig.logLevel).toBe("error");

            const devConfig = adjustConfigForEnvironment(baseConfig, "development");
            expect(devConfig.environment).toBe("development");
            expect(devConfig.logLevel).toBe("debug");
        });

        test('設定の不変性', () => {
            const originalConfig = createDevelopmentConfig();
            const adjustedConfig = adjustConfigForEnvironment(originalConfig, "production");

            // 元の設定は変更されていない
            expect(originalConfig.environment).toBe("development");
            expect(originalConfig.logLevel).toBe("debug");

            // 新しい設定は正しく変更されている
            expect(adjustedConfig.environment).toBe("production");
            expect(adjustedConfig.logLevel).toBe("error");
        });
    });

    describe('型の制約テスト', () => {
        test('リテラル型の制約が正しく機能する', () => {
            // 型レベルでの制約はコンパイル時にチェックされるため、
            // ランタイムテストでは正しい値の使用例のみをテスト

            const validWeekday: Weekday = "monday";
            const validTimeSlot: TimeSlot = "morning";
            const validHttpStatus: HttpStatus = 200;
            const validSize: Size = "md";
            const validColor: Color = "primary";

            expect(typeof validWeekday).toBe("string");
            expect(typeof validTimeSlot).toBe("string");
            expect(typeof validHttpStatus).toBe("number");
            expect(typeof validSize).toBe("string");
            expect(typeof validColor).toBe("string");
        });
    });
});