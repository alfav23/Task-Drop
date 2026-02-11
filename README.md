# Task-Drop

Drag and drop a series of tasks into categories: To-do, In-progress, and Complete.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Project Overview

### Overall Approach
Task Drop is a **drag-and-drop task management application** built with Next.js and React. It uses a **Kanban board pattern** with three columns (To Do, In Progress, Completed) where users can drag tasks between statuses. The app implements **role-based task ownership** where each user only sees tasks they created.

### Key Technologies & Techniques

| Category | Technologies |
|----------|---------------|
| **Framework** | Next.js 16 with React 19 (App Router) |
| **Styling** | SCSS Modules + CSS |
| **Backend/Database** | Firebase (Authentication + Firestore) |
| **Drag & Drop** | dnd-kit library (@dnd-kit/core, sortable, modifiers) |
| **UI Icons** | react-icons (FaTrash, FaEdit, FaEye, FaSearch, etc.) |
| **Language** | TypeScript |
| **Compilation** | Babel React Compiler enabled |

### React Hooks Usage

| Hook | Usage |
|------|-------|
| **useState** | State management for: modal visibility, form inputs (title, content, email, password), tasks arrays (toDoTasks, inProgressTasks, completedTasks), UI toggles (showPassword, sidebarVisible), error/success messages |
| **useEffect** | Auth state initialization, task fetching from Firestore, toast auto-dismiss timers |
| **useContext** | Custom `useAuth()` hook for accessing authenticated user from AuthContext |
| **useDraggable** | (from dnd-kit) Wraps draggable task cards with listeners, attributes, and transform styling |
| **useDroppable** | (from dnd-kit) Makes columns droppable targets with visual feedback (border highlight on hover) |
| **useSensor** | (from dnd-kit) Configures drag activation: TouchSensor (250ms delay), MouseSensor, KeyboardSensor |
| **useRouter** | Navigation between /login, /signup, and /dashboard after auth events |

### Key Concepts & Architecture

#### Authentication Flow
- **AuthContext** provides global user state with `useAuth()` hook
- Firebase Authentication with email/password
- **Signup**: Creates user profile → stores extra data in Firestore `users` collection with displayName
- **Login**: Uses `browserLocalPersistence` to keep users logged in
- **AuthGuard**: Redirects unauthenticated users to `/login`

#### Firestore Data Model
```
tasks collection:
- title, content, createdBy (displayName)
- inProgress (boolean), completed (boolean)
- createdAt (timestamp)

users collection:
- fullName, userName, email, createdAt, photoURL
```

#### Drag & Drop Implementation
- **Query-based filtering**: Each column queries tasks by status flags using Firestore `where()` conditions
- **Collision detection**: `closestCorners` algorithm determines drop zone
- **Modifiers**: `restrictToWindowEdges` prevents dragging outside viewport
- **On drop**: Updates task document with new status flags, then refetches all three columns

#### Component Architecture
- **Draggable**: Wraps task cards, exports drag listeners/attributes, applies 2D transforms
- **Droppable**: Wraps column containers, provides drop target ref, shows visual feedback
- **Modal**: Reusable overlay for add/edit task forms with stopPropagation pattern
- **Toast**: Ephemeral notification component with auto-dismiss (2s default)
- **SideBar**: Search functionality, logout button, collapsible toggle
- **Dashboard**: Main state container managing 3 task states + CRUD operations

#### User Interaction Patterns
- **Drag Sensors**: Multi-input support (touch/mouse/keyboard) with constraints
- **Modal Forms**: Separate modals for creating new tasks and editing existing ones
- **Search**: Real-time task search by title filtered by current user
- **State Transitions**: Tasks move between status columns via drag-and-drop, persisted to Firestore

#### Data Fetching Strategy
- Multiple Firestore queries per user (one per column)
- `useEffect` hooks trigger initial fetches on mount
- **Refetch pattern**: After CRUD operations, all three column queries re-execute to sync UI

### Notable Patterns
✅ **Compound Components**: Draggable/Droppable work together with task data  
✅ **Form Validation**: Signup validates email format, password length (6+ chars)  
✅ **Error Handling**: Try-catch blocks in auth flows with user-friendly error messages  
✅ **Role-Based Access**: Tasks filtered by `createdBy === user.displayName`  
✅ **Optimistic UI**: Form inputs update state immediately while async operations complete  
✅ **Accessibility**: Icons for visual clarity, form labels implicit through placeholders