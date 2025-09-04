# Lesson 23: クラスの継承 (Class Inheritance)

## 学習目標
このレッスンでは、TypeScriptにおけるクラスの継承について学びます。

- extends キーワードによる継承
- super キーワードの使用方法
- メソッドオーバーライドの実装
- コンストラクタの継承とsuper呼び出し
- protected修飾子の活用
- 複数インターフェースの実装と継承の組み合わせ

## 内容

### 1. 基本的な継承
```typescript
class Animal {
    protected name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    makeSound(): void {
        console.log("Some generic animal sound");
    }
    
    move(): void {
        console.log(`${this.name} is moving`);
    }
}

class Dog extends Animal {
    private breed: string;
    
    constructor(name: string, breed: string) {
        super(name); // 親クラスのコンストラクタを呼び出し
        this.breed = breed;
    }
    
    // メソッドオーバーライド
    makeSound(): void {
        console.log(`${this.name} barks: Woof!`);
    }
    
    // 子クラス独自のメソッド
    wagTail(): void {
        console.log(`${this.name} wags tail happily`);
    }
}
```

### 2. protected修飾子の活用
```typescript
class Vehicle {
    protected speed: number = 0;
    protected maxSpeed: number;
    
    constructor(maxSpeed: number) {
        this.maxSpeed = maxSpeed;
    }
    
    protected accelerate(): void {
        this.speed = Math.min(this.speed + 10, this.maxSpeed);
    }
    
    getSpeed(): number {
        return this.speed;
    }
}

class Car extends Vehicle {
    private fuel: number = 100;
    
    constructor(maxSpeed: number) {
        super(maxSpeed);
    }
    
    // protected メソッドは子クラスから呼び出し可能
    drive(): void {
        if (this.fuel > 0) {
            this.accelerate();
            this.fuel--;
            console.log(`Driving at ${this.speed} km/h. Fuel: ${this.fuel}%`);
        }
    }
}
```

### 3. 複数レベルの継承
```typescript
class LivingBeing {
    protected age: number = 0;
    
    grow(): void {
        this.age++;
        console.log(`Grew to age ${this.age}`);
    }
}

class Animal extends LivingBeing {
    protected species: string;
    
    constructor(species: string) {
        super();
        this.species = species;
    }
    
    getSpecies(): string {
        return this.species;
    }
}

class Mammal extends Animal {
    private furColor: string;
    
    constructor(species: string, furColor: string) {
        super(species);
        this.furColor = furColor;
    }
    
    getFurColor(): string {
        return this.furColor;
    }
}
```

### 4. インターフェースと継承の組み合わせ
```typescript
interface Flyable {
    fly(): void;
    altitude: number;
}

interface Swimable {
    swim(): void;
    depth: number;
}

class Bird extends Animal implements Flyable {
    altitude: number = 0;
    
    fly(): void {
        this.altitude = 100;
        console.log(`${this.name} is flying at altitude ${this.altitude}m`);
    }
    
    makeSound(): void {
        console.log(`${this.name} chirps`);
    }
}

class Duck extends Bird implements Swimable {
    depth: number = 0;
    
    swim(): void {
        this.depth = 2;
        console.log(`${this.name} is swimming at depth ${this.depth}m`);
    }
    
    makeSound(): void {
        console.log(`${this.name} quacks`);
    }
}
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-23
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 図形クラスの階層構造を設計（Shape → Polygon → Rectangle/Triangle）
2. 従業員管理システム（Employee → Manager → Department）
3. ゲームキャラクター継承システム
4. メディア管理システム（Media → Book/Movie/Music）

## 注意点・ベストプラクティス

### よくある間違い

1. **super()の呼び出し忘れ**
   ```typescript
   class Child extends Parent {
       constructor() {
           // super(); // 忘れやすい！
           // エラー: Must call super() before accessing 'this'
       }
   }
   ```

2. **メソッドオーバーライドの型不整合**
   ```typescript
   class Parent {
       method(arg: string): number { return 0; }
   }
   
   class Child extends Parent {
       // エラー: 型が一致しない
       method(arg: number): string { return ""; }
   }
   ```

3. **private vs protected の誤用**
   ```typescript
   class Parent {
       private secret: string; // 子クラスからアクセス不可
       protected shared: string; // 子クラスからアクセス可能
   }
   ```

### 設計原則

1. **リスコフの置換原則**: 子クラスは親クラスと置換可能であるべき
2. **継承よりコンポジション**: 複雑な関係では継承より組み合わせを優先
3. **適切なアクセス修飾子**: private, protected, public を適切に使い分け

## まとめ

継承は強力な機能ですが、適切に使用することが重要です。継承チェーンが深くなりすぎないよう注意し、インターフェースとの組み合わせで柔軟な設計を心がけましょう。次のレッスンではアクセス修飾子について詳しく学びます。