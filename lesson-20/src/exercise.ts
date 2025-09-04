/**
 * Lesson 20: 型アサーション - 演習問題
 * 
 * 以下の関数を実装してください。
 * 型アサーションを適切に使用してください。
 */

/**
 * 演習1: API データ処理システム
 * API レスポンスのデータを適切な型にアサートして処理するシステムを実装してください。
 */

interface UserProfile {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

interface PostData {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: string;
}

/**
 * JSON文字列をパースしてUserProfile型として返す関数
 * @param jsonString - JSON文字列
 * @returns UserProfileオブジェクト
 */
export function parseUserProfile(jsonString: string): UserProfile {
    // TODO: ここに実装してください
    // JSON.parseした結果をUserProfile型としてアサートしてください
}

/**
 * unknown型のデータをPostData型に変換する関数
 * @param data - unknown型のデータ
 * @returns PostDataオブジェクトまたはnull（変換できない場合）
 */
export function convertToPostData(data: unknown): PostData | null {
    // TODO: ここに実装してください
    // まず基本的な型チェックを行い、有効な場合はPostData型としてアサートしてください
}

/**
 * 部分的なユーザーデータを受け取り、完全なユーザープロフィールを作成する関数
 * @param partialData - 部分的なユーザーデータ
 * @param defaults - デフォルト値
 * @returns 完全なUserProfile
 */
export function mergeUserProfile(
    partialData: Partial<UserProfile>,
    defaults: UserProfile
): UserProfile {
    // TODO: ここに実装してください
    // partialDataとdefaultsをマージして、UserProfile型として返してください
}

/**
 * 演習2: DOM 操作ユーティリティ
 * DOM 要素の操作で型アサーションを活用したユーティリティ関数を実装してください。
 */

// モックインターフェース（テスト用）
interface MockHTMLElement {
    tagName: string;
    textContent?: string;
    style?: { [key: string]: string };
}

interface MockHTMLInputElement extends MockHTMLElement {
    value: string;
    disabled: boolean;
    type: string;
}

interface MockHTMLButtonElement extends MockHTMLElement {
    disabled: boolean;
    onclick?: () => void;
}

interface MockHTMLSelectElement extends MockHTMLElement {
    value: string;
    selectedIndex: number;
    options: { text: string; value: string }[];
}

/**
 * 汎用的な要素取得関数（モック版）
 * @param selector - セレクタ文字列
 * @returns モック要素またはnull
 */
function mockQuerySelector(selector: string): MockHTMLElement | null {
    const mockElements: Record<string, MockHTMLElement> = {
        "#textInput": { tagName: "INPUT", value: "initial", disabled: false, type: "text" } as MockHTMLInputElement,
        "#submitButton": { tagName: "BUTTON", disabled: false } as MockHTMLButtonElement,
        "#selectDropdown": { 
            tagName: "SELECT", 
            value: "option1", 
            selectedIndex: 0,
            options: [
                { text: "Option 1", value: "option1" },
                { text: "Option 2", value: "option2" }
            ]
        } as MockHTMLSelectElement,
        ".content": { tagName: "DIV", textContent: "Hello World" }
    };
    return mockElements[selector] || null;
}

/**
 * テキスト入力欄の値を設定する関数
 * @param selector - 入力欄のセレクタ
 * @param value - 設定する値
 * @returns 成功した場合true
 */
export function setInputValue(selector: string, value: string): boolean {
    // TODO: ここに実装してください
    // mockQuerySelectorで要素を取得し、MockHTMLInputElement型としてアサートしてください
    // 要素が存在する場合はvalueを設定してtrue、そうでなければfalseを返してください
}

/**
 * ボタンの無効化状態を切り替える関数
 * @param selector - ボタンのセレクタ
 * @param disabled - 無効化するかどうか
 * @returns 成功した場合true
 */
export function toggleButtonDisabled(selector: string, disabled: boolean): boolean {
    // TODO: ここに実装してください
    // MockHTMLButtonElement型としてアサートしてください
}

/**
 * セレクトボックスの選択されたオプションを取得する関数
 * @param selector - セレクトボックスのセレクタ
 * @returns 選択されたオプションのテキストまたはnull
 */
export function getSelectedOption(selector: string): string | null {
    // TODO: ここに実装してください
    // MockHTMLSelectElement型としてアサートし、selectedIndexを使用してオプションを取得してください
}

/**
 * 演習3: ユニオン型からの型アサーション
 * ユニオン型から特定の型へのアサーションを使用したデータ処理を実装してください。
 */

type MediaFile = 
    | { type: "image"; url: string; width: number; height: number; alt?: string }
    | { type: "video"; url: string; duration: number; thumbnail?: string }
    | { type: "audio"; url: string; duration: number; title?: string; artist?: string }
    | { type: "document"; url: string; filename: string; size: number };

/**
 * メディアファイルのサイズ情報を取得する関数
 * @param media - メディアファイル
 * @returns サイズ情報文字列
 */
export function getMediaDimensions(media: MediaFile): string {
    // TODO: ここに実装してください
    // メディアタイプによって適切なアサーションを行い、サイズ情報を返してください
    // image: "width x height pixels"
    // video: "duration seconds"
    // audio: "duration seconds"
    // document: "size bytes"
}

/**
 * 任意のメディアファイルをイメージとして扱う関数（非安全）
 * @param media - メディアファイル
 * @returns イメージのaltテキスト
 */
export function forceAsImage(media: MediaFile): string {
    // TODO: ここに実装してください
    // 危険: 任意のメディアファイルをimage型としてアサートし、altプロパティを返してください
    // altが存在しない場合は「No alt text」を返してください
}

/**
 * メディアファイルがイメージかどうかを安全にチェックしてアサートする関数
 * @param media - メディアファイル
 * @returns イメージの場合はaltテキスト、そうでなければnull
 */
export function safeAsImage(media: MediaFile): string | null {
    // TODO: ここに実装してください
    // まずメディアのタイプが"image"かどうかをチェックし、
    // イメージの場合のみアサートしてaltテキストを返してください
}

/**
 * 演習4: const アサーションと設定管理
 * const アサーションを使用した設定オブジェクトの定義と操作を実装してください。
 */

/**
 * アプリケーションのテーマ設定を作成する関数
 * @returns テーマ設定オブジェクト
 */
export function createThemeConfig() {
    // TODO: ここに実装してください
    // 以下のプロパティを持つオブジェクトを as const でアサートして返してください
    // colors: { primary: "#007bff", secondary: "#6c757d", success: "#28a745" }
    // fonts: { primary: "Arial, sans-serif", monospace: "Courier New, monospace" }
    // sizes: { small: "12px", medium: "16px", large: "20px" }
}

/**
 * APIエンドポイント設定を作成する関数
 * @returns APIエンドポイント設定オブジェクト
 */
export function createApiConfig() {
    // TODO: ここに実装してください
    // 以下の構造で as const アサーションを使用してください
    // baseUrl: "https://api.example.com"
    // version: "v1"
    // endpoints: { users: "/users", posts: "/posts", comments: "/comments" }
    // timeout: 5000
}

/**
 * 設定オブジェクトから特定の値を取得する関数
 * @param config - createThemeConfig()の結果
 * @param colorKey - 取得したいカラーのキー
 * @returns カラー値
 */
export function getThemeColor(
    config: ReturnType<typeof createThemeConfig>,
    colorKey: keyof ReturnType<typeof createThemeConfig>['colors']
): string {
    // TODO: ここに実装してください
    // config.colorsから指定されたキーの値を返してください
}