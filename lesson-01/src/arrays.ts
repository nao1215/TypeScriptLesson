/**
 * Lesson 01: 配列を使った実用的なプログラム例
 * 
 * 実際のアプリケーションで使用される配列操作の実装例です。
 */

// ===== タスク管理システム =====

// タスクのデータ配列
const tasks: Array<{
    id: number;
    title: string;
    description: string;
    priority: "低" | "中" | "高" | "緊急";
    status: "未着手" | "進行中" | "レビュー中" | "完了";
    assignee: string;
    dueDate: string;
    createdAt: string;
    tags: string[];
}> = [
    {
        id: 1,
        title: "ユーザー認証システムの実装",
        description: "JWT を使用したユーザー認証機能を実装する",
        priority: "高",
        status: "進行中",
        assignee: "田中太郎",
        dueDate: "2024-01-25",
        createdAt: "2024-01-15",
        tags: ["認証", "セキュリティ", "バックエンド"]
    },
    {
        id: 2,
        title: "商品検索機能の改善",
        description: "Elasticsearch を導入して検索性能を向上させる",
        priority: "中",
        status: "未着手",
        assignee: "佐藤花子",
        dueDate: "2024-02-01",
        createdAt: "2024-01-18",
        tags: ["検索", "パフォーマンス", "フロントエンド"]
    },
    {
        id: 3,
        title: "決済システムの統合",
        description: "Stripe API を統合して決済機能を実装する",
        priority: "緊急",
        status: "レビュー中",
        assignee: "鈴木次郎",
        dueDate: "2024-01-22",
        createdAt: "2024-01-10",
        tags: ["決済", "API", "セキュリティ"]
    },
    {
        id: 4,
        title: "ダッシュボードのUI改善",
        description: "管理者ダッシュボードのユーザビリティを向上させる",
        priority: "低",
        status: "完了",
        assignee: "高橋美咲",
        dueDate: "2024-01-20",
        createdAt: "2024-01-05",
        tags: ["UI", "UX", "フロントエンド", "React"]
    },
    {
        id: 5,
        title: "データベースの最適化",
        description: "クエリパフォーマンスの改善とインデックスの追加",
        priority: "中",
        status: "進行中",
        assignee: "山田一郎",
        dueDate: "2024-01-30",
        createdAt: "2024-01-12",
        tags: ["データベース", "パフォーマンス", "最適化"]
    }
];

console.log("=== タスク管理システム ===");
console.log(`総タスク数: ${tasks.length}`);

// 優先度別のタスク数を計算
const priorityCount: Record<string, number> = {};
tasks.forEach(task => {
    priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
});

console.log("優先度別タスク数:");
Object.entries(priorityCount).forEach(([priority, count]) => {
    console.log(`  ${priority}: ${count}件`);
});

// ステータス別のタスク数を計算
const statusCount: Record<string, number> = {};
tasks.forEach(task => {
    statusCount[task.status] = (statusCount[task.status] || 0) + 1;
});

console.log("ステータス別タスク数:");
Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}件`);
});

// 高優先度のタスクを抽出
const highPriorityTasks = tasks.filter(task => task.priority === "高" || task.priority === "緊急");
console.log(`\n高優先度タスク (${highPriorityTasks.length}件):`);
highPriorityTasks.forEach(task => {
    console.log(`  - ${task.title} (${task.status}) - ${task.assignee}`);
});

// 期限が近いタスクを抽出（3日以内）
const today = new Date();
const threeDaysFromNow = new Date();
threeDaysFromNow.setDate(today.getDate() + 3);

const upcomingTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate <= threeDaysFromNow && task.status !== "完了";
});

console.log(`\n期限が近いタスク (3日以内, ${upcomingTasks.length}件):`);
upcomingTasks.forEach(task => {
    console.log(`  - ${task.title} (期限: ${task.dueDate}) - ${task.assignee}`);
});

// ===== 売上データ分析システム =====

// 月次売上データ
const monthlySales: Array<{
    month: string;
    year: number;
    revenue: number;
    orders: number;
    newCustomers: number;
    categories: {
        electronics: number;
        clothing: number;
        books: number;
        home: number;
        sports: number;
    };
}> = [
    {
        month: "2023-10",
        year: 2023,
        revenue: 1250000,
        orders: 145,
        newCustomers: 23,
        categories: {
            electronics: 650000,
            clothing: 320000,
            books: 120000,
            home: 100000,
            sports: 60000
        }
    },
    {
        month: "2023-11",
        year: 2023,
        revenue: 1580000,
        orders: 189,
        orders: 189,
        newCustomers: 31,
        categories: {
            electronics: 820000,
            clothing: 410000,
            books: 150000,
            home: 130000,
            sports: 70000
        }
    },
    {
        month: "2023-12",
        year: 2023,
        revenue: 2100000,
        orders: 267,
        newCustomers: 45,
        categories: {
            electronics: 1200000,
            clothing: 520000,
            books: 180000,
            home: 140000,
            sports: 60000
        }
    },
    {
        month: "2024-01",
        year: 2024,
        revenue: 980000,
        orders: 98,
        newCustomers: 18,
        categories: {
            electronics: 450000,
            clothing: 280000,
            books: 100000,
            home: 90000,
            sports: 60000
        }
    }
];

console.log("\n=== 売上データ分析システム ===");

// 総売上の計算
const totalRevenue = monthlySales.reduce((sum, month) => sum + month.revenue, 0);
const totalOrders = monthlySales.reduce((sum, month) => sum + month.orders, 0);
const totalNewCustomers = monthlySales.reduce((sum, month) => sum + month.newCustomers, 0);

console.log(`総売上: ¥${totalRevenue.toLocaleString()}`);
console.log(`総注文数: ${totalOrders}件`);
console.log(`新規顧客数: ${totalNewCustomers}人`);
console.log(`平均注文単価: ¥${Math.round(totalRevenue / totalOrders).toLocaleString()}`);

// 月別売上推移
console.log("\n月別売上推移:");
monthlySales.forEach(month => {
    const avgOrderValue = Math.round(month.revenue / month.orders);
    console.log(`${month.month}: ¥${month.revenue.toLocaleString()} (${month.orders}件, 平均¥${avgOrderValue.toLocaleString()})`);
});

// カテゴリ別売上集計
const categoryTotals: Record<string, number> = {};
monthlySales.forEach(month => {
    Object.entries(month.categories).forEach(([category, amount]) => {
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
});

console.log("\nカテゴリ別売上:");
Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, total]) => {
        const percentage = ((total / totalRevenue) * 100).toFixed(1);
        console.log(`  ${category}: ¥${total.toLocaleString()} (${percentage}%)`);
    });

// 成長率の計算
const growthRates = [];
for (let i = 1; i < monthlySales.length; i++) {
    const current = monthlySales[i];
    const previous = monthlySales[i - 1];
    const growthRate = ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1);
    growthRates.push({
        month: current.month,
        growthRate: parseFloat(growthRate)
    });
}

console.log("\n前月比成長率:");
growthRates.forEach(item => {
    const indicator = item.growthRate >= 0 ? "📈" : "📉";
    console.log(`  ${item.month}: ${item.growthRate}% ${indicator}`);
});

// ===== 在庫管理システム =====

// 商品在庫データ
const inventory: Array<{
    sku: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unitCost: number;
    unitPrice: number;
    supplier: string;
    lastRestocked: string;
    location: string;
}> = [
    {
        sku: "ELEC-001",
        name: "ワイヤレスマウス",
        category: "電子機器",
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        unitCost: 1500,
        unitPrice: 2980,
        supplier: "Tech Supply Co.",
        lastRestocked: "2024-01-10",
        location: "A-1-3"
    },
    {
        sku: "CLOTH-015",
        name: "コットンTシャツ",
        category: "衣料品",
        currentStock: 8,
        minStock: 15,
        maxStock: 200,
        unitCost: 800,
        unitPrice: 1980,
        supplier: "Fashion Wholesale",
        lastRestocked: "2023-12-28",
        location: "B-2-1"
    },
    {
        sku: "BOOK-089",
        name: "プログラミング入門書",
        category: "書籍",
        currentStock: 32,
        minStock: 10,
        maxStock: 50,
        unitCost: 1200,
        unitPrice: 2800,
        supplier: "Book Distributors",
        lastRestocked: "2024-01-15",
        location: "C-1-5"
    },
    {
        sku: "HOME-023",
        name: "コーヒーメーカー",
        category: "家電",
        currentStock: 3,
        minStock: 5,
        maxStock: 25,
        unitCost: 8000,
        unitPrice: 15800,
        supplier: "Home Appliance Ltd.",
        lastRestocked: "2024-01-05",
        location: "D-3-2"
    },
    {
        sku: "SPORT-067",
        name: "ランニングシューズ",
        category: "スポーツ用品",
        currentStock: 0,
        minStock: 12,
        maxStock: 80,
        unitCost: 4500,
        unitPrice: 9800,
        supplier: "Sports Gear Inc.",
        lastRestocked: "2023-12-20",
        location: "E-1-4"
    }
];

console.log("\n=== 在庫管理システム ===");
console.log(`総商品数: ${inventory.length}`);

// 在庫状況の分析
const lowStockItems = inventory.filter(item => item.currentStock < item.minStock);
const outOfStockItems = inventory.filter(item => item.currentStock === 0);
const overstockItems = inventory.filter(item => item.currentStock > item.maxStock);

console.log(`\n在庫アラート:`);
console.log(`  在庫不足: ${lowStockItems.length}商品`);
console.log(`  在庫切れ: ${outOfStockItems.length}商品`);
console.log(`  過剰在庫: ${overstockItems.length}商品`);

// 在庫不足商品の詳細
if (lowStockItems.length > 0) {
    console.log(`\n在庫不足商品:`);
    lowStockItems.forEach(item => {
        console.log(`  - ${item.name} (${item.sku}): ${item.currentStock}個 (最小: ${item.minStock}個)`);
    });
}

// 在庫切れ商品
if (outOfStockItems.length > 0) {
    console.log(`\n在庫切れ商品:`);
    outOfStockItems.forEach(item => {
        console.log(`  - ${item.name} (${item.sku}): 在庫なし`);
    });
}

// カテゴリ別在庫集計
const stockByCategory: Record<string, { items: number; totalValue: number }> = {};
inventory.forEach(item => {
    if (!stockByCategory[item.category]) {
        stockByCategory[item.category] = { items: 0, totalValue: 0 };
    }
    stockByCategory[item.category].items += item.currentStock;
    stockByCategory[item.category].totalValue += item.currentStock * item.unitCost;
});

console.log(`\nカテゴリ別在庫:`);
Object.entries(stockByCategory).forEach(([category, data]) => {
    console.log(`  ${category}: ${data.items}点 (価値: ¥${data.totalValue.toLocaleString()})`);
});

// 総在庫価値の計算
const totalInventoryValue = inventory.reduce((total, item) => {
    return total + (item.currentStock * item.unitCost);
}, 0);

console.log(`\n総在庫価値: ¥${totalInventoryValue.toLocaleString()}`);

// ===== 顧客データ分析システム =====

// 顧客データ
const customers: Array<{
    id: number;
    name: string;
    email: string;
    registrationDate: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
    preferredCategories: string[];
    loyaltyTier: "ブロンズ" | "シルバー" | "ゴールド" | "プラチナ";
}> = [
    {
        id: 1001,
        name: "田中太郎",
        email: "tanaka@example.com",
        registrationDate: "2022-03-15",
        totalOrders: 28,
        totalSpent: 145600,
        averageOrderValue: 5200,
        lastOrderDate: "2024-01-18",
        preferredCategories: ["電子機器", "書籍"],
        loyaltyTier: "ゴールド"
    },
    {
        id: 1002,
        name: "佐藤花子",
        email: "sato@example.com",
        registrationDate: "2023-01-22",
        totalOrders: 12,
        totalSpent: 67800,
        averageOrderValue: 5650,
        lastOrderDate: "2024-01-20",
        preferredCategories: ["衣料品", "家電"],
        loyaltyTier: "シルバー"
    },
    {
        id: 1003,
        name: "鈴木次郎",
        email: "suzuki@example.com",
        registrationDate: "2021-11-08",
        totalOrders: 45,
        totalSpent: 234500,
        averageOrderValue: 5211,
        lastOrderDate: "2024-01-15",
        preferredCategories: ["スポーツ用品", "電子機器"],
        loyaltyTier: "プラチナ"
    },
    {
        id: 1004,
        name: "高橋美咲",
        email: "takahashi@example.com",
        registrationDate: "2023-08-10",
        totalOrders: 6,
        totalSpent: 23400,
        averageOrderValue: 3900,
        lastOrderDate: "2023-12-28",
        preferredCategories: ["書籍", "衣料品"],
        loyaltyTier: "ブロンズ"
    },
    {
        id: 1005,
        name: "山田一郎",
        email: "yamada@example.com",
        registrationDate: "2022-07-03",
        totalOrders: 19,
        totalSpent: 98700,
        averageOrderValue: 5194,
        lastOrderDate: "2024-01-12",
        preferredCategories: ["家電", "電子機器"],
        loyaltyTier: "シルバー"
    }
];

console.log("\n=== 顧客データ分析システム ===");
console.log(`総顧客数: ${customers.length}`);

// ロイヤルティ層別の顧客数
const loyaltyTierCount: Record<string, number> = {};
customers.forEach(customer => {
    loyaltyTierCount[customer.loyaltyTier] = (loyaltyTierCount[customer.loyaltyTier] || 0) + 1;
});

console.log("ロイヤルティ層別顧客数:");
Object.entries(loyaltyTierCount).forEach(([tier, count]) => {
    console.log(`  ${tier}: ${count}人`);
});

// トップ顧客の抽出
const topCustomers = customers
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3);

console.log("\nトップ顧客 (上位3名):");
topCustomers.forEach((customer, index) => {
    console.log(`  ${index + 1}. ${customer.name}: ¥${customer.totalSpent.toLocaleString()} (${customer.totalOrders}回注文)`);
});

// カテゴリ別人気度
const categoryPreferences: Record<string, number> = {};
customers.forEach(customer => {
    customer.preferredCategories.forEach(category => {
        categoryPreferences[category] = (categoryPreferences[category] || 0) + 1;
    });
});

console.log("\n人気カテゴリランキング:");
Object.entries(categoryPreferences)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count], index) => {
        console.log(`  ${index + 1}. ${category}: ${count}人`);
    });

// 顧客の活動状況分析
const activeCustomers = customers.filter(customer => {
    const lastOrder = new Date(customer.lastOrderDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastOrder >= thirtyDaysAgo;
});

const inactiveCustomers = customers.filter(customer => {
    const lastOrder = new Date(customer.lastOrderDate);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    return lastOrder < ninetyDaysAgo;
});

console.log("\n顧客の活動状況:");
console.log(`  アクティブ顧客 (30日以内): ${activeCustomers.length}人`);
console.log(`  非アクティブ顧客 (90日以上): ${inactiveCustomers.length}人`);

// 平均統計
const avgOrderValue = customers.reduce((sum, customer) => sum + customer.averageOrderValue, 0) / customers.length;
const avgTotalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / customers.length;
const avgOrderCount = customers.reduce((sum, customer) => sum + customer.totalOrders, 0) / customers.length;

console.log("\n顧客の平均統計:");
console.log(`  平均注文単価: ¥${Math.round(avgOrderValue).toLocaleString()}`);
console.log(`  平均総支出額: ¥${Math.round(avgTotalSpent).toLocaleString()}`);
console.log(`  平均注文回数: ${Math.round(avgOrderCount)}回`);

export {
    tasks,
    monthlySales,
    inventory,
    customers
};