export function createProfile(name: string, age?: number): string {
    if (age !== undefined) {
        return `Name: ${name}, Age: ${age}`;
    }
    return `Name: ${name}`;
}

export function slice<T>(array: T[], start?: number, end?: number): T[] {
    const startIndex = start ?? 0;
    const endIndex = end ?? array.length;
    return array.slice(startIndex, endIndex);
}

interface Config {
    apiUrl?: string;
    timeout?: number;
    retries?: number;
}

export function mergeConfig(userConfig?: Config): Config {
    const defaultConfig: Config = {
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3
    };
    
    if (!userConfig) {
        return defaultConfig;
    }
    
    return {
        apiUrl: userConfig.apiUrl ?? defaultConfig.apiUrl,
        timeout: userConfig.timeout ?? defaultConfig.timeout,
        retries: userConfig.retries ?? defaultConfig.retries
    };
}