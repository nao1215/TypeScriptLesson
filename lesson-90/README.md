# Lesson 90: タスク管理アプリケーション

## 学習目標
- リアルタイム機能を持つタスク管理アプリを構築する
- Socket.IOを使ったリアルタイム通信を実装する
- ドラッグ&ドロップ機能による直感的なUI/UXを学ぶ
- チーム協働機能とプロジェクト管理システムを理解する

## 概要

このレッスンでは、企業で実際に使用されるレベルのタスク管理アプリケーションを構築します。リアルタイム更新、ドラッグ&ドロップ、チーム機能などの高度な機能を実装します。

## プロジェクト構造

```
task-management-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── team/
│   │   └── dashboard/
│   ├── api/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── notifications/
│   │   └── socket/
│   └── layout.tsx
├── components/
│   ├── kanban/
│   ├── tasks/
│   ├── projects/
│   └── ui/
├── lib/
│   ├── socket/
│   ├── notifications/
│   └── utils/
└── types/
    └── index.ts
```

## データベース設計

```prisma
// Prisma Schema

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  avatar      String?
  role        Role     @default(MEMBER)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  projects    ProjectMember[]
  createdTasks Task[]  @relation("TaskCreator")
  assignedTasks Task[] @relation("TaskAssignee")
  comments    Comment[]
  notifications Notification[]
  
  @@map("users")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#3b82f6")
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  members     ProjectMember[]
  tasks       Task[]
  columns     Column[]
  
  @@map("projects")
}

model ProjectMember {
  id        String     @id @default(cuid())
  userId    String
  projectId String
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime   @default(now())
  
  user      User       @relation(fields: [userId], references: [id])
  project   Project    @relation(fields: [projectId], references: [id])
  
  @@unique([userId, projectId])
  @@map("project_members")
}

model Column {
  id        String  @id @default(cuid())
  name      String
  order     Int
  color     String  @default("#6b7280")
  projectId String
  
  project   Project @relation(fields: [projectId], references: [id])
  tasks     Task[]
  
  @@map("columns")
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  creatorId   String
  assigneeId  String?
  projectId   String
  columnId    String?
  order       Int        @default(0)
  
  creator     User       @relation("TaskCreator", fields: [creatorId], references: [id])
  assignee    User?      @relation("TaskAssignee", fields: [assigneeId], references: [id])
  project     Project    @relation(fields: [projectId], references: [id])
  column      Column?    @relation(fields: [columnId], references: [id])
  
  comments    Comment[]
  attachments Attachment[]
  labels      TaskLabel[]
  
  @@map("tasks")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  
  authorId  String
  taskId    String
  
  author    User     @relation(fields: [authorId], references: [id])
  task      Task     @relation(fields: [taskId], references: [id])
  
  @@map("comments")
}

enum Role {
  ADMIN
  MEMBER
}

enum ProjectRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## カンバンボード実装

### ドラッグ&ドロップ機能

```tsx
// components/kanban/KanbanBoard.tsx
'use client'

import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { io, Socket } from 'socket.io-client'
import KanbanColumn from './KanbanColumn'
import { Project, Column, Task } from '@/types'

interface KanbanBoardProps {
  project: Project
  initialColumns: Column[]
  initialTasks: Task[]
}

export default function KanbanBoard({ 
  project, 
  initialColumns, 
  initialTasks 
}: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [tasks, setTasks] = useState(initialTasks)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Socket.IO接続
    const socketConnection = io('/api/socket', {
      query: { projectId: project.id }
    })
    
    setSocket(socketConnection)

    // リアルタイム更新の監視
    socketConnection.on('taskMoved', (data) => {
      updateTaskPosition(data.taskId, data.columnId, data.order)
    })

    socketConnection.on('taskUpdated', (updatedTask) => {
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
    })

    socketConnection.on('taskCreated', (newTask) => {
      setTasks(prev => [...prev, newTask])
    })

    return () => {
      socketConnection.disconnect()
    }
  }, [project.id])

  const moveTask = async (taskId: string, targetColumnId: string, targetIndex: number) => {
    // 楽観的更新
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newTasks = tasks.map(t => 
      t.id === taskId 
        ? { ...t, columnId: targetColumnId, order: targetIndex }
        : t
    )
    setTasks(newTasks)

    // サーバーに更新を送信
    try {
      await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: targetColumnId,
          order: targetIndex
        })
      })

      // Socket.IOでリアルタイム更新を他のユーザーに通知
      socket?.emit('taskMoved', {
        taskId,
        columnId: targetColumnId,
        order: targetIndex,
        projectId: project.id
      })
    } catch (error) {
      console.error('Failed to move task:', error)
      // エラー時は元に戻す
      setTasks(tasks)
    }
  }

  const updateTaskPosition = (taskId: string, columnId: string, order: number) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId 
        ? { ...task, columnId, order }
        : task
    ))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(task => task.columnId === column.id)}
            onMoveTask={moveTask}
          />
        ))}
      </div>
    </DndProvider>
  )
}
```

### カンバンカラム

```tsx
// components/kanban/KanbanColumn.tsx
'use client'

import { useDrop } from 'react-dnd'
import TaskCard from './TaskCard'
import { Column, Task } from '@/types'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onMoveTask: (taskId: string, columnId: string, index: number) => void
}

export default function KanbanColumn({ column, tasks, onMoveTask }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string }, monitor) => {
      if (!monitor.didDrop()) {
        onMoveTask(item.id, column.id, tasks.length)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  })

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  return (
    <div
      ref={drop}
      className={`min-w-80 bg-gray-100 rounded-lg p-4 ${
        isOver ? 'bg-gray-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{column.name}</h3>
        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {sortedTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            columnId={column.id}
            onMove={onMoveTask}
          />
        ))}
      </div>

      {/* 新しいタスクを追加するボタン */}
      <button 
        className="w-full mt-3 p-2 text-gray-500 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 hover:text-gray-600"
        onClick={() => {
          // タスク作成モーダルを開く
        }}
      >
        + タスクを追加
      </button>
    </div>
  )
}
```

### タスクカード

```tsx
// components/kanban/TaskCard.tsx
'use client'

import { useDrag, useDrop } from 'react-dnd'
import { useRef } from 'react'
import Image from 'next/image'
import { Task, Priority } from '@/types'

interface TaskCardProps {
  task: Task
  index: number
  columnId: string
  onMove: (taskId: string, columnId: string, index: number) => void
}

const priorityColors = {
  [Priority.LOW]: 'border-l-green-500',
  [Priority.MEDIUM]: 'border-l-yellow-500',
  [Priority.HIGH]: 'border-l-orange-500',
  [Priority.URGENT]: 'border-l-red-500',
}

const priorityLabels = {
  [Priority.LOW]: '低',
  [Priority.MEDIUM]: '中',
  [Priority.HIGH]: '高',
  [Priority.URGENT]: '緊急',
}

export default function TaskCard({ task, index, columnId, onMove }: TaskCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, index, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'TASK',
    hover(item: { id: string; index: number; columnId: string }) {
      if (!ref.current) return
      
      const dragIndex = item.index
      const hoverIndex = index
      const dragColumnId = item.columnId
      const hoverColumnId = columnId

      // 同じタスクの場合は何もしない
      if (dragIndex === hoverIndex && dragColumnId === hoverColumnId) return

      // カード間での移動
      onMove(item.id, hoverColumnId, hoverIndex)
      
      item.index = hoverIndex
      item.columnId = hoverColumnId
    },
  })

  drag(drop(ref))

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg p-4 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
        priorityColors[task.priority]
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {task.title}
        </h4>
        <span className={`text-xs px-2 py-1 rounded ${
          task.priority === Priority.URGENT ? 'bg-red-100 text-red-800' :
          task.priority === Priority.HIGH ? 'bg-orange-100 text-orange-800' :
          task.priority === Priority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.assignee && (
            <Image
              src={task.assignee.avatar || '/default-avatar.png'}
              alt={task.assignee.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          )}
          {task.dueDate && (
            <span className={`text-xs ${
              new Date(task.dueDate) < new Date() 
                ? 'text-red-600' 
                : 'text-gray-500'
            }`}>
              {new Date(task.dueDate).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-gray-400">
          {task.comments?.length > 0 && (
            <span className="text-xs flex items-center">
              💬 {task.comments.length}
            </span>
          )}
          {task.attachments?.length > 0 && (
            <span className="text-xs flex items-center">
              📎 {task.attachments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

## リアルタイム通信

### Socket.IO サーバー設定

```typescript
// lib/socket/socketServer.ts
import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'

let io: SocketIOServer

export function initializeSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ["GET", "POST"]
    }
  })

  // 認証ミドルウェア
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!)
      socket.data.user = user
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const { projectId } = socket.handshake.query
    
    // プロジェクトルームに参加
    if (projectId) {
      socket.join(`project:${projectId}`)
    }

    // タスク移動
    socket.on('taskMoved', (data) => {
      socket.to(`project:${data.projectId}`).emit('taskMoved', data)
    })

    // タスク更新
    socket.on('taskUpdated', (data) => {
      socket.to(`project:${data.projectId}`).emit('taskUpdated', data)
    })

    // タスク作成
    socket.on('taskCreated', (data) => {
      socket.to(`project:${data.projectId}`).emit('taskCreated', data)
    })

    // リアルタイム通知
    socket.on('notification', (data) => {
      socket.to(`user:${data.userId}`).emit('notification', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.user?.id)
    })
  })

  return io
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}
```

## チーム協働機能

### プロジェクトメンバー管理

```tsx
// components/projects/ProjectMembers.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ProjectMember, ProjectRole } from '@/types'
import { useNotification } from '@/contexts/NotificationContext'

interface ProjectMembersProps {
  projectId: string
  members: ProjectMember[]
}

export default function ProjectMembers({ projectId, members }: ProjectMembersProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const { addNotification } = useNotification()

  const inviteMember = async (email: string, role: ProjectRole = ProjectRole.MEMBER) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: '招待を送信しました',
          message: `${email}に招待メールを送信しました`
        })
        setInviteEmail('')
        setIsInviteModalOpen(false)
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: '招待の送信に失敗しました',
        message: 'もう一度お試しください'
      })
    }
  }

  const updateMemberRole = async (memberId: string, newRole: ProjectRole) => {
    try {
      await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      addNotification({
        type: 'success',
        title: 'メンバーの権限を更新しました'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: '権限の更新に失敗しました'
      })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">プロジェクトメンバー</h3>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="btn-primary"
        >
          メンバーを招待
        </button>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <Image
                src={member.user.avatar || '/default-avatar.png'}
                alt={member.user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h4 className="font-medium">{member.user.name}</h4>
                <p className="text-sm text-gray-600">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={member.role}
                onChange={(e) => updateMemberRole(member.id, e.target.value as ProjectRole)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value={ProjectRole.VIEWER}>閲覧者</option>
                <option value={ProjectRole.MEMBER}>メンバー</option>
                <option value={ProjectRole.ADMIN}>管理者</option>
                <option value={ProjectRole.OWNER}>オーナー</option>
              </select>

              <span className="text-xs text-gray-500">
                {new Date(member.joinedAt).toLocaleDateString('ja-JP')}参加
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 招待モーダル */}
      {isInviteModalOpen && (
        <InviteMemberModal
          onInvite={(email, role) => inviteMember(email, role)}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  )
}
```

## 演習問題

1. **タスクフィルタリング**: 担当者、優先度、期限によるフィルタ機能
2. **タイムトラッキング**: タスクの作業時間記録機能
3. **通知システム**: タスク割り当て・更新の通知機能
4. **レポート機能**: プロジェクトの進捗レポート作成

## テスト

```tsx
// __tests__/components/KanbanBoard.test.tsx
import { render, screen } from '@testing-library/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { mockProject, mockColumns, mockTasks } from '@/lib/test-utils'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
)

describe('KanbanBoard', () => {
  it('カンバンボードが正しく表示される', () => {
    render(
      <KanbanBoard
        project={mockProject}
        initialColumns={mockColumns}
        initialTasks={mockTasks}
      />,
      { wrapper: Wrapper }
    )

    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })
})
```

## 実行方法

```bash
# 依存関係のインストール
npm install socket.io socket.io-client react-dnd react-dnd-html5-backend

# データベース設定
npx prisma generate
npx prisma db push

# 開発サーバー起動
npm run dev

# テスト実行
npm test
```

## まとめ

Lesson 86-90では、実践的なWebアプリケーションの構築を通して：
- Eコマースサイト（決済システム、商品管理）
- ブログシステム（コンテンツ管理、SEO）
- ダッシュボード（データ可視化、分析）
- チャットアプリ（リアルタイム通信）
- タスク管理（協働機能、ドラッグ&ドロップ）

これらの知識を活用して、次のフェーズでは高度な機能と最適化について学習します。