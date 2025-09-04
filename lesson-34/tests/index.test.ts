/**
 * Lesson 34: マップ型 (Mapped Types) - テストファイル
 */

import { describe, test, expect } from '@jest/globals'

// =============================================================================
// 型定義のテスト
// =============================================================================

describe('Lesson 34: マップ型のテスト', () => {
  
  // テスト用の基本型
  type User = {
    id: number
    name: string
    email: string
    age: number
  }

  // =============================================================================
  // 基本的なマップ型のテスト
  // =============================================================================

  describe('基本的なマップ型', () => {
    test('StringifyAll型が正常に動作する', () => {
      type StringifyAll<T> = {
        [K in keyof T]: string
      }
      
      type StringUser = StringifyAll<User>
      
      const stringUser: StringUser = {
        id: "1",
        name: "John",
        email: "john@example.com",
        age: "30"
      }
      
      // 型チェックが通ることを確認
      expect(typeof stringUser.id).toBe('string')
      expect(typeof stringUser.name).toBe('string')
      expect(typeof stringUser.email).toBe('string')
      expect(typeof stringUser.age).toBe('string')
    })

    test('Pick型の実装が正常に動作する', () => {
      type CustomPick<T, K extends keyof T> = {
        [P in K]: T[P]
      }
      
      type UserBasicInfo = CustomPick<User, "name" | "email">
      
      const userBasicInfo: UserBasicInfo = {
        name: "Alice",
        email: "alice@example.com"
      }
      
      expect(userBasicInfo.name).toBe("Alice")
      expect(userBasicInfo.email).toBe("alice@example.com")
      
      // idとageプロパティは存在しないことを確認
      expect('id' in userBasicInfo).toBe(false)
      expect('age' in userBasicInfo).toBe(false)
    })
  })

  // =============================================================================
  // 修飾子操作のテスト
  // =============================================================================

  describe('修飾子操作', () => {
    test('Partial型の実装が正常に動作する', () => {
      type CustomPartial<T> = {
        [K in keyof T]?: T[K]
      }
      
      type PartialUser = CustomPartial<User>
      
      const partialUser1: PartialUser = {
        name: "Bob"
      }
      
      const partialUser2: PartialUser = {}
      
      expect(partialUser1.name).toBe("Bob")
      expect(Object.keys(partialUser2)).toHaveLength(0)
    })

    test('Required型の実装が正常に動作する', () => {
      type CustomRequired<T> = {
        [K in keyof T]-?: T[K]
      }
      
      type OptionalUser = {
        id?: number
        name?: string
        email?: string
      }
      
      type RequiredUser = CustomRequired<OptionalUser>
      
      const requiredUser: RequiredUser = {
        id: 1,
        name: "Charlie",
        email: "charlie@example.com"
      }
      
      expect(requiredUser.id).toBe(1)
      expect(requiredUser.name).toBe("Charlie")
      expect(requiredUser.email).toBe("charlie@example.com")
    })
  })

  // =============================================================================
  // 条件付きマッピングのテスト
  // =============================================================================

  describe('条件付きマッピング', () => {
    test('文字列プロパティのnull許可が正常に動作する', () => {
      type NullableStrings<T> = {
        [K in keyof T]: T[K] extends string ? T[K] | null : T[K]
      }
      
      type NullableUser = NullableStrings<User>
      
      const nullableUser: NullableUser = {
        id: 1,
        name: null, // 文字列なのでnullが許可される
        email: "test@example.com",
        age: 30
      }
      
      expect(nullableUser.id).toBe(1)
      expect(nullableUser.name).toBeNull()
      expect(nullableUser.email).toBe("test@example.com")
      expect(nullableUser.age).toBe(30)
    })

    test('数値プロパティのみ抽出が正常に動作する', () => {
      type NumbersOnly<T> = {
        [K in keyof T as T[K] extends number ? K : never]: T[K]
      }
      
      type UserNumbers = NumbersOnly<User>
      
      const userNumbers: UserNumbers = {
        id: 1,
        age: 30
      }
      
      expect(userNumbers.id).toBe(1)
      expect(userNumbers.age).toBe(30)
      expect('name' in userNumbers).toBe(false)
      expect('email' in userNumbers).toBe(false)
    })
  })

  // =============================================================================
  // キー変換のテスト
  // =============================================================================

  describe('キー変換', () => {
    test('プレフィックス追加が正常に動作する', () => {
      type Prefix<T, P extends string> = {
        [K in keyof T as `${P}${string & K}`]: T[K]
      }
      
      type PrefixedUser = Prefix<User, "user_">
      
      const prefixedUser: PrefixedUser = {
        user_id: 1,
        user_name: "Dave",
        user_email: "dave@example.com",
        user_age: 35
      }
      
      expect(prefixedUser.user_id).toBe(1)
      expect(prefixedUser.user_name).toBe("Dave")
      expect(prefixedUser.user_email).toBe("dave@example.com")
      expect(prefixedUser.user_age).toBe(35)
    })

    test('Getter/Setter生成が正常に動作する', () => {
      type Getters<T> = {
        [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
      }
      
      type Setters<T> = {
        [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
      }
      
      // 型テスト用のクラス実装
      class UserAccessor implements Getters<User> & Setters<User> {
        private data: User = { id: 0, name: "", email: "", age: 0 }
        
        getId = (): number => this.data.id
        getName = (): string => this.data.name
        getEmail = (): string => this.data.email
        getAge = (): number => this.data.age
        
        setId = (value: number): void => { this.data.id = value }
        setName = (value: string): void => { this.data.name = value }
        setEmail = (value: string): void => { this.data.email = value }
        setAge = (value: number): void => { this.data.age = value }
      }
      
      const accessor = new UserAccessor()
      
      accessor.setId(1)
      accessor.setName("Eve")
      accessor.setEmail("eve@example.com")
      accessor.setAge(28)
      
      expect(accessor.getId()).toBe(1)
      expect(accessor.getName()).toBe("Eve")
      expect(accessor.getEmail()).toBe("eve@example.com")
      expect(accessor.getAge()).toBe(28)
    })
  })

  // =============================================================================
  // APIレスポンス型のテスト
  // =============================================================================

  describe('実用的なユーティリティ型', () => {
    test('APIレスポンス型が正常に動作する', () => {
      type ApiResponse<T> = {
        [K in keyof T]: {
          data: T[K]
          loading: boolean
          error: string | null
        }
      }
      
      type UserApiResponse = ApiResponse<User>
      
      const userApiResponse: UserApiResponse = {
        id: { data: 1, loading: false, error: null },
        name: { data: "Frank", loading: false, error: null },
        email: { data: "frank@example.com", loading: false, error: null },
        age: { data: 25, loading: true, error: "Loading..." }
      }
      
      expect(userApiResponse.id.data).toBe(1)
      expect(userApiResponse.id.loading).toBe(false)
      expect(userApiResponse.id.error).toBeNull()
      
      expect(userApiResponse.name.data).toBe("Frank")
      expect(userApiResponse.age.loading).toBe(true)
      expect(userApiResponse.age.error).toBe("Loading...")
    })

    test('フォームフィールド型が正常に動作する', () => {
      type FormField<T> = {
        value: T
        touched: boolean
        error?: string
      }
      
      type FormFields<T> = {
        [K in keyof T]: FormField<T[K]>
      }
      
      type UserForm = FormFields<User>
      
      const userForm: UserForm = {
        id: { value: 1, touched: false },
        name: {
          value: "Grace",
          touched: true,
          error: undefined
        },
        email: {
          value: "invalid-email",
          touched: true,
          error: "有効なメールアドレスを入力してください"
        },
        age: { value: 30, touched: false }
      }
      
      expect(userForm.id.value).toBe(1)
      expect(userForm.id.touched).toBe(false)
      
      expect(userForm.name.value).toBe("Grace")
      expect(userForm.name.touched).toBe(true)
      expect(userForm.name.error).toBeUndefined()
      
      expect(userForm.email.error).toBe("有効なメールアドレスを入力してください")
    })
  })

  // =============================================================================
  // 再帰的マップ型のテスト
  // =============================================================================

  describe('再帰的マップ型', () => {
    test('DeepReadonly型が正常に動作する', () => {
      type DeepReadonly<T> = {
        readonly [K in keyof T]: T[K] extends object
          ? T[K] extends Function
            ? T[K]
            : DeepReadonly<T[K]>
          : T[K]
      }
      
      type Profile = {
        user: User
        settings: {
          theme: string
          notifications: {
            email: boolean
            push: boolean
          }
        }
      }
      
      type ReadonlyProfile = DeepReadonly<Profile>
      
      const readonlyProfile: ReadonlyProfile = {
        user: {
          id: 1,
          name: "Henry",
          email: "henry@example.com",
          age: 40
        },
        settings: {
          theme: "dark",
          notifications: {
            email: true,
            push: false
          }
        }
      }
      
      // 値の確認
      expect(readonlyProfile.user.id).toBe(1)
      expect(readonlyProfile.user.name).toBe("Henry")
      expect(readonlyProfile.settings.theme).toBe("dark")
      expect(readonlyProfile.settings.notifications.email).toBe(true)
      expect(readonlyProfile.settings.notifications.push).toBe(false)
      
      // TypeScriptの型チェックにより、以下はコンパイルエラーになる
      // readonlyProfile.user.name = "New Name" // エラー
      // readonlyProfile.settings.theme = "light" // エラー
      // readonlyProfile.settings.notifications.email = false // エラー
    })
  })

  // =============================================================================
  // 高度なパターンのテスト
  // =============================================================================

  describe('高度なパターン', () => {
    test('配列化が正常に動作する', () => {
      type Arrayify<T> = {
        [K in keyof T]: T[K][]
      }
      
      type ArrayUser = Arrayify<User>
      
      const arrayUser: ArrayUser = {
        id: [1, 2, 3],
        name: ["Alice", "Bob"],
        email: ["alice@example.com", "bob@example.com"],
        age: [25, 30, 35]
      }
      
      expect(Array.isArray(arrayUser.id)).toBe(true)
      expect(Array.isArray(arrayUser.name)).toBe(true)
      expect(arrayUser.id).toEqual([1, 2, 3])
      expect(arrayUser.name).toEqual(["Alice", "Bob"])
      expect(arrayUser.email).toEqual(["alice@example.com", "bob@example.com"])
      expect(arrayUser.age).toEqual([25, 30, 35])
    })

    test('Promise化が正常に動作する', async () => {
      type Promisify<T> = {
        [K in keyof T]: Promise<T[K]>
      }
      
      type AsyncUser = Promisify<User>
      
      const asyncUser: AsyncUser = {
        id: Promise.resolve(1),
        name: Promise.resolve("Iris"),
        email: Promise.resolve("iris@example.com"),
        age: Promise.resolve(32)
      }
      
      const resolvedId = await asyncUser.id
      const resolvedName = await asyncUser.name
      const resolvedEmail = await asyncUser.email
      const resolvedAge = await asyncUser.age
      
      expect(resolvedId).toBe(1)
      expect(resolvedName).toBe("Iris")
      expect(resolvedEmail).toBe("iris@example.com")
      expect(resolvedAge).toBe(32)
    })
  })

  // =============================================================================
  // 型レベル関数のテスト
  // =============================================================================

  describe('型レベル関数', () => {
    test('型レベルでの文字列操作が正常に動作する', () => {
      // CamelCase to snake_case conversion
      type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
        ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnake<U>}`
        : S

      type TestCamelToSnake = CamelToSnake<"helloWorld"> // "hello_World" (簡略実装のため)
      
      // 実際の使用例
      type CamelKeys = {
        firstName: string
        lastName: string
        emailAddress: string
      }
      
      // キー変換の実例
      type ConvertedKeys = {
        [K in keyof CamelKeys as K extends string ? Lowercase<K> : K]: CamelKeys[K]
      }
      
      const convertedObj: ConvertedKeys = {
        firstname: "John",
        lastname: "Doe", 
        emailaddress: "john@example.com"
      }
      
      expect(convertedObj.firstname).toBe("John")
      expect(convertedObj.lastname).toBe("Doe")
      expect(convertedObj.emailaddress).toBe("john@example.com")
    })
  })

  // =============================================================================
  // エラーハンドリングパターンのテスト
  // =============================================================================

  describe('エラーハンドリングパターン', () => {
    test('Result型パターンが正常に動作する', () => {
      type Success<T> = { success: true; data: T }
      type Error<E> = { success: false; error: E }
      type Result<T, E = string> = Success<T> | Error<E>
      
      type ResultFields<T> = {
        [K in keyof T]: Result<T[K]>
      }
      
      type UserResultFields = ResultFields<User>
      
      const userResults: UserResultFields = {
        id: { success: true, data: 1 },
        name: { success: true, data: "Jack" },
        email: { success: false, error: "Invalid email format" },
        age: { success: true, data: 28 }
      }
      
      expect(userResults.id.success).toBe(true)
      if (userResults.id.success) {
        expect(userResults.id.data).toBe(1)
      }
      
      expect(userResults.email.success).toBe(false)
      if (!userResults.email.success) {
        expect(userResults.email.error).toBe("Invalid email format")
      }
    })
  })

  // =============================================================================
  // パフォーマンステスト
  // =============================================================================

  describe('パフォーマンス', () => {
    test('大きなオブジェクトでのマップ型処理', () => {
      // 大きなオブジェクトタイプの定義
      type LargeObject = {
        field1: string; field2: number; field3: boolean; field4: string
        field5: number; field6: boolean; field7: string; field8: number
        field9: boolean; field10: string; field11: number; field12: boolean
        field13: string; field14: number; field15: boolean; field16: string
        field17: number; field18: boolean; field19: string; field20: number
      }
      
      type OptionalLarge = {
        [K in keyof LargeObject]?: LargeObject[K]
      }
      
      const partialLarge: OptionalLarge = {
        field1: "test",
        field10: "another test",
        field20: 100
      }
      
      expect(partialLarge.field1).toBe("test")
      expect(partialLarge.field10).toBe("another test") 
      expect(partialLarge.field20).toBe(100)
      expect(Object.keys(partialLarge)).toHaveLength(3)
    })
  })
})