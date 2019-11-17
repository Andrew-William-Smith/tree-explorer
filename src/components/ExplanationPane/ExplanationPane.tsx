import React from 'react';
import { observer, inject } from 'mobx-react';

import { Button, ButtonGroup, Card, H4, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import './ExplanationPane.css';
import ApplicationStore from '../../stores/ApplicationStore';

interface IExplanationPaneProps {
    applicationStore?: ApplicationStore;
}

@inject('applicationStore')
@observer
export default class ExplanationPane extends React.Component<IExplanationPaneProps, {}> {
    /** Reference to the continue button, to allow focussing. */
    private continueRef: React.RefObject<any>;

    constructor(props: IExplanationPaneProps) {
        super(props);
        this.continueRef = React.createRef();
    }

    /** Advance to the next step of the explanation. */
    nextStep = (continueAnimation: boolean) => {
        let store = this.props.applicationStore!;
        // If this was the last step, end the explanation
        if (store.explanationTerminal) {
            store.explaining = false;
            store.explanationBody = null;
        }

        // Resolve the promise to continue
        store.explaining = continueAnimation;
        store.explanationPromise!.resolve();
    };

    componentDidUpdate() {
        // Focus the continue button on every update
        // if (this.continueRef.current !== null)
        //     this.continueRef.current.focus();
    }

    render(): React.ReactNode {
        let store = this.props.applicationStore!;
        let actionButtons = (
            <div className="actionButtons">
                <ButtonGroup>
                    <Button rightIcon={IconNames.FAST_FORWARD} text="Finish"
                        onClick={() => this.nextStep(false)} />
                    <Button rightIcon={IconNames.STEP_FORWARD} intent={Intent.PRIMARY} text="Next"
                        onClick={() => this.nextStep(true)} ref={this.continueRef} />
                </ButtonGroup>
            </div>
        );
        // Special action button for the last step
        if (store.explanationTerminal) {
            actionButtons = (
                <div className="actionButtons">
                    <Button rightIcon={IconNames.TICK} intent={Intent.SUCCESS} text="Finished"
                        onClick={() => this.nextStep(false)} ref={this.continueRef} />
                </div>
            );
        }

        return (
            <Card className="explanationCard" style={{
                display: store.explaining ? 'block' : 'none'
            }}>
                <H4>{store.explanationTitle}</H4>
                {store.explanationBody}
                {actionButtons}
            </Card>
        );
    }
}
