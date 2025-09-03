export function swapTuple<T, U>(tuple: [T, U]): [U, T] {
    // TODO: タプルの要素を入れ替えて返す関数を実装してください
    // ヒント: 分割代入を使用して [a, b] から [b, a] を作成
    // 例: swapTuple([1, "hello"]) → ["hello", 1]
    // 例: swapTuple(["a", 2]) → [2, "a"]
    throw new Error("Not implemented yet");
}

export function addThree(point: [number, number]): [number, number, number] {
    // TODO: 2D座標に0のZ座標を追加して3D座標にする関数を実装してください
    // ヒント: スプレッド演算子を使用して [...point, 0]
    // 例: addThree([10, 20]) → [10, 20, 0]
    // 例: addThree([-5, 15]) → [-5, 15, 0]
    throw new Error("Not implemented yet");
}

export function parseNameAge(input: string): [string, number] | null {
    // TODO: "名前,年齢"形式の文字列をパースしてタプルを返す関数を実装してください
    // 不正な形式の場合はnullを返す
    // ヒント: split(',')で分割し、年齢部分をNumber()で変換、isNaN()でチェック
    // 例: parseNameAge("田中太郎,30") → ["田中太郎", 30]
    // 例: parseNameAge("佐藤,25") → ["佐藤", 25]
    // 例: parseNameAge("無効な形式") → null
    // 例: parseNameAge("名前,abc") → null (年齢が数値でない)
    throw new Error("Not implemented yet");
}

export function zipArrays<T, U>(arr1: T[], arr2: U[]): [T, U][] {
    // TODO: 2つの配列を組み合わせてタプルの配列を作成する関数を実装してください
    // 短い方の配列の長さに合わせる
    // ヒント: Math.min()で短い方の長さを取得し、mapで新しい配列を作成
    // 例: zipArrays([1, 2, 3], ["a", "b"]) → [[1, "a"], [2, "b"]]
    // 例: zipArrays(["x", "y"], [10, 20, 30]) → [["x", 10], ["y", 20]]
    throw new Error("Not implemented yet");
}

export function getFirstLast<T>(array: T[]): [T, T] | null {
    // TODO: 配列の最初と最後の要素をタプルで返す関数を実装してください
    // 配列が空または要素が1つしかない場合はnullを返す
    // ヒント: array.lengthをチェックしてからarray[0]とarray[array.length - 1]を使用
    // 例: getFirstLast([1, 2, 3, 4]) → [1, 4]
    // 例: getFirstLast(["a", "b", "c"]) → ["a", "c"]
    // 例: getFirstLast([1]) → null
    // 例: getFirstLast([]) → null
    throw new Error("Not implemented yet");
}