import { Course } from '@/types/course'

export const mockCourse: Course = {
  id: 'course-1',
  title: 'React Fundamentals',
  description: 'Master the fundamentals of React including components, hooks, and state management',
  totalLessons: 12,
  completedLessons: 0,
  createdAt: new Date().toISOString(),
  modules: [
    {
      id: 'module-1',
      title: 'Introduction to React',
      description: 'Learn the basics of React and JSX',
      completed: false,
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'What is React?',
          content: `# What is React?

React is a popular JavaScript library for building user interfaces, particularly single-page applications. It was developed by Facebook and is now maintained by Facebook and a community of individual developers and companies.

## Key Features

### 1. Component-Based Architecture
React allows you to build encapsulated components that manage their own state, then compose them to make complex UIs.

### 2. Virtual DOM
React creates a virtual representation of the DOM in memory, which allows it to efficiently update the actual DOM when changes occur.

### 3. Declarative
React makes it painless to create interactive UIs. Design simple views for each state in your application.

## Why Use React?

- **Reusable Components**: Build once, use everywhere
- **Fast Performance**: Virtual DOM ensures optimal rendering
- **Strong Community**: Large ecosystem of libraries and tools
- **Easy to Learn**: Simple API and great documentation

## Example

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

This simple component demonstrates React's declarative nature and JSX syntax.`,
          duration: '10 min',
          completed: false
        },
        {
          id: 'lesson-1-2',
          title: 'Setting up React Environment',
          content: `# Setting up React Environment

Before you start building React applications, you need to set up your development environment properly.

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Code editor (VS Code recommended)

## Installation Steps

### 1. Install Node.js
Download and install Node.js from the official website. This will also install npm.

### 2. Create React App
The easiest way to start a new React project:

\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\`

### 3. Project Structure
\`\`\`
my-app/
  node_modules/
  public/
  src/
    App.js
    index.js
  package.json
\`\`\`

## Development Tools

- **React Developer Tools**: Browser extension for debugging
- **ESLint**: Code quality tool
- **Prettier**: Code formatter

Your app should now be running on http://localhost:3000`,
          duration: '15 min',
          completed: false
        },
        {
          id: 'lesson-1-3',
          title: 'JSX Syntax',
          content: `# JSX Syntax

JSX stands for JavaScript XML. It allows us to write HTML-like code in JavaScript.

## What is JSX?

JSX is a syntax extension for JavaScript that looks similar to HTML. React doesn't require JSX, but it makes code more readable.

## Basic Rules

### 1. Must Return Single Element
\`\`\`jsx
// ✓ Good
return (
  <div>
    <h1>Title</h1>
    <p>Description</p>
  </div>
);

// ✗ Bad
return (
  <h1>Title</h1>
  <p>Description</p>
);
\`\`\`

### 2. JavaScript Expressions
Use curly braces to embed JavaScript:

\`\`\`jsx
const name = "John";
return <h1>Hello, {name}!</h1>;
\`\`\`

### 3. Attributes
Use camelCase for attributes:

\`\`\`jsx
<div className="container" onClick={handleClick}>
  Content
</div>
\`\`\`

## Conditional Rendering

\`\`\`jsx
{isLoggedIn ? <UserDashboard /> : <LoginForm />}
\`\`\`

JSX makes React code more intuitive and easier to debug.`,
          duration: '12 min',
          completed: false
        },
        {
          id: 'lesson-1-4',
          title: 'Components Basics',
          content: `# Components Basics

Components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.

## Types of Components

### 1. Function Components
Modern and recommended approach:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### 2. Arrow Function Components
\`\`\`jsx
const Welcome = (props) => {
  return <h1>Hello, {props.name}</h1>;
};
\`\`\`

## Props

Props are arguments passed to components:

\`\`\`jsx
function UserCard({ name, email, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
\`\`\`

## Component Composition

\`\`\`jsx
function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}
\`\`\`

Components should be small, focused, and reusable.`,
          duration: '18 min',
          completed: false
        }
      ]
    },
    {
      id: 'module-2',
      title: 'React Hooks',
      description: 'Understanding and using React Hooks effectively',
      completed: false,
      lessons: [
        {
          id: 'lesson-2-1',
          title: 'useState Hook',
          content: `# useState Hook

The useState Hook lets you add state to function components.

## Basic Syntax

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## Multiple State Variables

\`\`\`jsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  return (
    <form>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={age} onChange={e => setAge(e.target.value)} />
    </form>
  );
}
\`\`\`

## Object State

\`\`\`jsx
const [user, setUser] = useState({
  name: '',
  email: '',
  age: 0
});

setUser({ ...user, name: 'John' });
\`\`\`

useState is the most commonly used Hook in React.`,
          duration: '20 min',
          completed: false
        },
        {
          id: 'lesson-2-2',
          title: 'useEffect Hook',
          content: `# useEffect Hook

useEffect lets you perform side effects in function components.

## Basic Usage

\`\`\`jsx
import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return <div>{data ? data.title : 'Loading...'}</div>;
}
\`\`\`

## Dependency Array

\`\`\`jsx
// Runs on every render
useEffect(() => {
  console.log('Runs always');
});

// Runs once on mount
useEffect(() => {
  console.log('Runs once');
}, []);

// Runs when count changes
useEffect(() => {
  console.log('Count changed');
}, [count]);
\`\`\`

## Cleanup Function

\`\`\`jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);

  return () => clearInterval(timer);
}, []);
\`\`\`

useEffect is essential for data fetching, subscriptions, and DOM manipulation.`,
          duration: '25 min',
          completed: false
        },
        {
          id: 'lesson-2-3',
          title: 'useContext Hook',
          content: `# useContext Hook

useContext provides a way to pass data through the component tree without prop drilling.

## Creating Context

\`\`\`jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
\`\`\`

## Using Context

\`\`\`jsx
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button 
      style={{ background: theme === 'dark' ? '#333' : '#fff' }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      Toggle Theme
    </button>
  );
}
\`\`\`

## Multiple Contexts

\`\`\`jsx
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <LanguageProvider>
          <MainApp />
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
\`\`\`

Context is perfect for global state like themes, user data, and language preferences.`,
          duration: '22 min',
          completed: false
        },
        {
          id: 'lesson-2-4',
          title: 'Custom Hooks',
          content: `# Custom Hooks

Custom Hooks let you extract component logic into reusable functions.

## Creating Custom Hook

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
\`\`\`

## Using Custom Hook

\`\`\`jsx
function App() {
  const [name, setName] = useLocalStorage('name', '');
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
    </div>
  );
}
\`\`\`

## useWindowSize Hook

\`\`\`jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
\`\`\`

Custom Hooks promote code reuse and separation of concerns.`,
          duration: '28 min',
          completed: false
        }
      ]
    },
    {
      id: 'module-3',
      title: 'State Management',
      description: 'Advanced state management patterns and tools',
      completed: false,
      lessons: [
        {
          id: 'lesson-3-1',
          title: 'Props Drilling Problem',
          content: `# Props Drilling Problem

Props drilling occurs when you pass data through many layers of components.

## The Problem

\`\`\`jsx
function App() {
  const [user, setUser] = useState({ name: 'John' });
  
  return <Level1 user={user} />;
}

function Level1({ user }) {
  return <Level2 user={user} />;
}

function Level2({ user }) {
  return <Level3 user={user} />;
}

function Level3({ user }) {
  return <div>{user.name}</div>;
}
\`\`\`

## Issues

- **Maintenance**: Hard to track data flow
- **Refactoring**: Changing props affects many components
- **Performance**: Unnecessary re-renders

## Solutions

### 1. Context API
Best for global state like theme, auth.

### 2. State Management Libraries
Redux, Zustand, Jotai for complex state.

### 3. Component Composition
\`\`\`jsx
function App() {
  const [user, setUser] = useState({ name: 'John' });
  
  return (
    <Layout>
      <UserProfile user={user} />
    </Layout>
  );
}
\`\`\`

Choose the right solution based on your app's complexity.`,
          duration: '15 min',
          completed: false
        },
        {
          id: 'lesson-3-2',
          title: 'useReducer Hook',
          content: `# useReducer Hook

useReducer is an alternative to useState for complex state logic.

## Basic Syntax

\`\`\`jsx
import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
\`\`\`

## Complex Example

\`\`\`jsx
function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'toggle':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      );
    case 'delete':
      return state.filter(todo => todo.id !== action.id);
    default:
      return state;
  }
}
\`\`\`

## When to Use

- Complex state logic
- Multiple sub-values
- Next state depends on previous

useReducer provides more predictable state updates.`,
          duration: '30 min',
          completed: false
        },
        {
          id: 'lesson-3-3',
          title: 'Context + Reducer Pattern',
          content: `# Context + Reducer Pattern

Combining Context and Reducer creates a powerful state management solution.

## Implementation

\`\`\`jsx
import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    sidebarOpen: true
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
\`\`\`

## Using the Pattern

\`\`\`jsx
function UserProfile() {
  const { state, dispatch } = useApp();

  const updateUser = (user) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  return (
    <div>
      <h1>{state.user?.name}</h1>
      <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
        Toggle Sidebar
      </button>
    </div>
  );
}
\`\`\`

This pattern scales well for medium-sized applications.`,
          duration: '35 min',
          completed: false
        },
        {
          id: 'lesson-3-4',
          title: 'Introduction to Redux',
          content: `# Introduction to Redux

Redux is a predictable state container for JavaScript applications.

## Core Concepts

### 1. Store
Single source of truth for your app state.

### 2. Actions
Plain objects describing what happened.

### 3. Reducers
Pure functions that specify how state changes.

## Redux Toolkit (Modern Approach)

\`\`\`jsx
import { configureStore, createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; },
    decrement: state => { state.value -= 1; },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default store;
\`\`\`

## Using Redux in Components

\`\`\`jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store';

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
\`\`\`

Redux is best for large applications with complex state.`,
          duration: '40 min',
          completed: false
        }
      ]
    }
  ]
}
