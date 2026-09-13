import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => <div>Route</div>,
  Navigate: () => <div>Navigate</div>,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '' })
}), { virtual: true });

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn()
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  getFirestore: jest.fn(() => ({})),
  onSnapshot: jest.fn(() => jest.fn()),
  query: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  addDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  serverTimestamp: jest.fn(),
}));

jest.mock('./firebase/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  app: {}
}));

import App from './App';

test('renders App component without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
