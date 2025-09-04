export type Comparator = (a: number, b: number) => number;

export function sortAscending(numbers: number[], comparator: Comparator): number[] {
    return [...numbers].sort(comparator);
}

export function sortDescending(numbers: number[], comparator: Comparator): number[] {
    return [...numbers].sort((a, b) => -comparator(a, b));
}

export function getLength(value: string): number;
export function getLength(value: number): number;
export function getLength(value: string | number): number {
    if (typeof value === 'string') {
        return value.length;
    } else {
        return value;
    }
}

export function measureTime<T>(fn: () => T): { result: T; time: number } {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return {
        result,
        time: end - start
    };
}