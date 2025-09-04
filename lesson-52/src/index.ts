/**
 * Lesson 52: 認証と認可 (Authentication & Authorization)
 * 
 * JWT認証、OAuth2、RBAC、セキュリティ機能の包括的な実装
 */

import crypto from 'crypto';

// =============================================================================
// 型定義
// =============================================================================

// ユーザー関連型
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  metadata: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserMetadata {
  loginCount: number;
  lastLoginIP?: string;
  preferences: Record<string, unknown>;
  profile: Record<string, unknown>;
}

// 認証トークン型
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scope?: string[];
}

export interface JWTPayload {
  sub: string; // subject (user id)
  iat: number; // issued at
  exp: number; // expiration time
  aud: string; // audience
  iss: string; // issuer
  jti: string; // JWT ID
  roles: string[];
  permissions: string[];
  [key: string]: unknown;
}

// 認可システム型
export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  description?: string;
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'regex';
  value: unknown;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  hierarchy: number;
  isSystemRole: boolean;
}

// OAuth2関連型
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuth2AuthorizationCode {
  code: string;
  state: string;
  codeVerifier?: string; // PKCE
}

export interface OAuth2TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

// 認証イベント型
export interface AuthEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'permission_check';
  userId?: string;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

// セキュリティポリシー型
export interface SecurityPolicy {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  tokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
}

// =============================================================================
// エラークラス
// =============================================================================

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTH_ERROR'
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public resource: string,
    public action: string,
    public code: string = 'AUTHZ_ERROR'
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(tokenType: 'access' | 'refresh' = 'access') {
    super(`${tokenType} token has expired`, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(reason: string) {
    super(`Invalid token: ${reason}`, 'INVALID_TOKEN');
    this.name = 'InvalidTokenError';
  }
}

// =============================================================================
// JWT ユーティリティ
// =============================================================================

export class JWTManager {
  private secretKey: string;
  private issuer: string;
  private audience: string;

  constructor(secretKey: string, issuer: string, audience: string) {
    this.secretKey = secretKey;
    this.issuer = issuer;
    this.audience = audience;
  }

  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'aud' | 'iss' | 'jti'>, expiresIn: number = 3600): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
      aud: this.audience,
      iss: this.issuer,
      jti: this.generateJTI()
    };

    return this.createJWT(fullPayload);
  }

  verifyToken(token: string): JWTPayload {
    try {
      return this.verifyJWT(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new TokenExpiredError();
        }
        throw new InvalidTokenError(error.message);
      }
      throw new InvalidTokenError('Unknown token verification error');
    }
  }

  refreshToken(refreshToken: string, newExpiresIn: number = 3600): string {
    const payload = this.verifyToken(refreshToken);
    
    // リフレッシュトークンの有効性チェック
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new TokenExpiredError('refresh');
    }

    // 新しいアクセストークンを生成
    return this.generateToken({
      sub: payload.sub,
      roles: payload.roles,
      permissions: payload.permissions
    }, newExpiresIn);
  }

  private createJWT(payload: JWTPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyJWT(token: string): JWTPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerStr, payloadStr, signature] = parts;
    
    // 署名の検証
    const expectedSignature = this.sign(`${headerStr}.${payloadStr}`);
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    // ヘッダーとペイロードのデコード
    const header = JSON.parse(this.base64UrlDecode(headerStr));
    const payload = JSON.parse(this.base64UrlDecode(payloadStr)) as JWTPayload;

    // 基本的な検証
    if (header.alg !== 'HS256') {
      throw new Error('Unsupported algorithm');
    }

    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    if (payload.aud !== this.audience) {
      throw new Error('Invalid audience');
    }

    if (payload.iss !== this.issuer) {
      throw new Error('Invalid issuer');
    }

    return payload;
  }

  private sign(data: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('base64url');
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64url');
  }

  private base64UrlDecode(str: string): string {
    return Buffer.from(str, 'base64url').toString();
  }

  private generateJTI(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}

// =============================================================================
// パスワード管理
// =============================================================================

export class PasswordManager {
  private static readonly SALT_ROUNDS = 12;
  private static readonly PEPPER = process.env.PASSWORD_PEPPER || '';

  static async hash(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    const pepperedPassword = password + this.PEPPER;
    return bcrypt.hash(pepperedPassword, this.SALT_ROUNDS);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    const pepperedPassword = password + this.PEPPER;
    return bcrypt.compare(pepperedPassword, hash);
  }

  static validateStrength(password: string, policy: SecurityPolicy): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < policy.passwordMinLength) {
      errors.push(`Password must be at least ${policy.passwordMinLength} characters long`);
    }

    if (policy.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.passwordRequireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      errors.push('Password must contain at least one symbol');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
}

// =============================================================================
// 認証サービス
// =============================================================================

export class AuthService {
  private jwtManager: JWTManager;
  private users: Map<string, User> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();
  private loginAttempts: Map<string, { count: number; lockedUntil?: Date }> = new Map();
  private eventListeners: Array<(event: AuthEvent) => void> = [];
  private securityPolicy: SecurityPolicy;
  private currentUser: User | null = null;
  private currentTokens: AuthTokens | null = null;

  constructor(
    jwtSecret: string,
    issuer: string = 'auth-service',
    audience: string = 'webapp',
    securityPolicy?: Partial<SecurityPolicy>
  ) {
    this.jwtManager = new JWTManager(jwtSecret, issuer, audience);
    this.securityPolicy = {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      tokenExpiryMinutes: 60,
      refreshTokenExpiryDays: 30,
      requireEmailVerification: true,
      enableTwoFactor: false,
      ...securityPolicy
    };
  }

  // ユーザー登録
  async register(userData: {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    // パスワード強度チェック
    const passwordCheck = PasswordManager.validateStrength(userData.password, this.securityPolicy);
    if (!passwordCheck.isValid) {
      throw new AuthenticationError(`Password validation failed: ${passwordCheck.errors.join(', ')}`, 'WEAK_PASSWORD');
    }

    // 既存ユーザーチェック
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    if (existingUser) {
      throw new AuthenticationError('User already exists', 'USER_EXISTS');
    }

    // パスワードハッシュ化
    const hashedPassword = await PasswordManager.hash(userData.password);

    // ユーザー作成
    const user: User = {
      id: crypto.randomUUID(),
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      roles: [await this.getDefaultRole()],
      permissions: [],
      metadata: {
        loginCount: 0,
        preferences: {},
        profile: {}
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      emailVerified: !this.securityPolicy.requireEmailVerification,
      twoFactorEnabled: false
    };

    this.users.set(user.id, user);
    
    // パスワードを別途保存（実際の実装では暗号化されたストレージを使用）
    this.storeUserPassword(user.id, hashedPassword);

    this.emitEvent({
      type: 'login',
      userId: user.id,
      timestamp: new Date(),
      details: { action: 'register' }
    });

    return user;
  }

  // ログイン
  async login(email: string, password: string, ip?: string, userAgent?: string): Promise<AuthTokens> {
    // レート制限チェック
    this.checkRateLimit(email);

    // ユーザー取得
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user || !user.isActive) {
      this.recordFailedAttempt(email);
      throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // メール認証チェック
    if (this.securityPolicy.requireEmailVerification && !user.emailVerified) {
      throw new AuthenticationError('Email not verified', 'EMAIL_NOT_VERIFIED');
    }

    // パスワード検証
    const storedPasswordHash = this.getUserPassword(user.id);
    if (!storedPasswordHash || !await PasswordManager.verify(password, storedPasswordHash)) {
      this.recordFailedAttempt(email);
      throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // ログイン成功：試行回数リセット
    this.loginAttempts.delete(email);

    // ユーザー情報更新
    user.metadata.loginCount++;
    user.lastLoginAt = new Date();
    if (ip) user.metadata.lastLoginIP = ip;
    user.updatedAt = new Date();

    // トークン生成
    const tokens = this.generateTokens(user);
    
    this.currentUser = user;
    this.currentTokens = tokens;

    this.emitEvent({
      type: 'login',
      userId: user.id,
      timestamp: new Date(),
      ip,
      userAgent,
      details: { success: true }
    });

    return tokens;
  }

  // ログアウト
  logout(refreshToken?: string): void {
    if (refreshToken) {
      // リフレッシュトークンの無効化（実装では RevokedTokens テーブルに追加）
      this.revokeToken(refreshToken);
    }

    const userId = this.currentUser?.id;
    this.currentUser = null;
    this.currentTokens = null;

    this.emitEvent({
      type: 'logout',
      userId,
      timestamp: new Date()
    });
  }

  // トークン更新
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtManager.verifyToken(refreshToken);
      const user = this.users.get(payload.sub);
      
      if (!user || !user.isActive) {
        throw new AuthenticationError('User not found or inactive', 'USER_INACTIVE');
      }

      const newTokens = this.generateTokens(user);
      
      // 古いリフレッシュトークンを無効化
      this.revokeToken(refreshToken);

      this.emitEvent({
        type: 'token_refresh',
        userId: user.id,
        timestamp: new Date()
      });

      return newTokens;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
      }
      throw error;
    }
  }

  // 現在のユーザー取得
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 認証状態チェック
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentTokens !== null;
  }

  // トークン検証
  verifyAccessToken(token: string): User | null {
    try {
      const payload = this.jwtManager.verifyToken(token);
      const user = this.users.get(payload.sub);
      
      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }

  private generateTokens(user: User): AuthTokens {
    const accessTokenExpiry = this.securityPolicy.tokenExpiryMinutes * 60;
    const refreshTokenExpiry = this.securityPolicy.refreshTokenExpiryDays * 24 * 60 * 60;

    const accessToken = this.jwtManager.generateToken({
      sub: user.id,
      roles: user.roles.map(r => r.name),
      permissions: user.permissions.map(p => `${p.resource}:${p.action}`)
    }, accessTokenExpiry);

    const refreshToken = this.jwtManager.generateToken({
      sub: user.id,
      roles: [],
      permissions: []
    }, refreshTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry,
      tokenType: 'Bearer'
    };
  }

  private checkRateLimit(email: string): void {
    const attempt = this.loginAttempts.get(email);
    
    if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AuthenticationError(
        `Account locked. Try again in ${remainingTime} minutes`,
        'ACCOUNT_LOCKED'
      );
    }
  }

  private recordFailedAttempt(email: string): void {
    const attempt = this.loginAttempts.get(email) || { count: 0 };
    attempt.count++;

    if (attempt.count >= this.securityPolicy.maxLoginAttempts) {
      attempt.lockedUntil = new Date(Date.now() + this.securityPolicy.lockoutDuration * 60000);
    }

    this.loginAttempts.set(email, attempt);
  }

  private async getDefaultRole(): Promise<Role> {
    return {
      id: 'user',
      name: 'user',
      displayName: 'User',
      description: 'Default user role',
      permissions: [],
      hierarchy: 1,
      isSystemRole: true
    };
  }

  private storeUserPassword(userId: string, hashedPassword: string): void {
    // 実装では安全なストレージを使用
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`pwd_${userId}`, hashedPassword);
    }
  }

  private getUserPassword(userId: string): string | null {
    // 実装では安全なストレージから取得
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`pwd_${userId}`);
    }
    return null;
  }

  private revokeToken(token: string): void {
    // 実装では無効化されたトークンのリストに追加
    console.log('Token revoked:', token.substring(0, 20) + '...');
  }

  private emitEvent(event: AuthEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in auth event listener:', error);
      }
    });
  }

  // イベントリスナー管理
  addEventListener(listener: (event: AuthEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  // 自動リフレッシュ機能
  enableAutoRefresh(marginMinutes: number = 5): () => void {
    if (!this.currentTokens) {
      throw new Error('No active session');
    }

    const refreshInterval = (this.securityPolicy.tokenExpiryMinutes - marginMinutes) * 60 * 1000;
    
    const intervalId = setInterval(async () => {
      if (this.currentTokens) {
        try {
          this.currentTokens = await this.refreshTokens(this.currentTokens.refreshToken);
        } catch (error) {
          console.error('Auto refresh failed:', error);
          this.logout();
        }
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }
}

// =============================================================================
// 認可サービス
// =============================================================================

export class AuthorizationService {
  private roleHierarchy: Map<string, number> = new Map();

  constructor() {
    this.setupDefaultRoles();
  }

  private setupDefaultRoles(): void {
    this.roleHierarchy.set('user', 1);
    this.roleHierarchy.set('moderator', 5);
    this.roleHierarchy.set('admin', 10);
    this.roleHierarchy.set('superadmin', 15);
  }

  // パーミッションチェック
  can(user: User, resource: string, action: string, context?: Record<string, unknown>): boolean {
    try {
      this.requirePermission(user, resource, action, context);
      return true;
    } catch {
      return false;
    }
  }

  // パーミッション要求（例外を投げる版）
  requirePermission(user: User, resource: string, action: string, context?: Record<string, unknown>): void {
    // 直接パーミッションチェック
    const hasDirectPermission = user.permissions.some(permission => 
      permission.resource === resource && 
      permission.action === action &&
      this.evaluateConditions(permission.conditions, context)
    );

    if (hasDirectPermission) {
      return;
    }

    // ロール経由のパーミッションチェック
    const hasRolePermission = user.roles.some(role =>
      role.permissions.some(permission =>
        permission.resource === resource && 
        permission.action === action &&
        this.evaluateConditions(permission.conditions, context)
      )
    );

    if (hasRolePermission) {
      return;
    }

    // 階層的ロールチェック（上位ロールが下位ロールの権限を継承）
    const userMaxHierarchy = Math.max(...user.roles.map(r => r.hierarchy));
    const hasHierarchicalPermission = user.roles.some(role => {
      if (role.hierarchy < userMaxHierarchy) return false;
      
      return role.permissions.some(permission =>
        permission.resource === resource && 
        (permission.action === action || permission.action === '*') &&
        this.evaluateConditions(permission.conditions, context)
      );
    });

    if (hasHierarchicalPermission) {
      return;
    }

    throw new AuthorizationError(
      `Access denied: insufficient permissions for ${action} on ${resource}`,
      resource,
      action,
      'INSUFFICIENT_PERMISSIONS'
    );
  }

  // ロール確認
  hasRole(user: User, roleName: string): boolean {
    return user.roles.some(role => role.name === roleName);
  }

  // 最小ロール階層確認
  hasMinimumRole(user: User, minimumHierarchy: number): boolean {
    return user.roles.some(role => role.hierarchy >= minimumHierarchy);
  }

  // リソース所有者チェック
  isResourceOwner(user: User, resource: { ownerId?: string; createdBy?: string }): boolean {
    return resource.ownerId === user.id || resource.createdBy === user.id;
  }

  // 条件評価
  private evaluateConditions(conditions?: PermissionCondition[], context?: Record<string, unknown>): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    if (!context) {
      return false;
    }

    return conditions.every(condition => {
      const contextValue = context[condition.field];
      
      switch (condition.operator) {
        case 'eq':
          return contextValue === condition.value;
        case 'ne':
          return contextValue !== condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(contextValue);
        case 'nin':
          return Array.isArray(condition.value) && !condition.value.includes(contextValue);
        case 'gt':
          return typeof contextValue === 'number' && contextValue > (condition.value as number);
        case 'gte':
          return typeof contextValue === 'number' && contextValue >= (condition.value as number);
        case 'lt':
          return typeof contextValue === 'number' && contextValue < (condition.value as number);
        case 'lte':
          return typeof contextValue === 'number' && contextValue <= (condition.value as number);
        case 'regex':
          return typeof contextValue === 'string' && new RegExp(condition.value as string).test(contextValue);
        default:
          return false;
      }
    });
  }

  // パーミッション作成ヘルパー
  createPermission(resource: string, action: string, conditions?: PermissionCondition[]): Permission {
    return {
      id: crypto.randomUUID(),
      resource,
      action,
      conditions,
      description: `${action} permission on ${resource}`
    };
  }

  // ロール作成ヘルパー
  createRole(name: string, displayName: string, permissions: Permission[], hierarchy: number = 1): Role {
    return {
      id: crypto.randomUUID(),
      name,
      displayName,
      description: `${displayName} role`,
      permissions,
      hierarchy,
      isSystemRole: false
    };
  }
}

// =============================================================================
// OAuth2 サービス
// =============================================================================

export class OAuth2Service {
  private config: OAuth2Config;

  constructor(config: OAuth2Config) {
    this.config = config;
  }

  // 認証URLの生成
  generateAuthUrl(state?: string, codeChallenge?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' ')
    });

    if (state) {
      params.append('state', state);
    }

    if (codeChallenge) {
      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    return `${this.config.authUrl}?${params.toString()}`;
  }

  // 認証コードをトークンに交換
  async exchangeCodeForToken(authCode: OAuth2AuthorizationCode): Promise<OAuth2TokenResponse> {
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: authCode.code,
      redirect_uri: this.config.redirectUri
    });

    if (authCode.codeVerifier) {
      tokenData.append('code_verifier', authCode.codeVerifier);
    }

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenData.toString()
    });

    if (!response.ok) {
      throw new AuthenticationError('Token exchange failed', 'OAUTH2_TOKEN_EXCHANGE_FAILED');
    }

    return await response.json();
  }

  // ユーザー情報の取得
  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new AuthenticationError('Failed to fetch user info', 'OAUTH2_USER_INFO_FAILED');
    }

    return await response.json();
  }

  // PKCE用のコードチャレンジ生成
  generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return { codeVerifier, codeChallenge };
  }
}

// =============================================================================
// 使用例
// =============================================================================

export async function demonstrateAuth(): Promise<void> {
  console.log('=== 認証と認可のデモンストレーション ===\n');

  try {
    // 認証サービスの初期化
    const authService = new AuthService(
      'your-jwt-secret-key-here',
      'demo-app',
      'demo-app-users',
      {
        passwordMinLength: 8,
        maxLoginAttempts: 3,
        lockoutDuration: 5
      }
    );

    const authzService = new AuthorizationService();

    console.log('1. ユーザー登録とログイン');
    
    // ユーザー登録
    const newUser = await authService.register({
      email: 'test@example.com',
      password: 'SecurePassword123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    console.log('登録されたユーザー:', {
      id: newUser.id,
      email: newUser.email,
      roles: newUser.roles.map(r => r.name)
    });

    // ログイン
    const tokens = await authService.login('test@example.com', 'SecurePassword123');
    console.log('認証成功:', {
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn
    });

    console.log('\n2. 認可システム');
    
    // パーミッションの作成
    const readPostsPermission = authzService.createPermission('posts', 'read');
    const writePostsPermission = authzService.createPermission('posts', 'write', [{
      field: 'ownerId',
      operator: 'eq',
      value: newUser.id
    }]);

    // ロールの作成
    const writerRole = authzService.createRole('writer', 'Content Writer', [readPostsPermission, writePostsPermission], 3);
    
    // ユーザーにロール付与
    newUser.roles.push(writerRole);

    // 認可チェック
    const canRead = authzService.can(newUser, 'posts', 'read');
    const canWrite = authzService.can(newUser, 'posts', 'write', { ownerId: newUser.id });
    const canDelete = authzService.can(newUser, 'posts', 'delete');

    console.log('パーミッションチェック:', { canRead, canWrite, canDelete });

    console.log('\n3. トークンの更新');
    
    const newTokens = await authService.refreshTokens(tokens.refreshToken);
    console.log('トークン更新成功:', {
      tokenType: newTokens.tokenType,
      expiresIn: newTokens.expiresIn
    });

    console.log('\n4. OAuth2設定例');
    
    const oauth2 = new OAuth2Service({
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      redirectUri: 'http://localhost:3000/auth/callback',
      scope: ['openid', 'profile', 'email'],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
    });

    const { codeVerifier, codeChallenge } = oauth2.generatePKCE();
    const authUrl = oauth2.generateAuthUrl('random-state', codeChallenge);
    console.log('OAuth2認証URL（サンプル）:', authUrl.substring(0, 100) + '...');

    console.log('\n5. セキュリティ機能');
    
    // パスワード強度チェック
    const weakPassword = '123';
    const passwordCheck = PasswordManager.validateStrength(weakPassword, {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      tokenExpiryMinutes: 60,
      refreshTokenExpiryDays: 30,
      requireEmailVerification: true,
      enableTwoFactor: false
    });

    console.log('パスワード強度チェック:', {
      password: weakPassword,
      isValid: passwordCheck.isValid,
      errors: passwordCheck.errors
    });

    // セキュアパスワード生成
    const securePassword = PasswordManager.generateSecurePassword(16);
    console.log('生成されたセキュアパスワード:', securePassword);

    // ログアウト
    authService.logout(tokens.refreshToken);
    console.log('ログアウト完了');

  } catch (error) {
    console.error('認証デモエラー:', (error as Error).message);
  }
}

// デモの実行
if (typeof window === 'undefined') {
  // Node.js環境での実行
  demonstrateAuth();
}