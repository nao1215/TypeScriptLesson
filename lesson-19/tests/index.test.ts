/**
 * Lesson 19: ユニオン型 - テストコード
 */

import {
    ApiResult,
    isSuccess,
    extractData,
    getErrorMessage,
    Square,
    Circle,
    Rectangle,
    Shape,
    calculateArea,
    describeShape,
    ClickEvent,
    KeyEvent,
    NetworkEvent,
    AppEvent,
    processEvent,
    isClickEvent,
    TextData,
    JsonData,
    BinaryData,
    DataFormat,
    getDataSize,
    serializeData,
    getDataMetadata
} from '../src/solution';

describe('Lesson 19: ユニオン型', () => {
    describe('APIレスポンス処理システム', () => {
        const successResult: ApiResult<{ id: number; name: string }> = {
            success: true,
            data: { id: 1, name: "Alice" }
        };

        const errorResult: ApiResult<any> = {
            success: false,
            error: "User not found",
            statusCode: 404
        };

        test('isSuccess: 成功レスポンスを正しく判定', () => {
            expect(isSuccess(successResult)).toBe(true);
            expect(isSuccess(errorResult)).toBe(false);
        });

        test('extractData: 成功時はデータを返す', () => {
            const data = extractData(successResult);
            expect(data).toEqual({ id: 1, name: "Alice" });
        });

        test('extractData: 失敗時はnullを返す', () => {
            const data = extractData(errorResult);
            expect(data).toBeNull();
        });

        test('getErrorMessage: 成功時はnullを返す', () => {
            const error = getErrorMessage(successResult);
            expect(error).toBeNull();
        });

        test('getErrorMessage: 失敗時はエラーメッセージを返す', () => {
            const error = getErrorMessage(errorResult);
            expect(error).toBe("User not found");
        });
    });

    describe('図形面積計算システム', () => {
        const square: Square = { type: "square", side: 5 };
        const circle: Circle = { type: "circle", radius: 3 };
        const rectangle: Rectangle = { type: "rectangle", width: 4, height: 6 };

        test('calculateArea: 正方形の面積計算', () => {
            expect(calculateArea(square)).toBe(25);
        });

        test('calculateArea: 円の面積計算', () => {
            const area = calculateArea(circle);
            expect(area).toBeCloseTo(Math.PI * 9, 2);
        });

        test('calculateArea: 長方形の面積計算', () => {
            expect(calculateArea(rectangle)).toBe(24);
        });

        test('describeShape: 正方形の説明', () => {
            const description = describeShape(square);
            expect(description).toContain("Square with side 5");
            expect(description).toContain("Area = 25.00");
        });

        test('describeShape: 円の説明', () => {
            const description = describeShape(circle);
            expect(description).toContain("Circle with radius 3");
            expect(description).toContain("Area =");
        });

        test('describeShape: 長方形の説明', () => {
            const description = describeShape(rectangle);
            expect(description).toContain("Rectangle with width 4 and height 6");
            expect(description).toContain("Area = 24.00");
        });
    });

    describe('イベント処理システム', () => {
        const clickEvent: ClickEvent = {
            type: "click",
            element: "button",
            position: { x: 100, y: 200 }
        };

        const keyEvent: KeyEvent = {
            type: "key",
            key: "Enter",
            isPressed: true
        };

        const networkEvent: NetworkEvent = {
            type: "network",
            url: "/api/users",
            status: "success"
        };

        test('processEvent: クリックイベント処理', () => {
            const result = processEvent(clickEvent);
            expect(result).toBe("Click on button at (100, 200)");
        });

        test('processEvent: キーイベント処理(押下)', () => {
            const result = processEvent(keyEvent);
            expect(result).toBe("Key 'Enter' pressed");
        });

        test('processEvent: キーイベント処理(リリース)', () => {
            const releaseEvent: KeyEvent = { ...keyEvent, isPressed: false };
            const result = processEvent(releaseEvent);
            expect(result).toBe("Key 'Enter' released");
        });

        test('processEvent: ネットワークイベント処理', () => {
            const result = processEvent(networkEvent);
            expect(result).toBe("Network request to /api/users: success");
        });

        test('isClickEvent: クリックイベントを正しく判定', () => {
            expect(isClickEvent(clickEvent)).toBe(true);
            expect(isClickEvent(keyEvent)).toBe(false);
            expect(isClickEvent(networkEvent)).toBe(false);
        });
    });

    describe('データ変換システム', () => {
        const textData: TextData = {
            format: "text",
            content: "Hello World",
            encoding: "utf-8"
        };

        const jsonData: JsonData = {
            format: "json",
            data: { name: "Alice", age: 25 },
            schema: "user-schema"
        };

        const binaryData: BinaryData = {
            format: "binary",
            buffer: new ArrayBuffer(1024),
            mimeType: "image/jpeg"
        };

        test('getDataSize: テキストデータのサイズ', () => {
            expect(getDataSize(textData)).toBe(11); // "Hello World".length
        });

        test('getDataSize: JSONデータのサイズ', () => {
            const jsonString = JSON.stringify(jsonData.data);
            expect(getDataSize(jsonData)).toBe(jsonString.length);
        });

        test('getDataSize: バイナリデータのサイズ', () => {
            expect(getDataSize(binaryData)).toBe(1024);
        });

        test('serializeData: テキストデータのシリアライズ', () => {
            expect(serializeData(textData)).toBe("Hello World");
        });

        test('serializeData: JSONデータのシリアライズ', () => {
            const expected = JSON.stringify(jsonData.data);
            expect(serializeData(jsonData)).toBe(expected);
        });

        test('serializeData: バイナリデータのシリアライズ', () => {
            const result = serializeData(binaryData);
            expect(result).toBe("[Binary data: image/jpeg, 1024 bytes]");
        });

        test('getDataMetadata: テキストデータのメタ情報', () => {
            const metadata = getDataMetadata(textData);
            expect(metadata).toEqual({
                format: "text",
                size: 11,
                additionalInfo: "utf-8"
            });
        });

        test('getDataMetadata: JSONデータのメタ情報', () => {
            const metadata = getDataMetadata(jsonData);
            expect(metadata.format).toBe("json");
            expect(metadata.additionalInfo).toBe("user-schema");
            expect(typeof metadata.size).toBe("number");
        });

        test('getDataMetadata: バイナリデータのメタ情報', () => {
            const metadata = getDataMetadata(binaryData);
            expect(metadata).toEqual({
                format: "binary",
                size: 1024,
                additionalInfo: "image/jpeg"
            });
        });

        test('getDataMetadata: オプショナルフィールドのデフォルト値', () => {
            const textWithoutEncoding: TextData = {
                format: "text",
                content: "Hello"
            };
            
            const metadata = getDataMetadata(textWithoutEncoding);
            expect(metadata.additionalInfo).toBe("utf-8");
        });
    });
});
