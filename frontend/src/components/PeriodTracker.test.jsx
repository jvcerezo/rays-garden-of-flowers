import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PeriodTracker from './PeriodTracker';
import { useAuth } from '../context/AuthContext';
import * as firestore from 'firebase/firestore';

jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock('../firebase/firebase', () => ({
    auth: {},
    db: {},
    storage: {},
    app: {}
}));

jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(() => ({})),
    collection: jest.fn(() => ({})),
    addDoc: jest.fn(() => Promise.resolve({ id: 'new-doc' })),
    updateDoc: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => ({})),
    orderBy: jest.fn(() => ({})),
    onSnapshot: jest.fn((ref, callback) => {
        // Return mock unsubscribe
        return jest.fn();
    }),
    getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
    writeBatch: jest.fn(() => ({
        delete: jest.fn(),
        commit: jest.fn(() => Promise.resolve()),
    })),
    Timestamp: {
        fromDate: jest.fn((d) => ({ toDate: () => d })),
    },
}));

jest.mock('./usePeriodCycle', () => ({
    usePeriodCycle: jest.fn(),
}));

import { usePeriodCycle } from './usePeriodCycle';

describe('PeriodTracker Permissions & End Button', () => {
    beforeEach(() => {
        firestore.onSnapshot.mockImplementation(() => jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders "End Current Period" button for Ray (rheanamindo@gmail.com) when cycle is active', () => {
        useAuth.mockReturnValue({
            user: { email: 'rheanamindo@gmail.com' },
        });

        usePeriodCycle.mockReturnValue({
            isPeriod: true,
            activeCycleId: 'cycle-123',
            activeCycle: { id: 'cycle-123', startDate: new Date() },
            activeCycleStartDate: new Date(),
            currentDayInCycle: 4,
            primaryText: 'Day 4',
            secondaryText: 'Period in progress',
            progress: 50,
            phase: 'Period',
            getDayType: () => 'period',
            getDayDetails: () => ({}),
        });

        render(<PeriodTracker />);

        // Ray should see the End Current Period button
        const endBtn = screen.getByRole('button', { name: /end current period/i });
        expect(endBtn).toBeInTheDocument();

        // Ray should see Settings and FAB
        expect(screen.getByLabelText(/cycle settings/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/log period/i)).toBeInTheDocument();

        // Clicking End Current Period opens the dedicated End Period modal
        fireEvent.click(endBtn);
        expect(screen.getByRole('heading', { name: /end period cycle/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /end period today/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save end date/i })).toBeInTheDocument();
    });

    test('renders "Start New Period" button for Ray when no cycle is active', () => {
        useAuth.mockReturnValue({
            user: { email: 'rheanamindo@gmail.com' },
        });

        usePeriodCycle.mockReturnValue({
            isPeriod: false,
            activeCycleId: null,
            activeCycle: null,
            activeCycleStartDate: null,
            currentDayInCycle: 14,
            primaryText: 'Day 14',
            secondaryText: 'Next period in 14 days',
            progress: 50,
            phase: 'Follicular',
            getDayType: () => 'none',
            getDayDetails: () => ({}),
        });

        render(<PeriodTracker />);

        // Ray should see Start New Period
        const startBtn = screen.getByRole('button', { name: /start new period/i });
        expect(startBtn).toBeInTheDocument();

        // Ray should NOT see End Current Period
        expect(screen.queryByRole('button', { name: /end current period/i })).not.toBeInTheDocument();
    });

    test('STRICTLY hides End/Start buttons, Settings, and FAB from the user (jetjetcerezo@gmail.com)', () => {
        useAuth.mockReturnValue({
            user: { email: 'jetjetcerezo@gmail.com' },
        });

        usePeriodCycle.mockReturnValue({
            isPeriod: true,
            activeCycleId: 'cycle-123',
            activeCycle: { id: 'cycle-123', startDate: new Date() },
            activeCycleStartDate: new Date(),
            currentDayInCycle: 4,
            primaryText: 'Day 4',
            secondaryText: 'Period in progress',
            progress: 50,
            phase: 'Period',
            getDayType: () => 'period',
            getDayDetails: () => ({}),
        });

        render(<PeriodTracker />);

        // The user MUST NOT see End Current Period or Start New Period buttons
        expect(screen.queryByRole('button', { name: /end current period/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /start new period/i })).not.toBeInTheDocument();

        // The user MUST NOT see Settings button or FAB
        expect(screen.queryByLabelText(/cycle settings/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/log period/i)).not.toBeInTheDocument();

        // The user CAN view the Cycle Tracker info and History
        expect(screen.getByRole('heading', { name: /cycle tracker/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/cycle history/i)).toBeInTheDocument();
    });
});
