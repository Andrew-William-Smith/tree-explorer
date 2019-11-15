import React from 'react';
import { Callout, Divider, Intent, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import '@blueprintjs/core/lib/css/blueprint.css';

import CollapsiblePane from '../CollapsiblePane/CollapsiblePane';
import './ErrorBoundary.css';

interface IErrorBoundaryProps {
    children: React.ReactNode;
}

interface IErrorBoundaryState {
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
    state: IErrorBoundaryState = {
        error: null
    };

    /**
     * Set the ErrorBoundary's error state once one has occurred.
     * @param error The error to associate with this ErrorBoundary.
     */
    static getDerivedStateFromError(error: Error): Partial<IErrorBoundaryState> {
        return { error };
    }

    render(): React.ReactNode {
        // An error has occurred, so render the error boundary
        if (this.state.error) {
            return (
                <Callout className="errorCard" title="He's dead, Jim!" intent={Intent.DANGER} icon={IconNames.PULSE}>
                    Tree Explorer has encountered a fatal error from which it is unable to recover.
                    The tree you had entered should be considered to be lost.
                    Refresh the page to continue exploring.

                    <CollapsiblePane className="debugInfoPane" titleActionsLeft="Debugging information" isOpen={false}>
                        <p><strong>Error type:</strong> {this.state.error.name}</p>
                        <p><strong>Message:</strong> {this.state.error.message}</p>
                        <Divider />
                        <p><strong>Stack trace:</strong></p>
                        <Pre>{this.state.error.stack}</Pre>
                    </CollapsiblePane>
                </Callout>
            );
        }

        // No error has occurred, so render the normal contents
        return this.props.children;
    }
}
