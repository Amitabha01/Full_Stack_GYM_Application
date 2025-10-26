import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Mock user data
export const mockUser = {
  _id: '123456789',
  name: 'Test User',
  email: 'test@example.com',
  role: 'member',
  profile: {
    height: 180,
    weight: 75,
    fitnessGoals: ['weight_loss'],
  },
};

export const mockAdmin = {
  _id: '987654321',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

// Custom render with providers
export const renderWithProviders = (ui, { user = null, ...options } = {}) => {
  const mockAuthContext = {
    user,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
  };

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider value={mockAuthContext}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock axios
export const mockAxios = {
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  create: vi.fn(function () {
    return this;
  }),
};

export const createMockAxios = () => ({
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
});

// Wait for promises to resolve
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
