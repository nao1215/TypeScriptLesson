/**
 * Lesson 18: リテラル型 - 解答例
 */

/**
 * 演習1: スケジュール管理システム
 */
export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type TimeSlot = "morning" | "afternoon" | "evening";

export type ScheduleEntry = {
    day: Weekday;
    timeSlot: TimeSlot;
    activity: string;
};

export function isWeekday(day: Weekday): boolean {
    const weekdays: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    return weekdays.includes(day);
}

export function createScheduleEntry(day: Weekday, timeSlot: TimeSlot, activity: string): ScheduleEntry {
    return { day, timeSlot, activity };
}

export function getScheduleByDay(schedule: ScheduleEntry[], day: Weekday): ScheduleEntry[] {
    return schedule.filter(entry => entry.day === day);
}

/**
 * 演習2: HTTP ステータス管理システム
 */
export type SuccessStatus = 200 | 201 | 204;
export type ClientErrorStatus = 400 | 401 | 403 | 404;
export type ServerErrorStatus = 500 | 502 | 503;
export type HttpStatus = SuccessStatus | ClientErrorStatus | ServerErrorStatus;

export function getStatusMessage(status: HttpStatus): string {
    switch (status) {
        case 200: return "OK";
        case 201: return "Created";
        case 204: return "No Content";
        case 400: return "Bad Request";
        case 401: return "Unauthorized";
        case 403: return "Forbidden";
        case 404: return "Not Found";
        case 500: return "Internal Server Error";
        case 502: return "Bad Gateway";
        case 503: return "Service Unavailable";
    }
}

export function getStatusType(status: HttpStatus): "success" | "client_error" | "server_error" {
    if (status >= 200 && status < 300) {
        return "success";
    } else if (status >= 400 && status < 500) {
        return "client_error";
    } else {
        return "server_error";
    }
}

/**
 * 演習3: CSS クラス名生成システム
 */
export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Color = "primary" | "secondary" | "success" | "danger" | "warning";
export type Component = "btn" | "card" | "modal" | "alert";
export type ButtonClass = `btn-${Size}-${Color}`;
export type StateModifier = "hover" | "active" | "disabled" | "focus";
export type ModifiedButtonClass = `${ButtonClass}-${StateModifier}`;

export function createButtonClass(size: Size, color: Color): ButtonClass {
    return `btn-${size}-${color}`;
}

export function addStateModifier(buttonClass: ButtonClass, modifier: StateModifier): ModifiedButtonClass {
    return `${buttonClass}-${modifier}`;
}

/**
 * 演習4: 設定管理システム
 */
export type Environment = "development" | "staging" | "production";
export type LogLevel = "debug" | "info" | "warn" | "error";

export type DatabaseConfig = {
    host: string;
    port: 5432 | 3306 | 27017;
    ssl: boolean;
};

export type AppConfig = {
    environment: Environment;
    logLevel: LogLevel;
    database: DatabaseConfig;
    features: { readonly feature1: true } | { readonly feature1: false };
};

export function createDevelopmentConfig(): AppConfig {
    return {
        environment: "development",
        logLevel: "debug",
        database: {
            host: "localhost",
            port: 5432,
            ssl: false
        },
        features: { feature1: true }
    };
}

export function createProductionConfig(): AppConfig {
    return {
        environment: "production",
        logLevel: "error",
        database: {
            host: "prod-db.example.com",
            port: 5432,
            ssl: true
        },
        features: { feature1: false }
    };
}

export function adjustConfigForEnvironment(config: AppConfig, environment: Environment): AppConfig {
    let logLevel: LogLevel;
    
    switch (environment) {
        case "development":
            logLevel = "debug";
            break;
        case "staging":
            logLevel = "info";
            break;
        case "production":
            logLevel = "error";
            break;
    }
    
    return {
        ...config,
        environment,
        logLevel
    };
}