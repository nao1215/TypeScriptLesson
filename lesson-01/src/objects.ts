/**
 * Lesson 01: オブジェクトを使った実用的なプログラム例
 * 
 * 実際のアプリケーションで使用されるオブジェクト操作の実装例です。
 */

// ===== ユーザープロファイル管理システム =====

// ユーザー情報オブジェクト
const userProfile: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    isActive: boolean;
    roles: string[];
    preferences: {
        theme: string;
        language: string;
        notifications: boolean;
    };
    metadata: {
        createdAt: string;
        lastLogin: string;
        loginCount: number;
    };
} = {
    id: 12345,
    username: "tanaka_taro",
    email: "tanaka@example.com",
    firstName: "太郎",
    lastName: "田中",
    age: 28,
    isActive: true,
    roles: ["user", "editor"],
    preferences: {
        theme: "dark",
        language: "ja",
        notifications: true
    },
    metadata: {
        createdAt: "2023-01-15T09:30:00Z",
        lastLogin: "2024-01-20T14:22:35Z",
        loginCount: 157
    }
};

// ユーザー情報の表示
console.log("=== ユーザープロファイル ===");
console.log(`ID: ${userProfile.id}`);
console.log(`名前: ${userProfile.lastName} ${userProfile.firstName}`);
console.log(`ユーザー名: ${userProfile.username}`);
console.log(`メール: ${userProfile.email}`);
console.log(`年齢: ${userProfile.age}歳`);
console.log(`ステータス: ${userProfile.isActive ? "アクティブ" : "非アクティブ"}`);
console.log(`権限: ${userProfile.roles.join(", ")}`);
console.log(`テーマ: ${userProfile.preferences.theme}`);
console.log(`ログイン回数: ${userProfile.metadata.loginCount}回`);

// ===== 商品カタログシステム =====

// 商品情報オブジェクトの配列
const productCatalog: Array<{
    id: number;
    name: string;
    category: string;
    price: number;
    currency: string;
    inStock: boolean;
    stockCount: number;
    description: string;
    specifications: {
        weight: number;
        dimensions: {
            width: number;
            height: number;
            depth: number;
        };
        color: string;
        material: string;
    };
    ratings: {
        average: number;
        count: number;
    };
    tags: string[];
}> = [
    {
        id: 1001,
        name: "MacBook Pro 14インチ",
        category: "ノートパソコン",
        price: 248000,
        currency: "JPY",
        inStock: true,
        stockCount: 15,
        description: "Apple M2 Proチップを搭載した高性能ノートパソコン",
        specifications: {
            weight: 1.6,
            dimensions: {
                width: 312.6,
                height: 221.2,
                depth: 15.5
            },
            color: "スペースグレイ",
            material: "アルミニウム"
        },
        ratings: {
            average: 4.8,
            count: 234
        },
        tags: ["Apple", "高性能", "クリエイター向け", "M2 Pro"]
    },
    {
        id: 1002,
        name: "Dell XPS 13",
        category: "ノートパソコン",
        price: 159800,
        currency: "JPY",
        inStock: true,
        stockCount: 8,
        description: "コンパクトで軽量な高性能ウルトラブック",
        specifications: {
            weight: 1.2,
            dimensions: {
                width: 296,
                height: 199,
                depth: 14.8
            },
            color: "プラチナシルバー",
            material: "アルミニウム"
        },
        ratings: {
            average: 4.6,
            count: 89
        },
        tags: ["Dell", "軽量", "ビジネス", "Intel"]
    },
    {
        id: 1003,
        name: "iPad Pro 12.9インチ",
        category: "タブレット",
        price: 129800,
        currency: "JPY",
        inStock: false,
        stockCount: 0,
        description: "M2チップ搭載の最高峰タブレット",
        specifications: {
            weight: 0.682,
            dimensions: {
                width: 280.6,
                height: 214.9,
                depth: 6.4
            },
            color: "スペースグレイ",
            material: "アルミニウム"
        },
        ratings: {
            average: 4.7,
            count: 156
        },
        tags: ["Apple", "クリエイティブ", "M2", "大画面"]
    }
];

// 商品カタログの表示
console.log("\n=== 商品カタログ ===");
productCatalog.forEach(product => {
    console.log(`\n商品ID: ${product.id}`);
    console.log(`商品名: ${product.name}`);
    console.log(`カテゴリ: ${product.category}`);
    console.log(`価格: ¥${product.price.toLocaleString()}`);
    console.log(`在庫: ${product.inStock ? `あり (${product.stockCount}台)` : "なし"}`);
    console.log(`評価: ⭐${product.ratings.average} (${product.ratings.count}件)`);
    console.log(`重量: ${product.specifications.weight}kg`);
    console.log(`タグ: ${product.tags.join(", ")}`);
});

// ===== 注文管理システム =====

// 注文情報オブジェクト
const orderDetails: {
    orderId: string;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    items: Array<{
        productId: number;
        productName: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    shipping: {
        method: string;
        cost: number;
        address: {
            postalCode: string;
            prefecture: string;
            city: string;
            address1: string;
            address2?: string;
        };
        estimatedDelivery: string;
    };
    payment: {
        method: string;
        subtotal: number;
        tax: number;
        shippingCost: number;
        total: number;
    };
    status: string;
    createdAt: string;
} = {
    orderId: "ORD-20240120-001",
    customer: {
        id: 12345,
        name: "田中太郎",
        email: "tanaka@example.com"
    },
    items: [
        {
            productId: 1001,
            productName: "MacBook Pro 14インチ",
            quantity: 1,
            unitPrice: 248000,
            subtotal: 248000
        },
        {
            productId: 1002,
            productName: "Dell XPS 13",
            quantity: 2,
            unitPrice: 159800,
            subtotal: 319600
        }
    ],
    shipping: {
        method: "宅急便",
        cost: 800,
        address: {
            postalCode: "123-4567",
            prefecture: "東京都",
            city: "新宿区",
            address1: "西新宿1-1-1",
            address2: "高層ビル20F"
        },
        estimatedDelivery: "2024-01-25"
    },
    payment: {
        method: "クレジットカード",
        subtotal: 567600,
        tax: 56760,
        shippingCost: 800,
        total: 625160
    },
    status: "処理中",
    createdAt: "2024-01-20T10:30:00Z"
};

// 注文詳細の表示
console.log("\n=== 注文管理システム ===");
console.log(`注文ID: ${orderDetails.orderId}`);
console.log(`顧客: ${orderDetails.customer.name} (${orderDetails.customer.email})`);
console.log(`ステータス: ${orderDetails.status}`);
console.log(`\n注文商品:`);
orderDetails.items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.productName}`);
    console.log(`     単価: ¥${item.unitPrice.toLocaleString()} × ${item.quantity}個`);
    console.log(`     小計: ¥${item.subtotal.toLocaleString()}`);
});

console.log(`\n配送先:`);
console.log(`  〒${orderDetails.shipping.address.postalCode}`);
console.log(`  ${orderDetails.shipping.address.prefecture}${orderDetails.shipping.address.city}`);
console.log(`  ${orderDetails.shipping.address.address1}`);
if (orderDetails.shipping.address.address2) {
    console.log(`  ${orderDetails.shipping.address.address2}`);
}
console.log(`配送方法: ${orderDetails.shipping.method} (¥${orderDetails.shipping.cost.toLocaleString()})`);
console.log(`配送予定: ${orderDetails.shipping.estimatedDelivery}`);

console.log(`\n支払い詳細:`);
console.log(`  商品小計: ¥${orderDetails.payment.subtotal.toLocaleString()}`);
console.log(`  消費税: ¥${orderDetails.payment.tax.toLocaleString()}`);
console.log(`  送料: ¥${orderDetails.payment.shippingCost.toLocaleString()}`);
console.log(`  合計: ¥${orderDetails.payment.total.toLocaleString()}`);
console.log(`  支払い方法: ${orderDetails.payment.method}`);

// ===== システム設定管理 =====

// アプリケーション設定オブジェクト
const appConfig: {
    app: {
        name: string;
        version: string;
        environment: string;
        debug: boolean;
    };
    database: {
        host: string;
        port: number;
        name: string;
        ssl: boolean;
        poolSize: number;
    };
    api: {
        baseUrl: string;
        timeout: number;
        retries: number;
        rateLimit: {
            requests: number;
            windowMs: number;
        };
    };
    security: {
        jwt: {
            secret: string;
            expiresIn: string;
        };
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    features: {
        userRegistration: boolean;
        emailNotifications: boolean;
        fileUpload: boolean;
        analytics: boolean;
    };
} = {
    app: {
        name: "E-Commerce Platform",
        version: "2.1.4",
        environment: "production",
        debug: false
    },
    database: {
        host: "db.example.com",
        port: 5432,
        name: "ecommerce_db",
        ssl: true,
        poolSize: 20
    },
    api: {
        baseUrl: "https://api.example.com/v1",
        timeout: 30000,
        retries: 3,
        rateLimit: {
            requests: 100,
            windowMs: 900000 // 15分
        }
    },
    security: {
        jwt: {
            secret: "your-jwt-secret-key",
            expiresIn: "24h"
        },
        cors: {
            origin: ["https://example.com", "https://admin.example.com"],
            credentials: true
        }
    },
    features: {
        userRegistration: true,
        emailNotifications: true,
        fileUpload: true,
        analytics: false
    }
};

// システム設定の表示
console.log("\n=== システム設定 ===");
console.log(`アプリケーション: ${appConfig.app.name} v${appConfig.app.version}`);
console.log(`環境: ${appConfig.app.environment}`);
console.log(`デバッグ: ${appConfig.app.debug ? "有効" : "無効"}`);
console.log(`データベース: ${appConfig.database.host}:${appConfig.database.port}`);
console.log(`SSL: ${appConfig.database.ssl ? "有効" : "無効"}`);
console.log(`API ベースURL: ${appConfig.api.baseUrl}`);
console.log(`API タイムアウト: ${appConfig.api.timeout}ms`);
console.log(`レート制限: ${appConfig.api.rateLimit.requests}リクエスト/${appConfig.api.rateLimit.windowMs / 60000}分`);

console.log(`\n機能フラグ:`);
Object.entries(appConfig.features).forEach(([key, value]) => {
    console.log(`  ${key}: ${value ? "有効" : "無効"}`);
});

// ===== オブジェクト操作の実用例 =====

// オブジェクトのプロパティ存在チェック
function hasProperty<T extends object>(obj: T, property: string): boolean {
    return property in obj;
}

// オブジェクトのディープコピー（簡易版）
function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// オブジェクトの値を更新
function updateUserPreferences(
    user: typeof userProfile,
    newPreferences: Partial<typeof userProfile.preferences>
): typeof userProfile {
    const updatedUser = deepClone(user);
    updatedUser.preferences = { ...updatedUser.preferences, ...newPreferences };
    return updatedUser;
}

// 商品の在庫を更新
function updateProductStock(
    products: typeof productCatalog,
    productId: number,
    newStock: number
): typeof productCatalog {
    return products.map(product => 
        product.id === productId 
            ? { ...product, stockCount: newStock, inStock: newStock > 0 }
            : product
    );
}

console.log("\n=== オブジェクト操作例 ===");

// ユーザー設定の更新
const updatedUser = updateUserPreferences(userProfile, {
    theme: "light",
    notifications: false
});

console.log("ユーザー設定更新:");
console.log(`  元のテーマ: ${userProfile.preferences.theme}`);
console.log(`  新しいテーマ: ${updatedUser.preferences.theme}`);
console.log(`  元の通知設定: ${userProfile.preferences.notifications}`);
console.log(`  新しい通知設定: ${updatedUser.preferences.notifications}`);

// 在庫更新
const updatedCatalog = updateProductStock(productCatalog, 1003, 5);
const originalProduct = productCatalog.find(p => p.id === 1003);
const updatedProduct = updatedCatalog.find(p => p.id === 1003);

console.log("\n商品在庫更新:");
console.log(`  商品: ${originalProduct?.name}`);
console.log(`  元の在庫: ${originalProduct?.inStock ? originalProduct.stockCount : "在庫なし"}`);
console.log(`  新しい在庫: ${updatedProduct?.inStock ? updatedProduct.stockCount : "在庫なし"}`);

export { 
    userProfile, 
    productCatalog, 
    orderDetails, 
    appConfig,
    updateUserPreferences,
    updateProductStock
};