export function swapTuple<T, U>(tuple: [T, U]): [U, T] {
    const [first, second] = tuple;
    return [second, first];
}

export function addThree(point: [number, number]): [number, number, number] {
    return [...point, 0];
}

export function parseNameAge(input: string): [string, number] | null {
    const parts = input.split(',');
    
    if (parts.length !== 2) {
        return null;
    }
    
    const name = parts[0].trim();
    const ageStr = parts[1].trim();
    const age = Number(ageStr);
    
    if (isNaN(age) || name === '') {
        return null;
    }
    
    return [name, age];
}

export function zipArrays<T, U>(arr1: T[], arr2: U[]): [T, U][] {
    const minLength = Math.min(arr1.length, arr2.length);
    const result: [T, U][] = [];
    
    for (let i = 0; i < minLength; i++) {
        result.push([arr1[i], arr2[i]]);
    }
    
    return result;
}

export function getFirstLast<T>(array: T[]): [T, T] | null {
    if (array.length < 2) {
        return null;
    }
    
    return [array[0], array[array.length - 1]];
}

function demonstrateSolutions() {
    console.log("=== Lesson 08: 演習問題の解答例 ===\n");

    console.log("1. タプルの入れ替え");
    console.log("文字列と数値:", swapTuple([1, "hello"]));
    console.log("文字列と文字列:", swapTuple(["a", "b"]));
    console.log("数値とboolean:", swapTuple([42, true]));
    console.log();

    console.log("2. 2Dから3Dへの変換");
    console.log("正の座標:", addThree([10, 20]));
    console.log("負の座標:", addThree([-5, 15]));
    console.log("原点:", addThree([0, 0]));
    console.log();

    console.log("3. 名前と年齢のパース");
    console.log('正常な形式1:', parseNameAge("田中太郎,30"));
    console.log('正常な形式2:', parseNameAge("佐藤花子,25"));
    console.log('スペース付き:', parseNameAge(" 鈴木一郎 , 35 "));
    console.log('不正な形式1:', parseNameAge("無効な形式"));
    console.log('不正な形式2:', parseNameAge("名前,abc"));
    console.log('空の名前:', parseNameAge(",30"));
    console.log();

    console.log("4. 配列のzip");
    const numbers = [1, 2, 3, 4];
    const letters = ["a", "b", "c"];
    const colors = ["red", "green"];
    
    console.log("数値と文字:", zipArrays(numbers, letters));
    console.log("文字と色:", zipArrays(letters, colors));
    console.log("空配列との組み合わせ:", zipArrays(numbers, []));
    console.log();

    console.log("5. 最初と最後の要素");
    console.log("数値配列:", getFirstLast([1, 2, 3, 4, 5]));
    console.log("文字列配列:", getFirstLast(["apple", "banana", "cherry"]));
    console.log("2要素配列:", getFirstLast(["start", "end"]));
    console.log("1要素配列:", getFirstLast([42]));
    console.log("空配列:", getFirstLast([]));
    console.log();

    console.log("6. 実用例: 座標変換パイプライン");
    type Point2D = [number, number];
    type Point3D = [number, number, number];
    
    const originalPoints: Point2D[] = [[10, 20], [30, 40], [50, 60]];
    console.log("元の2D座標:", originalPoints);
    
    // 2Dから3Dに変換
    const points3D = originalPoints.map(addThree);
    console.log("3D座標に変換:", points3D);
    
    // 座標とインデックスをzip
    const pointsWithIndex = zipArrays(
        Array.from({ length: points3D.length }, (_, i) => i + 1),
        points3D
    );
    console.log("インデックス付き座標:", pointsWithIndex);
    
    // 最初と最後の座標
    const bounds = getFirstLast(originalPoints);
    if (bounds) {
        console.log("境界座標 (最初と最後):", bounds);
    }
}

if (require.main === module) {
    demonstrateSolutions();
}