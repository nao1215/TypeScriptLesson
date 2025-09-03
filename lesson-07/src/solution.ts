export function getUniqueValues<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {} as Record<string, T[]>);
}

export function findMaxBy<T>(array: T[], getValue: (item: T) => number): T | undefined {
    if (array.length === 0) {
        return undefined;
    }
    
    return array.reduce((max, current) => {
        return getValue(current) > getValue(max) ? current : max;
    });
}

export function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
        throw new Error("Chunk size must be greater than 0");
    }
    
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export function flattenArray<T>(array: (T | T[])[]): T[] {
    return array.reduce<T[]>((flattened, item) => {
        if (Array.isArray(item)) {
            return flattened.concat(item);
        } else {
            return flattened.concat([item]);
        }
    }, []);
}

function demonstrateSolutions() {
    console.log("=== Lesson 07: 演習問題の解答例 ===\n");

    console.log("1. 重複除去");
    const numbers = [1, 2, 2, 3, 1, 4, 3];
    const strings = ['apple', 'banana', 'apple', 'orange', 'banana'];
    console.log("数値配列:", numbers, "→", getUniqueValues(numbers));
    console.log("文字列配列:", strings, "→", getUniqueValues(strings));
    console.log();

    console.log("2. グループ化");
    interface Item {
        category: string;
        name: string;
        value: number;
    }
    
    const items: Item[] = [
        { category: 'A', name: 'item1', value: 10 },
        { category: 'B', name: 'item2', value: 20 },
        { category: 'A', name: 'item3', value: 30 },
        { category: 'C', name: 'item4', value: 40 },
        { category: 'B', name: 'item5', value: 50 }
    ];
    
    const grouped = groupBy(items, 'category');
    console.log("カテゴリ別グループ化:");
    Object.entries(grouped).forEach(([category, items]) => {
        console.log(`  ${category}: ${items.map(item => item.name).join(', ')}`);
    });
    console.log();

    console.log("3. 最大値検索");
    const maxByValue = findMaxBy(items, item => item.value);
    const maxByNameLength = findMaxBy(items, item => item.name.length);
    console.log("値が最大の項目:", maxByValue?.name, "(", maxByValue?.value, ")");
    console.log("名前が最長の項目:", maxByNameLength?.name, "(", maxByNameLength?.name.length, "文字)");
    console.log("空配列での検索:", findMaxBy([], (x: any) => x));
    console.log();

    console.log("4. 配列の分割");
    const numbers2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    
    console.log("数値を3つずつ分割:", chunkArray(numbers2, 3));
    console.log("文字を2つずつ分割:", chunkArray(letters, 2));
    console.log("サイズ1で分割:", chunkArray([1, 2, 3], 1));
    console.log();

    console.log("5. 配列の平坦化");
    const nested1 = [1, [2, 3], 4, [5, 6, 7]];
    const nested2 = ['a', ['b', 'c'], 'd', ['e']];
    const mixed = [1, [2, 'three'], 'four', [5, 6]];
    
    console.log("数値配列:", nested1, "→", flattenArray(nested1));
    console.log("文字列配列:", nested2, "→", flattenArray(nested2));
    console.log("混合配列:", mixed, "→", flattenArray(mixed));
}

if (require.main === module) {
    demonstrateSolutions();
}