"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
  status: 'active' | 'completed' | 'on-hold';
  teamMembers: string[];
  tasks: string[];
  createdAt: string;
  description?: string;
}

interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo: string;
  estimatedHours?: number;
  createdAt: string;
}

interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId: string;
  startTime: string;
  endTime?: string | null;
  duration: number; // in seconds
  description: string;
  isRunning: boolean;
  billable: boolean;
  rate?: number;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
  createdAt: string;
}

interface DataState {
  users: User[];
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  isLoading: boolean;
  error: string | null;
}

type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_TIME_ENTRIES'; payload: TimeEntry[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  | { type: 'START_TIMER'; payload: { userId: string; projectId: string; taskId: string; description: string } }
  | { type: 'STOP_TIMER'; payload: string };

// Initial state with mock data
const initialState: DataState = {
  users: [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      avatar: '/avatars/john.jpg',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'manager',
      avatar: '/avatars/jane.jpg',
      createdAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 'user-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'employee',
      avatar: '/avatars/mike.jpg',
      createdAt: '2024-01-17T10:00:00Z'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Web Development',
      client: 'Acme Corp',
      color: '#3B82F6',
      status: 'active',
      teamMembers: ['user-1', 'user-2'],
      tasks: ['task-1', 'task-2'],
      createdAt: '2024-01-15T10:00:00Z',
      description: 'A modern web development project for Acme Corp.'
    },
    {
      id: 'proj-2',
      name: 'Mobile App',
      client: 'TechStart',
      color: '#10B981',
      status: 'active',
      teamMembers: ['user-1', 'user-3'],
      tasks: ['task-3'],
      createdAt: '2024-01-16T10:00:00Z',
      description: 'Building a cross-platform mobile app for TechStart.'
    },
    {
      id: 'proj-3',
      name: 'Design System',
      client: 'DesignCo',
      color: '#F59E0B',
      status: 'on-hold',
      teamMembers: ['user-2'],
      tasks: ['task-4'],
      createdAt: '2024-01-17T10:00:00Z',
      description: 'Design system and component library for DesignCo.'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      projectId: 'proj-1',
      name: 'Frontend Development',
      description: 'Build React components and implement UI',
      status: 'in-progress',
      assignedTo: 'user-1',
      estimatedHours: 40,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      name: 'Backend API',
      description: 'Develop REST API endpoints',
      status: 'todo',
      assignedTo: 'user-2',
      estimatedHours: 30,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'task-3',
      projectId: 'proj-2',
      name: 'Mobile UI Design',
      description: 'Design mobile app interface',
      status: 'in-progress',
      assignedTo: 'user-3',
      estimatedHours: 25,
      createdAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 'task-4',
      projectId: 'proj-3',
      name: 'Component Library',
      description: 'Create reusable design components',
      status: 'completed',
      assignedTo: 'user-2',
      estimatedHours: 20,
      createdAt: '2024-01-17T10:00:00Z'
    }
  ],
  timeEntries: [
    {
      id: 'entry-1',
      userId: 'user-1',
      projectId: 'proj-1',
      taskId: 'task-1',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T17:00:00Z',
      duration: 28800, // 8 hours
      description: 'Worked on login component and user authentication',
      isRunning: false,
      billable: true,
      rate: 85,
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 'entry-2',
      userId: 'user-2',
      projectId: 'proj-1',
      taskId: 'task-2',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T18:00:00Z',
      duration: 28800, // 8 hours
      description: 'API development and database setup',
      isRunning: false,
      billable: true,
      rate: 75,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'entry-3',
      userId: 'user-1',
      projectId: 'proj-1',
      taskId: 'task-1',
      startTime: '2024-01-16T09:00:00Z',
      endTime: null,
      duration: 0,
      description: 'Working on dashboard components',
      isRunning: true,
      billable: true,
      rate: 85,
      createdAt: '2024-01-16T09:00:00Z'
    }
  ],
  isLoading: false,
  error: null,
};

// Reducer
const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_TIME_ENTRIES':
      return { ...state, timeEntries: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload)
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload)
      };
    case 'ADD_TIME_ENTRY':
      return { ...state, timeEntries: [...state.timeEntries, action.payload] };
    case 'UPDATE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.map(te => te.id === action.payload.id ? action.payload : te)
      };
    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(te => te.id !== action.payload)
      };
    case 'START_TIMER':
      const newEntry: TimeEntry = {
        id: `entry-${Date.now()}`,
        userId: action.payload.userId,
        projectId: action.payload.projectId,
        taskId: action.payload.taskId,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        description: action.payload.description,
        isRunning: true,
        billable: true,
        rate: 85,
        createdAt: new Date().toISOString()
      };
      return { ...state, timeEntries: [...state.timeEntries, newEntry] };
    case 'STOP_TIMER':
      return {
        ...state,
        timeEntries: state.timeEntries.map(te => 
          te.id === action.payload 
            ? { 
                ...te, 
                endTime: new Date().toISOString(),
                duration: Math.floor((new Date().getTime() - new Date(te.startTime).getTime()) / 1000),
                isRunning: false 
              }
            : te
        )
      };
    default:
      return state;
  }
};

// Context
interface DataContextType extends DataState {
  // Project actions
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Task actions
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Time entry actions
  createTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateTimeEntry: (entry: TimeEntry) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  startTimer: (userId: string, projectId: string, taskId: string, description: string) => Promise<void>;
  stopTimer: (entryId: string) => Promise<void>;
  
  // Utility functions
  getProjectById: (id: string) => Project | undefined;
  getTaskById: (id: string) => Task | undefined;
  getTimeEntriesByUser: (userId: string) => TimeEntry[];
  getTimeEntriesByProject: (projectId: string) => TimeEntry[];
  getRunningTimer: (userId: string) => TimeEntry | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Project actions
  const createProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      const newProject: Project = {
        ...project,
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create project' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProject = async (project: Project) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'UPDATE_PROJECT', payload: project });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update project' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProject = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete project' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Task actions
  const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTask = async (task: Task) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'UPDATE_TASK', payload: task });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTask = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Time entry actions
  const createTimeEntry = async (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEntry: TimeEntry = {
        ...entry,
        id: `entry-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_TIME_ENTRY', payload: newEntry });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create time entry' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTimeEntry = async (entry: TimeEntry) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'UPDATE_TIME_ENTRY', payload: entry });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update time entry' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTimeEntry = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'DELETE_TIME_ENTRY', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete time entry' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const startTimer = async (userId: string, projectId: string, taskId: string, description: string) => {
    dispatch({ type: 'START_TIMER', payload: { userId, projectId, taskId, description } });
  };

  const stopTimer = async (entryId: string) => {
    dispatch({ type: 'STOP_TIMER', payload: entryId });
  };

  // Utility functions
  const getProjectById = (id: string) => state.projects.find(p => p.id === id);
  const getTaskById = (id: string) => state.tasks.find(t => t.id === id);
  const getTimeEntriesByUser = (userId: string) => state.timeEntries.filter(te => te.userId === userId);
  const getTimeEntriesByProject = (projectId: string) => state.timeEntries.filter(te => te.projectId === projectId);
  const getRunningTimer = (userId: string) => state.timeEntries.find(te => te.userId === userId && te.isRunning);

  const value: DataContextType = {
    ...state,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    getProjectById,
    getTaskById,
    getTimeEntriesByUser,
    getTimeEntriesByProject,
    getRunningTimer,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Hook
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 