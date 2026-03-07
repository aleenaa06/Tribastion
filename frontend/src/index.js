import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

// Root-level error boundary prevents blank white page on production crashes
class RootErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: '#020617',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22d3ee',
                    fontFamily: 'monospace',
                    gap: '1rem',
                    padding: '2rem'
                }}>
                    <div style={{ fontSize: '3rem' }}>🛡️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.2em' }}>
                        TRIBASTION
                    </h1>
                    <p style={{ opacity: 0.6, marginBottom: '1rem' }}>
                        A system error occurred. Please refresh the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'transparent',
                            border: '1px solid #22d3ee',
                            color: '#22d3ee',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            letterSpacing: '0.1em',
                            fontSize: '0.875rem'
                        }}
                    >
                        RELOAD SYSTEM
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <RootErrorBoundary>
        <App />
    </RootErrorBoundary>
);
