import {
    users,
    products,
    getProductNames,
    getProductSummaries,
    getInStockProducts,
    getElectronicsProducts,
    getProductsInPriceRange,
    findProductById,
    findCheapestProduct,
    getTotalPrice,
    getProductsByCategory,
    hasExpensiveProducts,
    allProductsInStock,
    sortProductsByPrice,
    sortProductsByName,
    processUntypedArray,
    removeNullish,
    processOptionalUsers,
    ShoppingCart,
    DataAnalyzer
} from '../src/index';

import {
    getUniqueValues,
    groupBy,
    findMaxBy,
    chunkArray,
    flattenArray
} from '../src/solution';

describe('Lesson 07: 配列型', () => {
    describe('基本的な配列操作', () => {
        test('商品名の取得', () => {
            const names = getProductNames(products);
            expect(names).toEqual(["ノートPC", "マウス", "デスク", "椅子"]);
        });

        test('商品サマリーの生成', () => {
            const summaries = getProductSummaries(products);
            expect(summaries[0]).toBe("ノートPC: ¥80,000");
            expect(summaries).toHaveLength(4);
        });

        test('在庫ありの商品取得', () => {
            const inStock = getInStockProducts(products);
            expect(inStock).toHaveLength(3);
            expect(inStock.every(p => p.inStock)).toBe(true);
        });

        test('電子機器カテゴリの商品取得', () => {
            const electronics = getElectronicsProducts(products);
            expect(electronics).toHaveLength(2);
            expect(electronics.every(p => p.category === "電子機器")).toBe(true);
        });

        test('価格範囲での商品検索', () => {
            const midRange = getProductsInPriceRange(products, 10000, 30000);
            expect(midRange).toHaveLength(2); // デスクと椅子
            expect(midRange.every(p => p.price >= 10000 && p.price <= 30000)).toBe(true);
        });
    });

    describe('配列の検索と集計', () => {
        test('IDによる商品検索', () => {
            const product = findProductById(products, 1);
            expect(product?.name).toBe("ノートPC");
            
            const notFound = findProductById(products, 999);
            expect(notFound).toBeUndefined();
        });

        test('最安商品の検索', () => {
            const cheapest = findCheapestProduct(products);
            expect(cheapest?.name).toBe("マウス");
            expect(cheapest?.price).toBe(2000);
        });

        test('総額の計算', () => {
            const total = getTotalPrice(products);
            expect(total).toBe(122000); // 80000 + 2000 + 25000 + 15000
        });

        test('カテゴリ別グループ化', () => {
            const grouped = getProductsByCategory(products);
            expect(grouped["電子機器"]).toHaveLength(2);
            expect(grouped["家具"]).toHaveLength(2);
        });

        test('高額商品の存在チェック', () => {
            expect(hasExpensiveProducts(products)).toBe(true); // ノートPCが80000円
        });

        test('全商品の在庫チェック', () => {
            expect(allProductsInStock(products)).toBe(false); // マウスが在庫なし
        });
    });

    describe('配列のソート', () => {
        test('価格でのソート', () => {
            const sorted = sortProductsByPrice(products);
            expect(sorted[0].name).toBe("マウス");
            expect(sorted[sorted.length - 1].name).toBe("ノートPC");
            
            // 元の配列が変更されていないことを確認
            expect(products[0].name).toBe("ノートPC");
        });

        test('名前でのソート', () => {
            const sorted = sortProductsByName(products);
            const names = sorted.map(p => p.name);
            const expectedOrder = ["デスク", "ノートPC", "マウス", "椅子"];
            expect(names).toEqual(expectedOrder);
        });
    });

    describe('型安全な配列操作', () => {
        test('型別の配列処理', () => {
            const mixedData: unknown[] = ["hello", 42, true, null, "world", 3.14, undefined];
            const result = processUntypedArray(mixedData);
            
            expect(result.numbers).toEqual([42, 3.14]);
            expect(result.strings).toEqual(["hello", "world"]);
            expect(result.others).toHaveLength(3); // true, null, undefined
        });

        test('null/undefinedの除去', () => {
            const array = [1, null, 2, undefined, 3, null];
            const result = removeNullish(array);
            expect(result).toEqual([1, 2, 3]);
        });

        test('オプショナルユーザーの処理', () => {
            const optionalUsers = [users[0], null, users[1], undefined, users[2]];
            const result = processOptionalUsers(optionalUsers);
            
            expect(result.validUsers).toHaveLength(3);
            expect(result.userNames).toEqual(["田中太郎", "佐藤花子", "鈴木一郎"]);
            expect(result.totalAge).toBe(90); // 30 + 25 + 35
        });
    });

    describe('ショッピングカート', () => {
        let cart: ShoppingCart;

        beforeEach(() => {
            cart = new ShoppingCart();
        });

        test('商品の追加', () => {
            cart.addItem(1, "テスト商品", 1000, 2);
            
            expect(cart.getItems()).toHaveLength(1);
            expect(cart.getItemCount()).toBe(2);
            expect(cart.getTotalPrice()).toBe(2000);
        });

        test('同一商品の追加（数量増加）', () => {
            cart.addItem(1, "テスト商品", 1000, 1);
            cart.addItem(1, "テスト商品", 1000, 2);
            
            expect(cart.getItems()).toHaveLength(1);
            expect(cart.getItemCount()).toBe(3);
        });

        test('商品の削除', () => {
            cart.addItem(1, "商品1", 1000);
            cart.addItem(2, "商品2", 2000);
            
            cart.removeItem(1);
            
            expect(cart.getItems()).toHaveLength(1);
            expect(cart.getItems()[0].productName).toBe("商品2");
        });

        test('数量の更新', () => {
            cart.addItem(1, "テスト商品", 1000, 2);
            cart.updateQuantity(1, 5);
            
            expect(cart.getItemCount()).toBe(5);
            
            // 数量を0以下にすると削除される
            cart.updateQuantity(1, 0);
            expect(cart.getItems()).toHaveLength(0);
        });

        test('割引の適用', () => {
            cart.addItem(1, "テスト商品", 1000, 2);
            cart.applyDiscount(1, 10); // 10%割引
            
            expect(cart.getTotalPrice()).toBe(1800); // 2000 * 0.9
        });

        test('注文の作成', () => {
            cart.addItem(1, "商品1", 1000);
            
            const order = cart.createOrder(123);
            
            expect(order.customerId).toBe(123);
            expect(order.items).toHaveLength(1);
            expect(order.status).toBe('pending');
        });

        test('空のカートからの注文作成でエラー', () => {
            expect(() => cart.createOrder(123)).toThrow("カートが空です");
        });
    });

    describe('データ分析', () => {
        const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        test('平均の計算', () => {
            expect(DataAnalyzer.mean(testData)).toBe(5.5);
            expect(DataAnalyzer.mean([])).toBe(0);
        });

        test('中央値の計算', () => {
            expect(DataAnalyzer.median(testData)).toBe(5.5);
            expect(DataAnalyzer.median([1, 2, 3])).toBe(2);
            expect(DataAnalyzer.median([])).toBe(0);
        });

        test('標準偏差の計算', () => {
            const stdDev = DataAnalyzer.standardDeviation(testData);
            expect(stdDev).toBeCloseTo(2.872, 2);
            expect(DataAnalyzer.standardDeviation([])).toBe(0);
        });

        test('パーセンタイルの計算', () => {
            expect(DataAnalyzer.percentile(testData, 50)).toBe(5.5);
            expect(DataAnalyzer.percentile(testData, 25)).toBe(3.25);
            expect(DataAnalyzer.percentile(testData, 75)).toBe(7.75);
            
            expect(() => DataAnalyzer.percentile(testData, -1)).toThrow();
            expect(() => DataAnalyzer.percentile(testData, 101)).toThrow();
        });

        test('外れ値の除去', () => {
            const dataWithOutliers = [1, 2, 3, 4, 5, 100]; // 100が外れ値
            const cleaned = DataAnalyzer.removeOutliers(dataWithOutliers);
            expect(cleaned).not.toContain(100);
            expect(cleaned).toEqual([1, 2, 3, 4, 5]);
        });

        test('データの正規化', () => {
            const normalized = DataAnalyzer.normalizeData([10, 20, 30, 40, 50]);
            expect(normalized[0]).toBe(0);
            expect(normalized[normalized.length - 1]).toBe(1);
            
            // カスタム範囲での正規化
            const customNormalized = DataAnalyzer.normalizeData([10, 20, 30], -1, 1);
            expect(customNormalized[0]).toBe(-1);
            expect(customNormalized[customNormalized.length - 1]).toBe(1);
        });
    });

    describe('演習問題の解答', () => {
        test('重複除去', () => {
            expect(getUniqueValues([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
            expect(getUniqueValues(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
            expect(getUniqueValues([])).toEqual([]);
        });

        test('グループ化', () => {
            interface TestItem {
                category: string;
                value: number;
            }
            
            const items: TestItem[] = [
                { category: 'A', value: 1 },
                { category: 'B', value: 2 },
                { category: 'A', value: 3 }
            ];
            
            const grouped = groupBy(items, 'category');
            expect(grouped['A']).toHaveLength(2);
            expect(grouped['B']).toHaveLength(1);
            expect(grouped['A'][0].value).toBe(1);
            expect(grouped['A'][1].value).toBe(3);
        });

        test('最大値検索', () => {
            const items = [
                { name: 'A', value: 10 },
                { name: 'B', value: 30 },
                { name: 'C', value: 20 }
            ];
            
            const max = findMaxBy(items, item => item.value);
            expect(max?.name).toBe('B');
            expect(max?.value).toBe(30);
            
            expect(findMaxBy([], (x: any) => x.value)).toBeUndefined();
        });

        test('配列の分割', () => {
            expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
            expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
            expect(chunkArray([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
            
            expect(() => chunkArray([1, 2, 3], 0)).toThrow();
            expect(() => chunkArray([1, 2, 3], -1)).toThrow();
        });

        test('配列の平坦化', () => {
            expect(flattenArray([1, [2, 3], 4, [5]])).toEqual([1, 2, 3, 4, 5]);
            expect(flattenArray(['a', ['b', 'c'], 'd'])).toEqual(['a', 'b', 'c', 'd']);
            expect(flattenArray([1, 2, 3])).toEqual([1, 2, 3]); // ネストなし
            expect(flattenArray([])).toEqual([]);
        });
    });
});