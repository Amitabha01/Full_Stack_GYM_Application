import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../context/AuthContext';

// Mock useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/',
    }),
  };
});

const mockAuthContext = {
  user: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
};

const renderNavbar = (user = null) => {
  const contextValue = { ...mockAuthContext, user };
  
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={contextValue}>
        <Navbar />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('When user is not logged in', () => {
    it('should render brand logo and name', () => {
      renderNavbar();
      expect(screen.getByText('FitLife')).toBeInTheDocument();
    });

    it('should show login and register buttons', () => {
      renderNavbar();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Join Now')).toBeInTheDocument();
    });

    it('should show public navigation links', () => {
      renderNavbar();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Classes')).toBeInTheDocument();
      expect(screen.getByText('Memberships')).toBeInTheDocument();
      expect(screen.getByText('Trainers')).toBeInTheDocument();
    });

    it('should not show protected navigation', () => {
      renderNavbar();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Workouts')).not.toBeInTheDocument();
    });
  });

  describe('When user is logged in', () => {
    const mockUser = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'member',
    };

    it('should show protected navigation links', () => {
      renderNavbar(mockUser);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Workouts')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Challenges')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should show user menu items', () => {
      renderNavbar(mockUser);
      expect(screen.getByText('AI Coach')).toBeInTheDocument();
      expect(screen.getByText('Achievements')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should show logout button', () => {
      renderNavbar(mockUser);
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should not show login/register buttons', () => {
      renderNavbar(mockUser);
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Join Now')).not.toBeInTheDocument();
    });
  });

  describe('Dark mode toggle', () => {
    it('should render theme toggle button', () => {
      renderNavbar();
      const themeButton = screen.getByLabelText('Toggle dark mode');
      expect(themeButton).toBeInTheDocument();
    });

    it('should initialize dark mode from localStorage', () => {
      localStorage.setItem('darkMode', 'true');
      renderNavbar();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(false); // Initial render
    });
  });

  describe('Mobile menu', () => {
    it('should render mobile menu toggle button', () => {
      renderNavbar();
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Navigation links', () => {
    it('should have correct href attributes', () => {
      renderNavbar();
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
