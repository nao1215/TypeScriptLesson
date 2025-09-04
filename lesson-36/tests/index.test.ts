/**
 * Lesson 36: 型推論 (Type Inference) - テストファイル
 */

import { describe, test, expect } from '@jest/globals'

// =============================================================================
// 型推論のテスト
// =============================================================================

describe('Lesson 36: 型推論のテスト', () => {

  // =============================================================================
  // 基本的な型推論のテスト
  // =============================================================================

  describe('基本的な型推論', () => {
    test('プリミティブ型の推論が正常に動作する', () => {
      const str = "hello"
      const num = 42
      const bool = true
      const nullValue = null
      const undefinedValue = undefined
      
      expect(typeof str).toBe('string')
      expect(typeof num).toBe('number')
      expect(typeof bool).toBe('boolean')
      expect(nullValue).toBeNull()
      expect(undefinedValue).toBeUndefined()
    })

    test('配列型の推論が正常に動作する', () => {
      const numbers = [1, 2, 3]
      const strings = ["a", "b", "c"]
      const mixed = [1, "two", true]
      
      expect(Array.isArray(numbers)).toBe(true)
      expect(Array.isArray(strings)).toBe(true)
      expect(Array.isArray(mixed)).toBe(true)
      
      expect(numbers.every(n => typeof n === 'number')).toBe(true)
      expect(strings.every(s => typeof s === 'string')).toBe(true)
    })

    test('オブジェクト型の推論が正常に動作する', () => {
      const user = {
        id: 1,
        name: "Alice",
        email: "alice@example.com"
      }
      
      expect(typeof user.id).toBe('number')
      expect(typeof user.name).toBe('string')
      expect(typeof user.email).toBe('string')
      expect(user.id).toBe(1)
      expect(user.name).toBe("Alice")
    })
  })

  // =============================================================================
  // 関数の型推論のテスト
  // =============================================================================

  describe('関数の型推論', () => {
    test('戻り値型の推論が正常に動作する', () => {
      function add(a: number, b: number) {
        return a + b
      }
      
      function greet(name: string) {
        return `Hello, ${name}!`
      }
      
      const result1 = add(3, 4)
      const result2 = greet("World")
      
      expect(typeof result1).toBe('number')
      expect(typeof result2).toBe('string')
      expect(result1).toBe(7)
      expect(result2).toBe("Hello, World!")
    })

    test('アロー関数の型推論が正常に動作する', () => {
      const multiply = (x: number, y: number) => x * y
      const isEven = (n: number) => n % 2 === 0
      
      const product = multiply(3, 4)
      const evenCheck = isEven(4)
      
      expect(typeof product).toBe('number')
      expect(typeof evenCheck).toBe('boolean')
      expect(product).toBe(12)
      expect(evenCheck).toBe(true)
    })

    test('高階関数の型推論が正常に動作する', () => {
      function createMultiplier(factor: number) {
        return (value: number) => value * factor
      }
      
      const double = createMultiplier(2)
      const triple = createMultiplier(3)
      
      expect(typeof double).toBe('function')
      expect(double(5)).toBe(10)
      expect(triple(4)).toBe(12)
    })
  })

  // =============================================================================
  // コンテキスト型推論のテスト
  // =============================================================================

  describe('コンテキスト型推論', () => {
    test('配列メソッドでの推論が正常に動作する', () => {
      const numbers = [1, 2, 3, 4, 5]
      
      const doubled = numbers.map(n => n * 2)
      const evens = numbers.filter(n => n % 2 === 0)
      const sum = numbers.reduce((acc, n) => acc + n, 0)
      
      expect(Array.isArray(doubled)).toBe(true)
      expect(Array.isArray(evens)).toBe(true)
      expect(typeof sum).toBe('number')
      
      expect(doubled).toEqual([2, 4, 6, 8, 10])
      expect(evens).toEqual([2, 4])
      expect(sum).toBe(15)
    })

    test('Promise での型推論が正常に動作する', async () => {
      const stringPromise = Promise.resolve("hello")
      const numberPromise = Promise.resolve(42)
      
      const stringResult = await stringPromise
      const numberResult = await numberPromise
      
      expect(typeof stringResult).toBe('string')
      expect(typeof numberResult).toBe('number')
      expect(stringResult).toBe("hello")
      expect(numberResult).toBe(42)
    })
  })

  // =============================================================================
  // ジェネリック型推論のテスト
  // =============================================================================

  describe('ジェネリック型推論', () => {
    test('基本的なジェネリック推論が正常に動作する', () => {
      function identity<T>(arg: T): T {
        return arg
      }
      
      const stringValue = identity("hello")
      const numberValue = identity(42)
      const booleanValue = identity(true)
      
      expect(typeof stringValue).toBe('string')
      expect(typeof numberValue).toBe('number')
      expect(typeof booleanValue).toBe('boolean')
      
      expect(stringValue).toBe("hello")
      expect(numberValue).toBe(42)
      expect(booleanValue).toBe(true)
    })

    test('複数の型パラメータの推論が正常に動作する', () => {
      function merge<T, U>(obj1: T, obj2: U): T & U {
        return { ...obj1, ...obj2 }
      }
      
      const person = { name: "Alice", age: 30 }
      const contact = { email: "alice@example.com", phone: "123-456" }
      
      const merged = merge(person, contact)
      
      expect(merged.name).toBe("Alice")
      expect(merged.age).toBe(30)
      expect(merged.email).toBe("alice@example.com")
      expect(merged.phone).toBe("123-456")
    })

    test('制約付きジェネリックの推論が正常に動作する', () => {
      function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
        return obj[key]
      }
      
      const user = { id: 1, name: "Bob", active: true }
      
      const id = getProperty(user, "id")
      const name = getProperty(user, "name")
      const active = getProperty(user, "active")
      
      expect(typeof id).toBe('number')
      expect(typeof name).toBe('string')
      expect(typeof active).toBe('boolean')
      
      expect(id).toBe(1)
      expect(name).toBe("Bob")
      expect(active).toBe(true)
    })
  })

  // =============================================================================
  // コントロールフロー分析と型ナローイングのテスト
  // =============================================================================

  describe('コントロールフロー分析と型ナローイング', () => {
    test('typeof による型ナローイングが正常に動作する', () => {
      function processValue(value: string | number): string {
        if (typeof value === "string") {
          return value.toUpperCase()
        } else {
          return value.toString()
        }
      }
      
      expect(processValue("hello")).toBe("HELLO")
      expect(processValue(42)).toBe("42")
    })

    test('null/undefined チェックによる型ナローイングが正常に動作する', () => {
      function getLength(input: string | null | undefined): number {
        if (input != null) {
          return input.length
        } else {
          return 0
        }
      }
      
      expect(getLength("hello")).toBe(5)
      expect(getLength(null)).toBe(0)
      expect(getLength(undefined)).toBe(0)
    })

    test('in演算子による型ナローイングが正常に動作する', () => {
      interface Bird {
        fly(): string
      }
      
      interface Fish {
        swim(): string
      }
      
      function move(animal: Bird | Fish): string {
        if ("fly" in animal) {
          return animal.fly()
        } else {
          return animal.swim()
        }
      }
      
      const bird: Bird = {
        fly: () => "flying"
      }
      
      const fish: Fish = {
        swim: () => "swimming"
      }
      
      expect(move(bird)).toBe("flying")
      expect(move(fish)).toBe("swimming")
    })

    test('判別可能ユニオンが正常に動作する', () => {
      type Shape = 
        | { kind: "circle"; radius: number }
        | { kind: "rectangle"; width: number; height: number }
      
      function getArea(shape: Shape): number {
        switch (shape.kind) {
          case "circle":
            return Math.PI * shape.radius ** 2
          case "rectangle":
            return shape.width * shape.height
        }
      }
      
      const circle: Shape = { kind: "circle", radius: 5 }
      const rectangle: Shape = { kind: "rectangle", width: 4, height: 3 }
      
      expect(getArea(circle)).toBeCloseTo(78.54, 2)
      expect(getArea(rectangle)).toBe(12)
    })
  })

  // =============================================================================
  // 高度な型推論パターンのテスト
  // =============================================================================

  describe('高度な型推論パターン', () => {
    test('条件付き型での推論が正常に動作する', () => {
      type Flatten<T> = T extends Array<infer U> ? U : T
      
      // 型レベルでのテストなので、実装例での確認
      function flatten<T>(value: T): Flatten<T> {
        if (Array.isArray(value)) {
          return value[0] as Flatten<T>
        }
        return value as Flatten<T>
      }
      
      const flattened1 = flatten([1, 2, 3])
      const flattened2 = flatten("hello")
      
      expect(typeof flattened1).toBe('number')
      expect(typeof flattened2).toBe('string')
      expect(flattened1).toBe(1)
      expect(flattened2).toBe("hello")
    })

    test('タプルの推論が正常に動作する', () => {
      function tuple<T extends readonly unknown[]>(...args: T): T {
        return args
      }
      
      const coords = tuple(10, 20)
      const info = tuple("Alice", 30, true)
      
      expect(coords[0]).toBe(10)
      expect(coords[1]).toBe(20)
      expect(info[0]).toBe("Alice")
      expect(info[1]).toBe(30)
      expect(info[2]).toBe(true)
    })
  })

  // =============================================================================
  // 型ガード関数のテスト
  // =============================================================================

  describe('型ガード関数', () => {
    test('カスタム型ガードが正常に動作する', () => {
      interface Person {
        name: string
        age: number
      }
      
      function isPerson(obj: unknown): obj is Person {
        return typeof obj === "object" &&
               obj !== null &&
               "name" in obj &&
               "age" in obj &&
               typeof (obj as Person).name === "string" &&
               typeof (obj as Person).age === "number"
      }
      
      const validPerson = { name: "Alice", age: 30 }
      const invalidPerson = { name: "Bob", age: "thirty" }
      const notAnObject = "not an object"
      
      expect(isPerson(validPerson)).toBe(true)
      expect(isPerson(invalidPerson)).toBe(false)
      expect(isPerson(notAnObject)).toBe(false)
    })

    test('型ガードを使った処理が正常に動作する', () => {
      function isString(value: unknown): value is string {
        return typeof value === "string"
      }
      
      function processInput(input: unknown): string {
        if (isString(input)) {
          return input.toUpperCase()
        }
        return "Not a string"
      }
      
      expect(processInput("hello")).toBe("HELLO")
      expect(processInput(42)).toBe("Not a string")
      expect(processInput(null)).toBe("Not a string")
    })
  })

  // =============================================================================
  // 実用的なパターンのテスト
  // =============================================================================

  describe('実用的なパターン', () => {
    test('ファクトリーパターンが正常に動作する', () => {
      function createCounter(initial = 0) {
        let count = initial
        
        return {
          get current() { return count },
          increment: () => ++count,
          decrement: () => --count,
          reset: () => { count = initial }
        }
      }
      
      const counter = createCounter(5)
      
      expect(counter.current).toBe(5)
      expect(counter.increment()).toBe(6)
      expect(counter.increment()).toBe(7)
      expect(counter.decrement()).toBe(6)
      counter.reset()
      expect(counter.current).toBe(5)
    })

    test('チェーンメソッドが正常に動作する', () => {
      class Calculator {
        constructor(private value = 0) {}
        
        add(n: number): Calculator {
          this.value += n
          return this
        }
        
        multiply(n: number): Calculator {
          this.value *= n
          return this
        }
        
        get result(): number {
          return this.value
        }
      }
      
      const calc = new Calculator(10)
      const result = calc.add(5).multiply(2).result
      
      expect(result).toBe(30)
    })

    test('型安全なイベントエミッターが正常に動作する', () => {
      type EventMap = {
        'user:login': { userId: number; timestamp: Date }
        'user:logout': { userId: number }
        'data:update': { id: string; changes: Record<string, any> }
      }
      
      class TypedEventEmitter<T extends Record<string, any>> {
        private handlers: { [K in keyof T]?: Array<(data: T[K]) => void> } = {}
        
        on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
          if (!this.handlers[event]) {
            this.handlers[event] = []
          }
          this.handlers[event]!.push(handler)
        }
        
        emit<K extends keyof T>(event: K, data: T[K]): void {
          const handlers = this.handlers[event]
          if (handlers) {
            handlers.forEach(handler => handler(data))
          }
        }
      }
      
      const emitter = new TypedEventEmitter<EventMap>()
      let receivedUserId: number | null = null
      
      emitter.on('user:login', (data) => {
        receivedUserId = data.userId
      })
      
      emitter.emit('user:login', { userId: 123, timestamp: new Date() })
      
      expect(receivedUserId).toBe(123)
    })
  })

  // =============================================================================
  // 推論制御のテスト
  // =============================================================================

  describe('推論制御', () => {
    test('const assertionが正常に動作する', () => {
      const config = {
        apiUrl: "https://api.example.com",
        timeout: 5000
      } as const
      
      // const assertionにより、プロパティがリテラル型として推論される
      expect(config.apiUrl).toBe("https://api.example.com")
      expect(config.timeout).toBe(5000)
    })

    test('型アサーションが正常に動作する', () => {
      const unknownValue: unknown = "hello world"
      const stringValue = unknownValue as string
      
      expect(typeof stringValue).toBe('string')
      expect(stringValue.toUpperCase()).toBe("HELLO WORLD")
    })

    test('明示的な型注釈が正常に動作する', () => {
      const items: string[] = []
      items.push("hello")
      items.push("world")
      
      expect(Array.isArray(items)).toBe(true)
      expect(items).toEqual(["hello", "world"])
      
      // 明示的な型注釈により、空配列でも string[] として扱える
      expect(items.every(item => typeof item === 'string')).toBe(true)
    })
  })
})