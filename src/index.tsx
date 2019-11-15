import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';

import './index.css';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Create a global instance of the application store
import ApplicationStore from './stores/ApplicationStore';
const APPLICATION_STORE = new ApplicationStore();

ReactDOM.render(
    <Provider applicationStore={APPLICATION_STORE}>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </Provider>,
    document.getElementById('root')
);
