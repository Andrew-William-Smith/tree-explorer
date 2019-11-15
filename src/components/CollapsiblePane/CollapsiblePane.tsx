import React from 'react';
import { Card, Collapse, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import './CollapsiblePane.css';

interface ICollapsiblePaneProps {
    children: React.ReactNode;
    isOpen?: boolean;
    titleActionsLeft?: React.ReactNode;
    titleActionsRight?: React.ReactNode;
    className?: string;
}

interface ICollapsiblePaneState {
    isOpen: boolean;
}

export default class CollapsiblePane extends React.Component<ICollapsiblePaneProps, ICollapsiblePaneState> {
    constructor(props: ICollapsiblePaneProps) {
        super(props);
        let isOpen = this.props.isOpen ?? true;
        this.state = { isOpen };
    }

    private togglePaneOpen = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };

    render(): React.ReactNode {
        // Satisfy the type-checker, which stumbles on ternaries
        let collapseClass = this.state.isOpen ? '' : 'collapsiblePaneCollapsed';

        return (
            <Card className={this.props.className}>
                <div className={`collapsiblePaneHeading ${collapseClass}`} onClick={this.togglePaneOpen}>
                    <Icon icon={IconNames.CHEVRON_DOWN} />
                    <span className="collapsiblePaneTitleActions">
                        <span className="collapsiblePaneTitleActionsLeft">
                            { this.props.titleActionsLeft }
                        </span>
                        <span className="collapsiblePaneTitleActionsRight">
                            { this.props.titleActionsRight }
                        </span>
                    </span>
                </div>
                <Collapse className="collapsiblePaneBody" isOpen={this.state.isOpen}>
                    { this.props.children }
                </Collapse>
            </Card>
        );
    }
}
