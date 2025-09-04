/**
 * Lesson 20: 型アサーション - テストコード
 */

import {
    parseUserProfile,
    convertToPostData,
    mergeUserProfile,
    setInputValue,
    toggleButtonDisabled,
    getSelectedOption,
    getMediaDimensions,
    forceAsImage,
    safeAsImage,
    createThemeConfig,
    createApiConfig,
    getThemeColor
} from '../src/solution';

describe('Lesson 20: 型アサーション', () => {
    describe('API データ処理システム', () => {
        test('parseUserProfile: JSON文字列をUserProfile型にパース', () => {
            const jsonString = JSON.stringify({
                id: 1,
                username: "alice",
                email: "alice@example.com",
                firstName: "Alice",
                lastName: "Smith"
            });
            
            const result = parseUserProfile(jsonString);
            
            expect(result.id).toBe(1);
            expect(result.username).toBe("alice");
            expect(result.email).toBe("alice@example.com");
            expect(result.firstName).toBe("Alice");
            expect(result.lastName).toBe("Smith");
        });

        test('convertToPostData: 有効なデータをPostData型に変換', () => {
            const validData = {
                id: 1,
                title: "Test Post",
                content: "This is a test post",
                authorId: 123,
                createdAt: "2023-01-01T00:00:00Z"
            };
            
            const result = convertToPostData(validData);
            
            expect(result).not.toBeNull();
            expect(result!.id).toBe(1);
            expect(result!.title).toBe("Test Post");
        });

        test('convertToPostData: 無効なデータはnullを返す', () => {
            const invalidData = {
                id: "invalid", // 数値ではない
                title: "Test Post"
            };
            
            const result = convertToPostData(invalidData);
            expect(result).toBeNull();
        });

        test('convertToPostData: nullやundefinedはnullを返す', () => {
            expect(convertToPostData(null)).toBeNull();
            expect(convertToPostData(undefined)).toBeNull();
            expect(convertToPostData("string")).toBeNull();
        });

        test('mergeUserProfile: 部分データとデフォルト値をマージ', () => {
            const defaults = {
                id: 0,
                username: "default",
                email: "default@example.com",
                firstName: "Default",
                lastName: "User"
            };
            
            const partialData = {
                id: 1,
                username: "alice"
            };
            
            const result = mergeUserProfile(partialData, defaults);
            
            expect(result.id).toBe(1);
            expect(result.username).toBe("alice");
            expect(result.email).toBe("default@example.com"); // デフォルト値
            expect(result.firstName).toBe("Default"); // デフォルト値
        });
    });

    describe('DOM 操作ユーティリティ', () => {
        test('setInputValue: 入力欄の値を設定', () => {
            const result = setInputValue("#textInput", "new value");
            expect(result).toBe(true);
        });

        test('setInputValue: 存在しない要素はfalseを返す', () => {
            const result = setInputValue("#nonexistent", "value");
            expect(result).toBe(false);
        });

        test('toggleButtonDisabled: ボタンの無効化状態を変更', () => {
            const result = toggleButtonDisabled("#submitButton", true);
            expect(result).toBe(true);
        });

        test('toggleButtonDisabled: 存在しないボタンはfalseを返す', () => {
            const result = toggleButtonDisabled("#nonexistent", true);
            expect(result).toBe(false);
        });

        test('getSelectedOption: 選択されたオプションを取得', () => {
            const result = getSelectedOption("#selectDropdown");
            expect(result).toBe("Option 1");
        });

        test('getSelectedOption: 存在しない要素はnullを返す', () => {
            const result = getSelectedOption("#nonexistent");
            expect(result).toBeNull();
        });
    });

    describe('ユニオン型からの型アサーション', () => {
        const imageFile = {
            type: "image" as const,
            url: "https://example.com/image.jpg",
            width: 800,
            height: 600,
            alt: "Test image"
        };

        const videoFile = {
            type: "video" as const,
            url: "https://example.com/video.mp4",
            duration: 120,
            thumbnail: "thumb.jpg"
        };

        const audioFile = {
            type: "audio" as const,
            url: "https://example.com/audio.mp3",
            duration: 180,
            title: "Test Song",
            artist: "Test Artist"
        };

        const documentFile = {
            type: "document" as const,
            url: "https://example.com/doc.pdf",
            filename: "document.pdf",
            size: 1024000
        };

        test('getMediaDimensions: イメージのサイズ情報', () => {
            const result = getMediaDimensions(imageFile);
            expect(result).toBe("800 x 600 pixels");
        });

        test('getMediaDimensions: ビデオの長さ', () => {
            const result = getMediaDimensions(videoFile);
            expect(result).toBe("120 seconds");
        });

        test('getMediaDimensions: オーディオの長さ', () => {
            const result = getMediaDimensions(audioFile);
            expect(result).toBe("180 seconds");
        });

        test('getMediaDimensions: ドキュメントのサイズ', () => {
            const result = getMediaDimensions(documentFile);
            expect(result).toBe("1024000 bytes");
        });

        test('forceAsImage: 任意のメディアをイメージとして扱う(非安全)', () => {
            const result = forceAsImage(imageFile);
            expect(result).toBe("Test image");
        });

        test('forceAsImage: altがない場合のデフォルト値', () => {
            const imageWithoutAlt = { ...imageFile };
            delete (imageWithoutAlt as any).alt;
            const result = forceAsImage(imageWithoutAlt);
            expect(result).toBe("No alt text");
        });

        test('safeAsImage: イメージの場合はaltテキストを返す', () => {
            const result = safeAsImage(imageFile);
            expect(result).toBe("Test image");
        });

        test('safeAsImage: イメージ以外の場合はnullを返す', () => {
            expect(safeAsImage(videoFile)).toBeNull();
            expect(safeAsImage(audioFile)).toBeNull();
            expect(safeAsImage(documentFile)).toBeNull();
        });

        test('safeAsImage: イメージでaltがない場合', () => {
            const imageWithoutAlt = { ...imageFile };
            delete (imageWithoutAlt as any).alt;
            const result = safeAsImage(imageWithoutAlt);
            expect(result).toBe("No alt text");
        });
    });

    describe('const アサーションと設定管理', () => {
        test('createThemeConfig: テーマ設定を作成', () => {
            const config = createThemeConfig();
            
            expect(config.colors.primary).toBe("#007bff");
            expect(config.colors.secondary).toBe("#6c757d");
            expect(config.colors.success).toBe("#28a745");
            expect(config.fonts.primary).toBe("Arial, sans-serif");
            expect(config.fonts.monospace).toBe("Courier New, monospace");
            expect(config.sizes.small).toBe("12px");
            expect(config.sizes.medium).toBe("16px");
            expect(config.sizes.large).toBe("20px");
        });

        test('createApiConfig: API設定を作成', () => {
            const config = createApiConfig();
            
            expect(config.baseUrl).toBe("https://api.example.com");
            expect(config.version).toBe("v1");
            expect(config.endpoints.users).toBe("/users");
            expect(config.endpoints.posts).toBe("/posts");
            expect(config.endpoints.comments).toBe("/comments");
            expect(config.timeout).toBe(5000);
        });

        test('getThemeColor: テーマ設定からカラーを取得', () => {
            const config = createThemeConfig();
            
            expect(getThemeColor(config, "primary")).toBe("#007bff");
            expect(getThemeColor(config, "secondary")).toBe("#6c757d");
            expect(getThemeColor(config, "success")).toBe("#28a745");
        });

        test('型安全性: createThemeConfigの戻り値は読み取り専用', () => {
            const config = createThemeConfig();
            
            // コンパイル時にエラーになるべき操作（コメントアウト）
            // config.colors.primary = "#ff0000"; // Error: Cannot assign to 'primary' because it is a read-only property
            
            // 型レベルでのチェックはランタイムテストでは検証できないため、
            // 値が正しく設定されていることを確認
            expect(typeof config.colors.primary).toBe("string");
        });

        test('型安全性: createApiConfigの戻り値は読み取り専用', () => {
            const config = createApiConfig();
            
            // コンパイル時にエラーになるべき操作（コメントアウト）
            // config.baseUrl = "https://other.api.com"; // Error: Cannot assign to 'baseUrl' because it is a read-only property
            
            expect(typeof config.baseUrl).toBe("string");
            expect(typeof config.timeout).toBe("number");
        });
    });
});
