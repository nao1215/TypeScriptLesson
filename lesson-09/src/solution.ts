// 演習で使用するenum定義（exercise.tsと同じ）
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
    const colorMap: Record<TaskStatus, string> = {
        [TaskStatus.Todo]: "blue",
        [TaskStatus.InProgress]: "orange",
        [TaskStatus.Review]: "yellow",
        [TaskStatus.Done]: "green",
        [TaskStatus.Cancelled]: "red"
    };
    
    return colorMap[status];
}

export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
        [TaskStatus.Todo]: [TaskStatus.InProgress, TaskStatus.Cancelled],
        [TaskStatus.InProgress]: [TaskStatus.Review, TaskStatus.Done, TaskStatus.Cancelled],
        [TaskStatus.Review]: [TaskStatus.InProgress, TaskStatus.Done, TaskStatus.Cancelled],
        [TaskStatus.Done]: [], // 完了からは遷移不可
        [TaskStatus.Cancelled]: [TaskStatus.Todo]
    };
    
    return validTransitions[from].includes(to);
}

export function getPriorityLevel(priority: Priority): number {
    return priority;
}

export function getNextWorkday(day: Weekday): Weekday {
    const weekdays = [
        Weekday.Monday,
        Weekday.Tuesday,
        Weekday.Wednesday,
        Weekday.Thursday,
        Weekday.Friday
    ];
    
    const currentIndex = weekdays.indexOf(day);
    const nextIndex = (currentIndex + 1) % weekdays.length;
    
    return weekdays[nextIndex];
}

export function calculatePermissions(access: FileAccess[]): FileAccess {
    return access.reduce((combined, permission) => combined | permission, FileAccess.None);
}

function demonstrateSolutions() {
    console.log("=== Lesson 09: 演習問題の解答例 ===\n");

    console.log("1. ステータス色の取得");
    const statuses = Object.values(TaskStatus);
    statuses.forEach(status => {
        console.log(`${status}: ${getStatusColor(status)}`);
    });
    console.log();

    console.log("2. 状態遷移の検証");
    const transitions = [
        [TaskStatus.Todo, TaskStatus.InProgress],
        [TaskStatus.InProgress, TaskStatus.Review],
        [TaskStatus.Review, TaskStatus.Done],
        [TaskStatus.Done, TaskStatus.Todo],
        [TaskStatus.Cancelled, TaskStatus.Todo],
        [TaskStatus.Todo, TaskStatus.Done] // 直接完了への遷移
    ] as const;
    
    transitions.forEach(([from, to]) => {
        const isValid = isValidTransition(from, to);
        console.log(`${from} -> ${to}: ${isValid ? '有効' : '無効'}`);
    });
    console.log();

    console.log("3. 優先度レベルの取得");
    const priorities = Object.values(Priority);
    priorities.forEach(priority => {
        console.log(`${Priority[priority]}: レベル ${getPriorityLevel(priority)}`);
    });
    console.log();

    console.log("4. 次の平日の取得");
    const weekdays = Object.values(Weekday);
    weekdays.forEach(day => {
        const next = getNextWorkday(day);
        console.log(`${day} -> ${next}`);
    });
    console.log();

    console.log("5. 権限の組み合わせ");
    const permissionTests = [
        [],
        [FileAccess.Read],
        [FileAccess.Write],
        [FileAccess.Read, FileAccess.Write],
        [FileAccess.Read, FileAccess.Execute],
        [FileAccess.Read, FileAccess.Write, FileAccess.Execute]
    ];
    
    permissionTests.forEach(permissions => {
        const combined = calculatePermissions(permissions);
        const permissionNames = permissions.map(p => FileAccess[p]).join(" + ");
        console.log(`[${permissionNames || "None"}] = ${combined} (${FileAccess[combined] || "Combined"})`);
    });
    console.log();

    console.log("6. 実用例: タスク管理システム");
    
    interface Task {
        id: string;
        title: string;
        status: TaskStatus;
        priority: Priority;
    }
    
    const tasks: Task[] = [
        { id: "1", title: "データベース設計", status: TaskStatus.Done, priority: Priority.High },
        { id: "2", title: "API実装", status: TaskStatus.InProgress, priority: Priority.Urgent },
        { id: "3", title: "テスト作成", status: TaskStatus.Todo, priority: Priority.Medium },
        { id: "4", title: "ドキュメント更新", status: TaskStatus.Review, priority: Priority.Low }
    ];
    
    console.log("タスク一覧:");
    tasks.forEach(task => {
        const color = getStatusColor(task.status);
        const level = getPriorityLevel(task.priority);
        console.log(`  ${task.title}: ${task.status} (${color}) - 優先度${level}`);
    });
    
    // 状態遷移の例
    console.log("\n状態遷移の例:");
    const task = tasks.find(t => t.status === TaskStatus.Todo);
    if (task) {
        console.log(`"${task.title}" の状態遷移:`);
        console.log(`  現在: ${task.status}`);
        
        if (isValidTransition(task.status, TaskStatus.InProgress)) {
            console.log(`  ${TaskStatus.InProgress} への遷移: 可能`);
        }
        
        if (isValidTransition(task.status, TaskStatus.Done)) {
            console.log(`  ${TaskStatus.Done} への遷移: 不可能（レビューを経る必要があります）`);
        }
    }
}

if (require.main === module) {
    demonstrateSolutions();
}