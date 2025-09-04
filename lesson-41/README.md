# Lesson 41: 非同期処理の基礎 (Asynchronous Programming Basics)

## 学習目標
- 同期処理と非同期処理の違いを理解する
- JavaScript のイベントループの仕組みを学ぶ
- Callback、Promise、async/await の基本的な使い分けを理解する
- 実際のWebアプリケーションで必要な非同期処理パターンを習得する

## 非同期処理とは

### 同期処理 vs 非同期処理

**同期処理（Synchronous）**
- コードが上から順番に実行される
- 一つの処理が完了するまで次の処理は待機する
- ブロッキング処理とも呼ばれる

**非同期処理（Asynchronous）**
- 時間のかかる処理を待たずに次の処理を実行する
- 処理の完了を待たずにプログラムが進行する
- ノンブロッキング処理とも呼ばれる

### なぜ非同期処理が必要か

Webアプリケーションでは以下のような処理で非同期処理が必要です：

1. **APIからのデータ取得**
2. **ファイルの読み書き**
3. **データベースへのアクセス**
4. **ユーザーインタラクション（クリック、入力）**
5. **タイマー処理**

## JavaScriptのイベントループ

### イベントループの仕組み

```
┌───────────────────────────┐
┌─>│           スタック          │
│  └───────────────────────────┘
│  ┌───────────────────────────┐
│  │        Web APIs          │
│  │   - setTimeout           │
│  │   - DOM Events           │
│  │   - HTTP requests        │
│  └───────────────────────────┘
│                      │
│               ┌───────────────────────────┐
│               │       コールバックキュー        │
│               └───────────────────────────┘
│                      │
└──────────────────────┘
       イベントループ
```

### 実行フェーズ
1. **Call Stack**: 現在実行中のコード
2. **Web APIs**: ブラウザが提供するAPI（タイマー、DOM、HTTPなど）
3. **Callback Queue**: 完了したコールバック関数の待機列
4. **Event Loop**: Call Stackが空になったときにCallback Queueから関数を移動

## 非同期処理の3つのパターン

### 1. Callback パターン

最も基本的な非同期処理の方法：

```typescript
function fetchUserData(userId: string, callback: (error: Error | null, data?: any) => void) {
    setTimeout(() => {
        if (userId === "invalid") {
            callback(new Error("User not found"));
        } else {
            callback(null, { id: userId, name: "John Doe" });
        }
    }, 1000);
}

// 使用例
fetchUserData("123", (error, data) => {
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("User data:", data);
    }
});
```

### 2. Promise パターン

より洗練された非同期処理の方法：

```typescript
function fetchUserDataPromise(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId === "invalid") {
                reject(new Error("User not found"));
            } else {
                resolve({ id: userId, name: "John Doe" });
            }
        }, 1000);
    });
}

// 使用例
fetchUserDataPromise("123")
    .then(data => console.log("User data:", data))
    .catch(error => console.error("Error:", error.message));
```

### 3. async/await パターン

最もモダンで読みやすい非同期処理の方法：

```typescript
async function getUserData(userId: string) {
    try {
        const data = await fetchUserDataPromise(userId);
        console.log("User data:", data);
        return data;
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}
```

## 実践的な使用例

### Web APIの呼び出し

```typescript
// 従来のCallback方式
function fetchDataCallback(url: string, callback: (error: Error | null, data?: any) => void) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
        if (xhr.status === 200) {
            callback(null, JSON.parse(xhr.responseText));
        } else {
            callback(new Error(`HTTP Error: ${xhr.status}`));
        }
    };
    xhr.onerror = () => callback(new Error('Network Error'));
    xhr.send();
}

// Promise方式
function fetchDataPromise(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`HTTP Error: ${xhr.status}`));
            }
        };
        xhr.onerror = () => reject(new Error('Network Error'));
        xhr.send();
    });
}

// async/await方式
async function fetchData(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
```

### タイマーとスケジューリング

```typescript
// setTimeout - 一度だけ実行
function delayedExecution(callback: () => void, delay: number) {
    return setTimeout(callback, delay);
}

// setInterval - 定期実行
function periodicExecution(callback: () => void, interval: number) {
    return setInterval(callback, interval);
}

// Promise ベースのタイマー
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用例
async function animationLoop() {
    for (let i = 0; i < 10; i++) {
        console.log(`Frame ${i}`);
        await delay(100); // 100ms待機
    }
}
```

## エラーハンドリング

### 各パターンでのエラーハンドリング

```typescript
// Callback でのエラーハンドリング
function handleCallbackError() {
    fetchUserData("invalid", (error, data) => {
        if (error) {
            // エラー処理
            showErrorMessage(error.message);
            logError(error);
        } else {
            // 成功時の処理
            displayUserData(data);
        }
    });
}

// Promise でのエラーハンドリング
function handlePromiseError() {
    fetchUserDataPromise("invalid")
        .then(data => displayUserData(data))
        .catch(error => {
            showErrorMessage(error.message);
            logError(error);
        })
        .finally(() => {
            hideLoadingSpinner();
        });
}

// async/await でのエラーハンドリング
async function handleAsyncError() {
    try {
        const data = await fetchUserDataPromise("invalid");
        displayUserData(data);
    } catch (error) {
        showErrorMessage(error.message);
        logError(error);
    } finally {
        hideLoadingSpinner();
    }
}
```

## パフォーマンス考慮事項

### 適切な非同期処理の選択

1. **単純な処理**: callback
2. **チェーンが必要**: Promise
3. **複雑な制御フロー**: async/await

### 注意点

- **メモリリーク防止**: タイマーやリスナーの適切なクリーンアップ
- **エラー処理**: 必ず適切なエラーハンドリングを実装
- **レスポンス性**: UIをブロックしない設計

## まとめ

- 非同期処理はWebアプリケーションの基本
- Callback → Promise → async/await の進化を理解
- イベントループの仕組みを把握
- 適切なエラーハンドリングが重要
- パフォーマンスとユーザー体験を考慮した実装

次のLessonでは、Promiseについてより詳しく学習します。

## 参考リンク

- [MDN: Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous)
- [Event Loop の詳細](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [JavaScript.info: Promise](https://javascript.info/promise-basics)