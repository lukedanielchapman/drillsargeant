import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AssessmentResult {
  module: 'code-quality' | 'security' | 'performance' | 'compliance' | 'production-readiness';
  score: number;
  details: Record<string, any>;
  recommendations: Recommendation[];
  timestamp: string;
}

interface Recommendation {
  id: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedEffort: number; // hours
  estimatedCost: number; // USD
  implementationSteps: string[];
}

interface Assessment {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  results: AssessmentResult[];
  overallScore: number;
  type: 'comprehensive' | 'quick' | 'security' | 'performance';
}

interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  assessments: [],
  currentAssessment: null,
  isLoading: false,
  error: null,
};

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAssessments: (state, action: PayloadAction<Assessment[]>) => {
      state.assessments = action.payload;
      state.error = null;
    },
    addAssessment: (state, action: PayloadAction<Assessment>) => {
      state.assessments.push(action.payload);
    },
    updateAssessment: (state, action: PayloadAction<Assessment>) => {
      const index = state.assessments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.assessments[index] = action.payload;
      }
    },
    setCurrentAssessment: (state, action: PayloadAction<Assessment | null>) => {
      state.currentAssessment = action.payload;
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
  setAssessments,
  addAssessment,
  updateAssessment,
  setCurrentAssessment,
  setError,
  clearError,
} = assessmentSlice.actions;

export default assessmentSlice.reducer; 