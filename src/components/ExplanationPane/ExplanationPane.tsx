import React from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Card, Divider, H4, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import './ExplanationPane.css';
import ApplicationStore from '../../stores/ApplicationStore';

interface IExplanationPaneProps {
    applicationStore?: ApplicationStore;
}

@inject('applicationStore')
@observer
export default class ExplanationPane extends React.Component<IExplanationPaneProps, {}> {
    /** Advance to the next step of the explanation. */
    nextStep = () => {
        let store = this.props.applicationStore!;
        // If this was the last step, end the explanation
        if (store.explanationTerminal) {
            store.explaining = false;
        }

        // Resolve the promise to continue
        this.props.applicationStore!.explanationPromise!.resolve();
    };

    render(): React.ReactNode {
        let store = this.props.applicationStore!;
        // Only render if there is an explanation ongoing
        if (store.explaining) {
            let actionButtons = (
                <div className="actionButtons">
                    <Button rightIcon={IconNames.ARROW_RIGHT} intent={Intent.PRIMARY} text="Next"
                        onClick={this.nextStep} />
                </div>
            );
            // Special action button for the last step
            if (store.explanationTerminal) {
                actionButtons = (
                    <div className="actionButtons">
                        <Button rightIcon={IconNames.TICK} intent={Intent.SUCCESS} text="Finished"
                            onClick={this.nextStep} />
                    </div>
                );
            }

            return (
                <Card className="explanationCard">
                    <H4>{store.explanationTitle}</H4>
                    {store.explanationBody}
                    <Divider />
                    {actionButtons}
                </Card>
            );
        } else {
            return null;
        }
    }
}
