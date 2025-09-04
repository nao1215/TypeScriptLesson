/**
 * Lesson 48: フォーム処理とバリデーション (Forms & Validation)
 * 型安全なフォーム処理とバリデーションシステムの実装
 */

// ============================================================================
// 1. 基本的な型定義
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldConfig<T = any> {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'file' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  validators?: Validator<T>[];
  asyncValidators?: AsyncValidator<T>[];
  options?: { value: any; label: string }[];
  multiple?: boolean;
  accept?: string; // ファイルタイプ制限
}

export interface FormData {
  [key: string]: any;
}

export type Validator<T = any> = (value: T, formData?: FormData) => ValidationResult;
export type AsyncValidator<T = any> = (value: T, formData?: FormData) => Promise<ValidationResult>;

// ============================================================================
// 2. 基本バリデーター実装
// ============================================================================

export class Validators {
  static required<T>(message: string = 'この項目は必須です'): Validator<T> {
    return (value: T): ValidationResult => {
      const isEmpty = value === null || value === undefined || 
                     (typeof value === 'string' && value.trim() === '') ||
                     (Array.isArray(value) && value.length === 0);
                     
      return {
        isValid: !isEmpty,
        errors: isEmpty ? [message] : []
      };
    };
  }

  static minLength(min: number, message?: string): Validator<string> {
    return (value: string): ValidationResult => {
      const actualMessage = message || `${min}文字以上で入力してください`;
      const isValid = !value || value.length >= min;
      
      return {
        isValid,
        errors: isValid ? [] : [actualMessage]
      };
    };
  }

  static maxLength(max: number, message?: string): Validator<string> {
    return (value: string): ValidationResult => {
      const actualMessage = message || `${max}文字以下で入力してください`;
      const isValid = !value || value.length <= max;
      
      return {
        isValid,
        errors: isValid ? [] : [actualMessage]
      };
    };
  }

  static pattern(regex: RegExp, message: string = '正しい形式で入力してください'): Validator<string> {
    return (value: string): ValidationResult => {
      const isValid = !value || regex.test(value);
      
      return {
        isValid,
        errors: isValid ? [] : [message]
      };
    };
  }

  static email(message: string = '正しいメールアドレスを入力してください'): Validator<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.pattern(emailRegex, message);
  }

  static min(minValue: number, message?: string): Validator<number> {
    return (value: number): ValidationResult => {
      const actualMessage = message || `${minValue}以上の値を入力してください`;
      const numValue = Number(value);
      const isValid = isNaN(numValue) || numValue >= minValue;
      
      return {
        isValid,
        errors: isValid ? [] : [actualMessage]
      };
    };
  }

  static max(maxValue: number, message?: string): Validator<number> {
    return (value: number): ValidationResult => {
      const actualMessage = message || `${maxValue}以下の値を入力してください`;
      const numValue = Number(value);
      const isValid = isNaN(numValue) || numValue <= maxValue;
      
      return {
        isValid,
        errors: isValid ? [] : [actualMessage]
      };
    };
  }

  static custom<T>(validatorFn: (value: T) => boolean, message: string): Validator<T> {
    return (value: T): ValidationResult => {
      const isValid = validatorFn(value);
      return {
        isValid,
        errors: isValid ? [] : [message]
      };
    };
  }

  // 確認用フィールドのバリデーター
  static matches(targetField: string, message: string = '値が一致しません'): Validator<any> {
    return (value: any, formData?: FormData): ValidationResult => {
      if (!formData) {
        return { isValid: true, errors: [] };
      }
      
      const isValid = value === formData[targetField];
      return {
        isValid,
        errors: isValid ? [] : [message]
      };
    };
  }

  // ファイルサイズのバリデーター
  static fileSize(maxSizeBytes: number, message?: string): Validator<File | FileList> {
    return (value: File | FileList): ValidationResult => {
      if (!value) return { isValid: true, errors: [] };
      
      const actualMessage = message || `ファイルサイズは${Math.round(maxSizeBytes / 1024 / 1024)}MB以下にしてください`;
      
      let totalSize = 0;
      if (value instanceof File) {
        totalSize = value.size;
      } else {
        for (let i = 0; i < value.length; i++) {
          totalSize += value[i].size;
        }
      }
      
      const isValid = totalSize <= maxSizeBytes;
      return {
        isValid,
        errors: isValid ? [] : [actualMessage]
      };
    };
  }

  // ファイルタイプのバリデーター
  static fileType(allowedTypes: string[], message?: string): Validator<File | FileList> {
    return (value: File | FileList): ValidationResult => {
      if (!value) return { isValid: true, errors: [] };
      
      const actualMessage = message || `許可されていないファイルタイプです。対応形式: ${allowedTypes.join(', ')}`;
      
      const files = value instanceof File ? [value] : Array.from(value);
      const isValid = files.every(file => 
        allowedTypes.some(type => 
          file.type.match(type) || file.name.toLowerCase().endsWith(type.replace('*', ''))
        )
      );
      
      return {
        isValid,
        errors: isValid ? [] : [actualMessage]
      };
    };
  }
}

// ============================================================================
// 3. 非同期バリデーター例
// ============================================================================

export class AsyncValidators {
  static uniqueEmail(checkUrl: string, message: string = 'このメールアドレスは既に使用されています'): AsyncValidator<string> {
    return async (email: string): Promise<ValidationResult> => {
      if (!email || !Validators.email().isValid) {
        return { isValid: true, errors: [] };
      }

      try {
        const response = await fetch(`${checkUrl}?email=${encodeURIComponent(email)}`);
        const result = await response.json();
        
        return {
          isValid: result.available,
          errors: result.available ? [] : [message]
        };
      } catch (error) {
        console.error('Email validation error:', error);
        return {
          isValid: true,
          errors: [],
          warnings: ['メールアドレスの確認ができませんでした']
        };
      }
    };
  }

  static async validateServer<T>(url: string, fieldName: string, message?: string): Promise<AsyncValidator<T>> {
    return async (value: T): Promise<ValidationResult> => {
      if (!value) return { isValid: true, errors: [] };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [fieldName]: value })
        });
        
        const result = await response.json();
        
        return {
          isValid: result.valid,
          errors: result.valid ? [] : [message || result.message || 'バリデーションに失敗しました']
        };
      } catch (error) {
        console.error('Server validation error:', error);
        return {
          isValid: true,
          errors: [],
          warnings: ['サーバーでの検証ができませんでした']
        };
      }
    };
  }
}

// ============================================================================
// 4. フォームフィールドクラス
// ============================================================================

export class FormField<T = any> {
  private _value: T;
  private _errors: string[] = [];
  private _warnings: string[] = [];
  private _touched: boolean = false;
  private _validating: boolean = false;
  private _valid: boolean = true;
  private debounceTimer: number | null = null;

  constructor(
    public readonly config: FieldConfig<T>,
    initialValue?: T
  ) {
    this._value = initialValue ?? ('' as any);
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    this._value = newValue;
    this._touched = true;
    this.debouncedValidate();
  }

  get errors(): string[] {
    return [...this._errors];
  }

  get warnings(): string[] {
    return [...this._warnings];
  }

  get touched(): boolean {
    return this._touched;
  }

  get validating(): boolean {
    return this._validating;
  }

  get valid(): boolean {
    return this._valid && this._errors.length === 0;
  }

  get invalid(): boolean {
    return !this.valid;
  }

  private debouncedValidate(delay: number = 300): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.validate();
    }, delay);
  }

  async validate(formData?: FormData): Promise<ValidationResult> {
    this._validating = true;
    this._errors = [];
    this._warnings = [];

    // 同期バリデーション
    if (this.config.validators) {
      for (const validator of this.config.validators) {
        const result = validator(this._value, formData);
        if (!result.isValid) {
          this._errors.push(...result.errors);
        }
        if (result.warnings) {
          this._warnings.push(...result.warnings);
        }
      }
    }

    // 非同期バリデーション
    if (this.config.asyncValidators && this._errors.length === 0) {
      for (const asyncValidator of this.config.asyncValidators) {
        try {
          const result = await asyncValidator(this._value, formData);
          if (!result.isValid) {
            this._errors.push(...result.errors);
          }
          if (result.warnings) {
            this._warnings.push(...result.warnings);
          }
        } catch (error) {
          console.error('Async validation error:', error);
          this._warnings.push('バリデーション処理でエラーが発生しました');
        }
      }
    }

    this._valid = this._errors.length === 0;
    this._validating = false;

    return {
      isValid: this._valid,
      errors: this._errors,
      warnings: this._warnings
    };
  }

  markAsTouched(): void {
    this._touched = true;
  }

  markAsUntouched(): void {
    this._touched = false;
  }

  reset(value?: T): void {
    this._value = value ?? ('' as any);
    this._errors = [];
    this._warnings = [];
    this._touched = false;
    this._valid = true;
    this._validating = false;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

// ============================================================================
// 5. フォームクラス
// ============================================================================

export interface FormOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceDelay?: number;
}

export class Form {
  private fields = new Map<string, FormField>();
  private _submitting = false;
  private _submitted = false;
  private _valid = true;
  private _errors: string[] = [];
  private changeListeners: Array<() => void> = [];

  constructor(
    private fieldConfigs: FieldConfig[],
    private options: FormOptions = {}
  ) {
    this.options = {
      validateOnChange: true,
      validateOnBlur: true,
      debounceDelay: 300,
      ...options
    };

    this.initializeFields();
  }

  private initializeFields(): void {
    this.fieldConfigs.forEach(config => {
      const field = new FormField(config);
      this.fields.set(config.name, field);
    });
  }

  getField<T = any>(name: string): FormField<T> | undefined {
    return this.fields.get(name) as FormField<T>;
  }

  getValue<T = any>(name: string): T | undefined {
    return this.getField<T>(name)?.value;
  }

  setValue<T = any>(name: string, value: T): void {
    const field = this.getField<T>(name);
    if (field) {
      field.value = value;
      this.notifyChange();
    }
  }

  getValues(): FormData {
    const values: FormData = {};
    this.fields.forEach((field, name) => {
      values[name] = field.value;
    });
    return values;
  }

  setValues(values: Partial<FormData>): void {
    Object.entries(values).forEach(([name, value]) => {
      this.setValue(name, value);
    });
  }

  get valid(): boolean {
    return this._valid && Array.from(this.fields.values()).every(field => field.valid);
  }

  get invalid(): boolean {
    return !this.valid;
  }

  get submitting(): boolean {
    return this._submitting;
  }

  get submitted(): boolean {
    return this._submitted;
  }

  get errors(): string[] {
    const fieldErrors = Array.from(this.fields.values())
      .flatMap(field => field.errors);
    return [...this._errors, ...fieldErrors];
  }

  async validate(): Promise<ValidationResult> {
    const formData = this.getValues();
    const validationPromises = Array.from(this.fields.values())
      .map(field => field.validate(formData));

    const results = await Promise.all(validationPromises);
    
    this._valid = results.every(result => result.isValid);

    return {
      isValid: this._valid,
      errors: this.errors,
      warnings: Array.from(this.fields.values())
        .flatMap(field => field.warnings)
    };
  }

  async submit<T = any>(submitFn: (values: FormData) => Promise<T>): Promise<T> {
    this._submitting = true;
    this._errors = [];

    try {
      // すべてのフィールドをtouchedにマーク
      this.fields.forEach(field => field.markAsTouched());

      // バリデーション実行
      const validationResult = await this.validate();
      
      if (!validationResult.isValid) {
        throw new Error('フォームにエラーがあります');
      }

      // 送信処理
      const result = await submitFn(this.getValues());
      this._submitted = true;
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        this._errors.push(error.message);
      } else {
        this._errors.push('送信に失敗しました');
      }
      throw error;
    } finally {
      this._submitting = false;
      this.notifyChange();
    }
  }

  reset(): void {
    this.fields.forEach(field => field.reset());
    this._submitting = false;
    this._submitted = false;
    this._valid = true;
    this._errors = [];
    this.notifyChange();
  }

  onChange(listener: () => void): () => void {
    this.changeListeners.push(listener);
    
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  private notifyChange(): void {
    this.changeListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Form change listener error:', error);
      }
    });
  }
}

// ============================================================================
// 6. ファイルアップロード処理
// ============================================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  fieldName?: string;
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export class FileUploader {
  private abortController: AbortController | null = null;

  async upload(file: File, options: UploadOptions): Promise<any> {
    const {
      url,
      method = 'POST',
      headers = {},
      fieldName = 'file',
      onProgress,
      onError,
      maxFileSize,
      allowedTypes
    } = options;

    // ファイル検証
    if (maxFileSize && file.size > maxFileSize) {
      const error = new Error(`ファイルサイズが上限（${Math.round(maxFileSize / 1024 / 1024)}MB）を超えています`);
      onError?.(error);
      throw error;
    }

    if (allowedTypes && !allowedTypes.some(type => 
      file.type.match(type) || file.name.toLowerCase().endsWith(type.replace('*', ''))
    )) {
      const error = new Error(`許可されていないファイルタイプです: ${file.type}`);
      onError?.(error);
      throw error;
    }

    // FormData作成
    const formData = new FormData();
    formData.append(fieldName, file);

    // XMLHttpRequestでプログレス監視
    this.abortController = new AbortController();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          const error = new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
          onError?.(error);
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        const error = new Error('Upload failed');
        onError?.(error);
        reject(error);
      });

      xhr.addEventListener('abort', () => {
        const error = new Error('Upload cancelled');
        onError?.(error);
        reject(error);
      });

      // アボートシグナル
      this.abortController?.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      xhr.open(method, url);
      
      // ヘッダー設定
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// ============================================================================
// 7. 使用例とデモンストレーション
// ============================================================================

export function createUserRegistrationForm(): Form {
  const fieldConfigs: FieldConfig[] = [
    {
      name: 'username',
      type: 'text',
      label: 'ユーザー名',
      required: true,
      validators: [
        Validators.required(),
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/, 'ユーザー名は英数字とアンダースコアのみ使用可能です')
      ]
    },
    {
      name: 'email',
      type: 'email',
      label: 'メールアドレス',
      required: true,
      validators: [
        Validators.required(),
        Validators.email()
      ],
      asyncValidators: [
        AsyncValidators.uniqueEmail('/api/check-email')
      ]
    },
    {
      name: 'password',
      type: 'password',
      label: 'パスワード',
      required: true,
      validators: [
        Validators.required(),
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'パスワードは大文字、小文字、数字を含む必要があります'
        )
      ]
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'パスワード確認',
      required: true,
      validators: [
        Validators.required(),
        Validators.matches('password', 'パスワードが一致しません')
      ]
    },
    {
      name: 'age',
      type: 'number',
      label: '年齢',
      required: true,
      validators: [
        Validators.required(),
        Validators.min(18, '18歳以上である必要があります'),
        Validators.max(120, '正しい年齢を入力してください')
      ]
    },
    {
      name: 'avatar',
      type: 'file',
      label: 'プロフィール画像',
      accept: 'image/*',
      validators: [
        Validators.fileSize(2 * 1024 * 1024), // 2MB
        Validators.fileType(['image/jpeg', 'image/png', 'image/gif'])
      ]
    }
  ];

  return new Form(fieldConfigs, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceDelay: 500
  });
}

export async function demonstrateFormValidation(): Promise<void> {
  console.log('=== Lesson 48: Form Validation Demonstration ===');

  try {
    // 1. フォーム作成
    console.log('\n1. Creating user registration form...');
    const form = createUserRegistrationForm();

    // 2. 値設定とバリデーション
    console.log('\n2. Setting form values...');
    form.setValue('username', 'user123');
    form.setValue('email', 'user@example.com');
    form.setValue('password', 'Password123');
    form.setValue('confirmPassword', 'Password123');
    form.setValue('age', 25);

    // 3. バリデーション実行
    console.log('\n3. Validating form...');
    const validationResult = await form.validate();
    console.log('Validation result:', validationResult);
    console.log('Form is valid:', form.valid);

    // 4. 無効な値でのテスト
    console.log('\n4. Testing with invalid values...');
    form.setValue('email', 'invalid-email');
    form.setValue('confirmPassword', 'different-password');
    
    const invalidResult = await form.validate();
    console.log('Validation errors:', invalidResult.errors);

    // 5. ファイルアップロードのデモ
    console.log('\n5. File upload demo...');
    const uploader = new FileUploader();
    console.log('File uploader created (would upload to real endpoint in production)');

    console.log('\nForm validation demonstration completed!');

  } catch (error) {
    console.error('Demo error:', error);
  }
}

// エクスポート
export {
  Form,
  FormField,
  FileUploader
};