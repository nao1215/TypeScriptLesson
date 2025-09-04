export function max(a: number, b: number): number {
    return a > b ? a : b;
}

export function sumArray(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0);
}

export function reverseString(str: string): string {
    return str.split('').reverse().join('');
}