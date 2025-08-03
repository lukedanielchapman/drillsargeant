import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CodeIssue {
  id: string;
  type: 'security' | 'performance' | 'quality' | 'best-practice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  description: string;
  impact: string;
  fix: {
    before: string;
    after: string;
    explanation: string;
    resources: string[];
  };
  projectId: string;
  status: 'open' | 'in-progress' | 'fixed' | 'verified';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface IssueState {
  issues: CodeIssue[];
  currentIssue: CodeIssue | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    severity: string[];
    type: string[];
    status: string[];
    assignedTo?: string;
  };
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  isLoading: false,
  error: null,
  filters: {
    severity: [],
    type: [],
    status: [],
  },
};

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIssues: (state, action: PayloadAction<CodeIssue[]>) => {
      state.issues = action.payload;
      state.error = null;
    },
    addIssue: (state, action: PayloadAction<CodeIssue>) => {
      state.issues.push(action.payload);
    },
    updateIssue: (state, action: PayloadAction<CodeIssue>) => {
      const index = state.issues.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
    },
    deleteIssue: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.filter(i => i.id !== action.payload);
    },
    setCurrentIssue: (state, action: PayloadAction<CodeIssue | null>) => {
      state.currentIssue = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<IssueState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        severity: [],
        type: [],
        status: [],
      };
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
  setIssues,
  addIssue,
  updateIssue,
  deleteIssue,
  setCurrentIssue,
  setFilters,
  clearFilters,
  setError,
  clearError,
} = issueSlice.actions;

export default issueSlice.reducer; 