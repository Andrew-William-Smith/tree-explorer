import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

ReactDOM.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById('root'));
