import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl?: string;
  technologyStack: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'active' | 'archived' | 'deleted';
  lastAssessment?: string;
  issueCount: number;
  fixCount: number;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.error = null;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  setError,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer; 