/**
 * Lesson 19: ユニオン型 - 解答例
 */

/**
 * 演習1: APIレスポンス処理システム
 */
export type ApiResult<T> = 
    | { success: true; data: T }
    | { success: false; error: string; statusCode: number };

export function isSuccess<T>(result: ApiResult<T>): result is { success: true; data: T } {
    return result.success;
}

export function extractData<T>(result: ApiResult<T>): T | null {
    return isSuccess(result) ? result.data : null;
}

export function getErrorMessage<T>(result: ApiResult<T>): string | null {
    return isSuccess(result) ? null : result.error;
}

/**
 * 演習2: 図形面積計算システム
 */
export interface Square {
    type: "square";
    side: number;
}

export interface Circle {
    type: "circle";
    radius: number;
}

export interface Rectangle {
    type: "rectangle";
    width: number;
    height: number;
}

export type Shape = Square | Circle | Rectangle;

export function calculateArea(shape: Shape): number {
    switch (shape.type) {
        case "square":
            return shape.side ** 2;
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
    }
}

export function describeShape(shape: Shape): string {
    const area = calculateArea(shape).toFixed(2);
    
    switch (shape.type) {
        case "square":
            return `Square with side ${shape.side}: Area = ${area}`;
        case "circle":
            return `Circle with radius ${shape.radius}: Area = ${area}`;
        case "rectangle":
            return `Rectangle with width ${shape.width} and height ${shape.height}: Area = ${area}`;
    }
}

/**
 * 演習3: イベント処理システム
 */
export interface ClickEvent {
    type: "click";
    element: string;
    position: { x: number; y: number };
}

export interface KeyEvent {
    type: "key";
    key: string;
    isPressed: boolean;
}

export interface NetworkEvent {
    type: "network";
    url: string;
    status: "pending" | "success" | "error";
}

export type AppEvent = ClickEvent | KeyEvent | NetworkEvent;

export function processEvent(event: AppEvent): string {
    switch (event.type) {
        case "click":
            return `Click on ${event.element} at (${event.position.x}, ${event.position.y})`;
        case "key":
            const action = event.isPressed ? "pressed" : "released";
            return `Key '${event.key}' ${action}`;
        case "network":
            return `Network request to ${event.url}: ${event.status}`;
    }
}

export function isClickEvent(event: AppEvent): event is ClickEvent {
    return event.type === "click";
}

/**
 * 演習4: データ変換システム
 */
export interface TextData {
    format: "text";
    content: string;
    encoding?: "utf-8" | "ascii";
}

export interface JsonData {
    format: "json";
    data: object;
    schema?: string;
}

export interface BinaryData {
    format: "binary";
    buffer: ArrayBuffer;
    mimeType?: string;
}

export type DataFormat = TextData | JsonData | BinaryData;

export function getDataSize(data: DataFormat): number {
    switch (data.format) {
        case "text":
            return data.content.length;
        case "json":
            return JSON.stringify(data.data).length;
        case "binary":
            return data.buffer.byteLength;
    }
}

export function serializeData(data: DataFormat): string {
    switch (data.format) {
        case "text":
            return data.content;
        case "json":
            return JSON.stringify(data.data);
        case "binary":
            const mimeType = data.mimeType || "unknown";
            const size = data.buffer.byteLength;
            return `[Binary data: ${mimeType}, ${size} bytes]`;
    }
}

export function getDataMetadata(data: DataFormat): {
    format: string;
    size: number;
    additionalInfo?: string;
} {
    const base = {
        format: data.format,
        size: getDataSize(data)
    };
    
    switch (data.format) {
        case "text":
            return {
                ...base,
                additionalInfo: data.encoding || "utf-8"
            };
        case "json":
            return {
                ...base,
                additionalInfo: data.schema || "no schema"
            };
        case "binary":
            return {
                ...base,
                additionalInfo: data.mimeType || "unknown mime type"
            };
    }
}