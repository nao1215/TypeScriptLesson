export function getUniqueValues<T>(array: T[]): T[] {
    // TODO: 重複を除いた配列を返す関数を実装してください
    // ヒント: Set を使用するか、filter と indexOf を組み合わせる
    // 例: getUniqueValues([1, 2, 2, 3, 1]) → [1, 2, 3]
    // 例: getUniqueValues(['a', 'b', 'a', 'c']) → ['a', 'b', 'c']
    throw new Error("Not implemented yet");
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    // TODO: 指定されたキーでオブジェクト配列をグループ化する関数を実装してください
    // keyプロパティの値をキーとして、同じ値を持つオブジェクトをグループ化
    // ヒント: reduce を使用してRecord<string, T[]>を構築
    // 例: groupBy([{type: 'A', value: 1}, {type: 'B', value: 2}, {type: 'A', value: 3}], 'type')
    //     → { 'A': [{type: 'A', value: 1}, {type: 'A', value: 3}], 'B': [{type: 'B', value: 2}] }
    throw new Error("Not implemented yet");
}

export function findMaxBy<T>(array: T[], getValue: (item: T) => number): T | undefined {
    // TODO: 指定された値取得関数に基づいて最大値を持つ要素を返す関数を実装してください
    // 配列が空の場合はundefinedを返す
    // ヒント: reduce を使用して最大値を持つ要素を追跡
    // 例: findMaxBy([{name: 'A', value: 10}, {name: 'B', value: 20}], item => item.value)
    //     → {name: 'B', value: 20}
    throw new Error("Not implemented yet");
}

export function chunkArray<T>(array: T[], size: number): T[][] {
    // TODO: 配列を指定されたサイズのチャンク（小さな配列）に分割する関数を実装してください
    // sizeが1以下の場合はエラーを投げる
    // ヒント: for文とslice()を使用、またはArray.from()を活用
    // 例: chunkArray([1, 2, 3, 4, 5], 2) → [[1, 2], [3, 4], [5]]
    // 例: chunkArray(['a', 'b', 'c', 'd', 'e', 'f'], 3) → [['a', 'b', 'c'], ['d', 'e', 'f']]
    throw new Error("Not implemented yet");
}

export function flattenArray<T>(array: (T | T[])[]): T[] {
    // TODO: ネストされた配列を1レベル平坦化する関数を実装してください
    // 1レベルのネストのみを処理（深いネストは対象外）
    // ヒント: reduce と Array.isArray() を使用
    // 例: flattenArray([1, [2, 3], 4, [5, 6]]) → [1, 2, 3, 4, 5, 6]
    // 例: flattenArray(['a', ['b', 'c'], 'd']) → ['a', 'b', 'c', 'd']
    throw new Error("Not implemented yet");
}