/**
 * Lesson 20: 型アサーション - 解答例
 */

/**
 * 演習1: API データ処理システム
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

export function parseUserProfile(jsonString: string): UserProfile {
    return JSON.parse(jsonString) as UserProfile;
}

export function convertToPostData(data: unknown): PostData | null {
    if (
        data &&
        typeof data === "object" &&
        "id" in data &&
        "title" in data &&
        "content" in data &&
        "authorId" in data &&
        "createdAt" in data &&
        typeof (data as any).id === "number" &&
        typeof (data as any).title === "string" &&
        typeof (data as any).content === "string" &&
        typeof (data as any).authorId === "number" &&
        typeof (data as any).createdAt === "string"
    ) {
        return data as PostData;
    }
    return null;
}

export function mergeUserProfile(
    partialData: Partial<UserProfile>,
    defaults: UserProfile
): UserProfile {
    return { ...defaults, ...partialData } as UserProfile;
}

/**
 * 演習2: DOM 操作ユーティリティ
 */
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

export function setInputValue(selector: string, value: string): boolean {
    const element = mockQuerySelector(selector);
    if (element) {
        const inputElement = element as MockHTMLInputElement;
        inputElement.value = value;
        return true;
    }
    return false;
}

export function toggleButtonDisabled(selector: string, disabled: boolean): boolean {
    const element = mockQuerySelector(selector);
    if (element) {
        const buttonElement = element as MockHTMLButtonElement;
        buttonElement.disabled = disabled;
        return true;
    }
    return false;
}

export function getSelectedOption(selector: string): string | null {
    const element = mockQuerySelector(selector);
    if (element) {
        const selectElement = element as MockHTMLSelectElement;
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        return selectedOption ? selectedOption.text : null;
    }
    return null;
}

/**
 * 演習3: ユニオン型からの型アサーション
 */
type MediaFile = 
    | { type: "image"; url: string; width: number; height: number; alt?: string }
    | { type: "video"; url: string; duration: number; thumbnail?: string }
    | { type: "audio"; url: string; duration: number; title?: string; artist?: string }
    | { type: "document"; url: string; filename: string; size: number };

export function getMediaDimensions(media: MediaFile): string {
    switch (media.type) {
        case "image":
            const imageMedia = media as Extract<MediaFile, { type: "image" }>;
            return `${imageMedia.width} x ${imageMedia.height} pixels`;
        case "video":
            const videoMedia = media as Extract<MediaFile, { type: "video" }>;
            return `${videoMedia.duration} seconds`;
        case "audio":
            const audioMedia = media as Extract<MediaFile, { type: "audio" }>;
            return `${audioMedia.duration} seconds`;
        case "document":
            const documentMedia = media as Extract<MediaFile, { type: "document" }>;
            return `${documentMedia.size} bytes`;
    }
}

export function forceAsImage(media: MediaFile): string {
    const imageMedia = media as { type: "image"; url: string; width: number; height: number; alt?: string };
    return imageMedia.alt || "No alt text";
}

export function safeAsImage(media: MediaFile): string | null {
    if (media.type === "image") {
        const imageMedia = media as Extract<MediaFile, { type: "image" }>;
        return imageMedia.alt || "No alt text";
    }
    return null;
}

/**
 * 演習4: const アサーションと設定管理
 */
export function createThemeConfig() {
    return {
        colors: {
            primary: "#007bff",
            secondary: "#6c757d",
            success: "#28a745"
        },
        fonts: {
            primary: "Arial, sans-serif",
            monospace: "Courier New, monospace"
        },
        sizes: {
            small: "12px",
            medium: "16px",
            large: "20px"
        }
    } as const;
}

export function createApiConfig() {
    return {
        baseUrl: "https://api.example.com",
        version: "v1",
        endpoints: {
            users: "/users",
            posts: "/posts",
            comments: "/comments"
        },
        timeout: 5000
    } as const;
}

export function getThemeColor(
    config: ReturnType<typeof createThemeConfig>,
    colorKey: keyof ReturnType<typeof createThemeConfig>['colors']
): string {
    return config.colors[colorKey];
}