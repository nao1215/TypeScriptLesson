import {
    GeometryUtils,
    ApiService,
    FileParser,
    createApiClient,
    processCommand,
    formatDataWithHeader
} from '../src/index';

import {
    swapTuple,
    addThree,
    parseNameAge,
    zipArrays,
    getFirstLast
} from '../src/solution';

describe('Lesson 08: タプル型', () => {
    describe('座標計算システム', () => {
        test('2D座標の加算', () => {
            expect(GeometryUtils.addPoints2D([10, 20], [30, 40])).toEqual([40, 60]);
            expect(GeometryUtils.addPoints2D([0, 0], [5, -5])).toEqual([5, -5]);
        });

        test('2D座標の減算', () => {
            expect(GeometryUtils.subtractPoints2D([30, 40], [10, 20])).toEqual([20, 20]);
            expect(GeometryUtils.subtractPoints2D([10, 20], [30, 40])).toEqual([-20, -20]);
        });

        test('2D距離の計算', () => {
            expect(GeometryUtils.distance2D([0, 0], [3, 4])).toBe(5);
            expect(GeometryUtils.distance2D([0, 0], [0, 0])).toBe(0);
        });

        test('3D距離の計算', () => {
            expect(GeometryUtils.distance3D([0, 0, 0], [1, 1, 1])).toBeCloseTo(Math.sqrt(3));
            expect(GeometryUtils.distance3D([0, 0, 0], [3, 4, 0])).toBe(5);
        });

        test('点の移動', () => {
            expect(GeometryUtils.movePoint2D([10, 20], [5, -5])).toEqual([15, 15]);
        });

        test('範囲内チェック', () => {
            const bounds: [[number, number], [number, number]] = [[0, 0], [100, 100]];
            expect(GeometryUtils.isPointInBounds2D([50, 50], bounds)).toBe(true);
            expect(GeometryUtils.isPointInBounds2D([150, 50], bounds)).toBe(false);
            expect(GeometryUtils.isPointInBounds2D([0, 0], bounds)).toBe(true); // 境界
            expect(GeometryUtils.isPointInBounds2D([100, 100], bounds)).toBe(true); // 境界
        });

        test('範囲の拡張', () => {
            const bounds: [[number, number], [number, number]] = [[10, 10], [90, 90]];
            const expanded = GeometryUtils.expandBounds2D(bounds, 5);
            expect(expanded).toEqual([[5, 5], [95, 95]]);
        });

        test('座標の回転', () => {
            // 90度回転のテスト
            const rotated = GeometryUtils.rotate2D([1, 0], Math.PI / 2);
            expect(rotated[0]).toBeCloseTo(0, 10);
            expect(rotated[1]).toBeCloseTo(1, 10);
        });
    });

    describe('API結果処理', () => {
        test('ユーザー取得成功', async () => {
            const result = await ApiService.fetchUser(1);
            expect(result[0]).toBe(true);
            if (result[0]) {
                expect(result[1].name).toBe("田中太郎");
                expect(result[1].email).toBe("tanaka@example.com");
            }
        });

        test('ユーザー取得失敗', async () => {
            const result = await ApiService.fetchUser(-1);
            expect(result[0]).toBe(false);
            if (!result[0]) {
                expect(result[1]).toBe("無効なユーザーIDです");
            }
        });

        test('複数ユーザー取得', async () => {
            const result = await ApiService.fetchUsers();
            expect(result[0]).toBe(true);
            if (result[0]) {
                expect(result[1]).toHaveLength(2);
                expect(result[2].requestId).toMatch(/^req_\d+$/);
                expect(result[2].timestamp).toBeInstanceOf(Date);
            }
        });

        test('ユーザー作成成功', async () => {
            const userData = { name: "新規ユーザー", email: "newuser@example.com" };
            const result = await ApiService.createUser(userData);
            expect(result[0]).toBe(true);
            if (result[0]) {
                expect(result[1].name).toBe("新規ユーザー");
                expect(result[1].email).toBe("newuser@example.com");
                expect(typeof result[1].id).toBe("number");
            }
        });

        test('ユーザー作成バリデーションエラー', async () => {
            const invalidData = { name: "", email: "invalid-email" };
            const result = await ApiService.createUser(invalidData);
            expect(result[0]).toBe(false);
            if (!result[0]) {
                expect(result[1]).toContain("バリデーションエラー");
            }
        });

        test('API結果ハンドリング', () => {
            const successResult: [true, { id: number; name: string }] = [true, { id: 1, name: "テスト" }];
            const errorResult: [false, string] = [false, "エラーメッセージ"];
            
            let successCalled = false;
            let errorCalled = false;
            
            ApiService.handleApiResult(
                successResult,
                () => { successCalled = true; },
                () => { errorCalled = true; }
            );
            
            expect(successCalled).toBe(true);
            expect(errorCalled).toBe(false);
            
            successCalled = false;
            errorCalled = false;
            
            ApiService.handleApiResult(
                errorResult,
                () => { successCalled = true; },
                () => { errorCalled = true; }
            );
            
            expect(successCalled).toBe(false);
            expect(errorCalled).toBe(true);
        });
    });

    describe('ファイル処理とパース', () => {
        test('CSV解析成功', () => {
            const csvContent = `name,age,city
田中太郎,30,東京
佐藤花子,25,大阪`;
            
            const result = FileParser.parseCSV(csvContent);
            expect(result[0]).toBe(true);
            if (result[0]) {
                expect(result[1]).toHaveLength(3);
                expect(result[1][0]).toEqual(["name", "age", "city"]);
                expect(result[1][1]).toEqual(["田中太郎", "30", "東京"]);
            }
        });

        test('CSV解析失敗', () => {
            const emptyLine = "name,age\n\n,city";
            const result = FileParser.parseCSV(emptyLine);
            expect(result[0]).toBe(false);
            if (!result[0]) {
                expect(result[1]).toBe("空の行があります");
                expect(result[2]).toBe(2); // 行番号
            }
        });

        test('ログ解析成功', () => {
            const logContent = `2023-12-01T10:00:00.000Z [INFO] テストメッセージ
2023-12-01T10:01:00.000Z [ERROR] エラーメッセージ {"code": 500}`;
            
            const result = FileParser.parseLogFile(logContent);
            expect(result[0]).toBe(true);
            if (result[0]) {
                expect(result[1]).toHaveLength(2);
                
                const [timestamp1, level1, message1] = result[1][0];
                expect(level1).toBe('INFO');
                expect(message1).toBe('テストメッセージ');
                expect(timestamp1).toBeInstanceOf(Date);
                
                const [timestamp2, level2, message2, context2] = result[1][1];
                expect(level2).toBe('ERROR');
                expect(message2).toBe('エラーメッセージ');
                expect(context2).toEqual({ code: 500 });
            }
        });

        test('ログ解析失敗', () => {
            const invalidLog = "invalid log format";
            const result = FileParser.parseLogFile(invalidLog);
            expect(result[0]).toBe(false);
            if (!result[0]) {
                expect(result[1]).toBe("無効なログ形式です");
                expect(result[2]).toBe(1);
            }
        });

        test('ログフィルタリング', () => {
            const logs: [Date, 'INFO' | 'ERROR', string][] = [
                [new Date(), 'INFO', 'info message'],
                [new Date(), 'ERROR', 'error message'],
                [new Date(), 'INFO', 'another info']
            ];
            
            const errorLogs = FileParser.filterLogsByLevel(logs, 'ERROR');
            expect(errorLogs).toHaveLength(1);
            expect(errorLogs[0][1]).toBe('ERROR');
        });

        test('ログ統計', () => {
            const logs: [Date, 'INFO' | 'ERROR', string][] = [
                [new Date('2023-01-01'), 'INFO', 'message 1'],
                [new Date('2023-01-02'), 'ERROR', 'message 2'],
                [new Date('2023-01-03'), 'INFO', 'message 3']
            ];
            
            const stats = FileParser.getLogStatistics(logs);
            expect(stats.total).toBe(3);
            expect(stats.byLevel['INFO']).toBe(2);
            expect(stats.byLevel['ERROR']).toBe(1);
            expect(stats.timeRange).not.toBeNull();
            if (stats.timeRange) {
                expect(stats.timeRange[0]).toEqual(new Date('2023-01-01'));
                expect(stats.timeRange[1]).toEqual(new Date('2023-01-03'));
            }
        });

        test('空ログの統計', () => {
            const stats = FileParser.getLogStatistics([]);
            expect(stats.total).toBe(0);
            expect(stats.byLevel).toEqual({});
            expect(stats.timeRange).toBeNull();
        });
    });

    describe('ユーティリティ関数', () => {
        test('API設定の生成', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            createApiClient(["https://api.example.com", 5000]);
            expect(consoleSpy).toHaveBeenCalledWith("接続先: https://api.example.com, タイムアウト: 5000ms, SSL: 有効");
            
            createApiClient(["http://api.example.com", 3000, false]);
            expect(consoleSpy).toHaveBeenCalledWith("接続先: http://api.example.com, タイムアウト: 3000ms, SSL: 無効");
            
            consoleSpy.mockRestore();
        });

        test('コマンド処理', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            processCommand(["git", "commit", "-m", "test"]);
            expect(consoleSpy).toHaveBeenCalledWith("コマンド: git, 引数: [commit, -m, test]");
            
            processCommand(["ls"]);
            expect(consoleSpy).toHaveBeenCalledWith("コマンド: ls, 引数: []");
            
            consoleSpy.mockRestore();
        });

        test('ヘッダー付きデータのフォーマット', () => {
            expect(formatDataWithHeader(["売上", 100, 200, 300])).toBe("売上: [100, 200, 300]");
            expect(formatDataWithHeader(["ユーザー", "田中", "佐藤"])).toBe("ユーザー: [田中, 佐藤]");
        });
    });

    describe('演習問題の解答', () => {
        test('タプルの入れ替え', () => {
            expect(swapTuple([1, "hello"])).toEqual(["hello", 1]);
            expect(swapTuple(["a", 2])).toEqual([2, "a"]);
            expect(swapTuple([true, false])).toEqual([false, true]);
        });

        test('2Dから3Dへの変換', () => {
            expect(addThree([10, 20])).toEqual([10, 20, 0]);
            expect(addThree([-5, 15])).toEqual([-5, 15, 0]);
            expect(addThree([0, 0])).toEqual([0, 0, 0]);
        });

        test('名前と年齢のパース', () => {
            expect(parseNameAge("田中太郎,30")).toEqual(["田中太郎", 30]);
            expect(parseNameAge("佐藤花子,25")).toEqual(["佐藤花子", 25]);
            expect(parseNameAge(" 鈴木一郎 , 35 ")).toEqual(["鈴木一郎", 35]);
            
            expect(parseNameAge("無効な形式")).toBeNull();
            expect(parseNameAge("名前,abc")).toBeNull();
            expect(parseNameAge(",30")).toBeNull();
            expect(parseNameAge("名前")).toBeNull();
        });

        test('配列のzip', () => {
            expect(zipArrays([1, 2, 3], ["a", "b"])).toEqual([[1, "a"], [2, "b"]]);
            expect(zipArrays(["x", "y"], [10, 20, 30])).toEqual([["x", 10], ["y", 20]]);
            expect(zipArrays([], [1, 2, 3])).toEqual([]);
            expect(zipArrays([1, 2, 3], [])).toEqual([]);
            expect(zipArrays(["a"], [1])).toEqual([["a", 1]]);
        });

        test('最初と最後の要素', () => {
            expect(getFirstLast([1, 2, 3, 4])).toEqual([1, 4]);
            expect(getFirstLast(["a", "b", "c"])).toEqual(["a", "c"]);
            expect(getFirstLast([1, 2])).toEqual([1, 2]);
            
            expect(getFirstLast([1])).toBeNull();
            expect(getFirstLast([])).toBeNull();
        });
    });
});