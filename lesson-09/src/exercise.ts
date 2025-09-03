// 演習で使用するenum定義
export enum TaskStatus {
    Todo = "todo",
    InProgress = "in_progress",
    Review = "review",
    Done = "done",
    Cancelled = "cancelled"
}

export enum Priority {
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4,
    Critical = 5
}

export enum Weekday {
    Monday = "monday",
    Tuesday = "tuesday",
    Wednesday = "wednesday",
    Thursday = "thursday",
    Friday = "friday"
}

export enum FileAccess {
    None = 0,
    Read = 1 << 0,      // 1
    Write = 1 << 1,     // 2
    Execute = 1 << 2,   // 4
    ReadWrite = Read | Write,  // 3
    All = Read | Write | Execute  // 7
}

export function getStatusColor(status: TaskStatus): string {
    // TODO: タスクステータスに対応する色を返す関数を実装してください
    // 以下の色を使用:
    // Todo: "blue"
    // InProgress: "orange"
    // Review: "yellow"
    // Done: "green"
    // Cancelled: "red"
    // ヒント: switch文またはRecord型のマッピングを使用
    // 例: getStatusColor(TaskStatus.Todo) → "blue"
    // 例: getStatusColor(TaskStatus.Done) → "green"
    throw new Error("Not implemented yet");
}

export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
    // TODO: 状態遷移が有効かどうかをチェックする関数を実装してください
    // 有効な遷移ルール:
    // - Todo -> InProgress, Cancelled
    // - InProgress -> Review, Done, Cancelled
    // - Review -> InProgress, Done, Cancelled
    // - Done -> (遷移不可)
    // - Cancelled -> Todo
    // ヒント: Record<TaskStatus, TaskStatus[]>でルールを定義
    // 例: isValidTransition(TaskStatus.Todo, TaskStatus.InProgress) → true
    // 例: isValidTransition(TaskStatus.Done, TaskStatus.Todo) → false
    throw new Error("Not implemented yet");
}

export function getPriorityLevel(priority: Priority): number {
    // TODO: 優先度の数値レベルを取得する関数を実装してください
    // Priority enumの値をそのまま数値として返す
    // ヒント: enumの値は既に数値なので、そのまま返すだけ
    // 例: getPriorityLevel(Priority.Low) → 1
    // 例: getPriorityLevel(Priority.Critical) → 5
    throw new Error("Not implemented yet");
}

export function getNextWorkday(day: Weekday): Weekday {
    // TODO: 次の平日を取得する関数を実装してください
    // 金曜日の次は月曜日になる（週末をスキップ）
    // ヒント: 配列のindexOf()とmodulo演算子を使用
    // 例: getNextWorkday(Weekday.Monday) → Weekday.Tuesday
    // 例: getNextWorkday(Weekday.Friday) → Weekday.Monday
    throw new Error("Not implemented yet");
}

export function calculatePermissions(access: FileAccess[]): FileAccess {
    // TODO: アクセス権限の配列を組み合わせて、統合された権限を計算する関数を実装してください
    // ビットOR演算を使用してすべての権限を結合
    // ヒント: reduce()とビットOR演算子(|)を使用
    // 例: calculatePermissions([FileAccess.Read, FileAccess.Write]) → FileAccess.ReadWrite (3)
    // 例: calculatePermissions([FileAccess.Read, FileAccess.Execute]) → 5
    // 例: calculatePermissions([]) → FileAccess.None (0)
    throw new Error("Not implemented yet");
}