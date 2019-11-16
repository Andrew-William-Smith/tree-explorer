import React from 'react';
import { inject } from 'mobx-react';
import { Button, ButtonGroup, Intent } from '@blueprintjs/core';

import ApplicationStore from '../../../stores/ApplicationStore';
import './TreeItem.css';

interface ITreeItemProps {
    value: number;
    index: number;
    applicationStore?: ApplicationStore;
}

@inject('applicationStore')
export default class TreeItem extends React.Component<ITreeItemProps, {}> {
    /** Remove this node from all trees. */
    private removeNode = () => {
        this.props.applicationStore!.removeItemAtIndex(this.props.index);
    };

    /**
     * Remove this node from all trees and reinsert it according to the current
     * tree state.
     */
    private reinsertNode = () => {
        this.removeNode();
        this.props.applicationStore!.addItem(this.props.value);
    }

    render(): React.ReactNode {
        return (
            <div className="sidebarTreeItem">
                <div className="treeItemContents">{this.props.value}</div>
                <ButtonGroup>
                    <Button onClick={this.reinsertNode}>Re-insert</Button>
                    <Button intent={Intent.DANGER} onClick={this.removeNode}>Remove</Button>
                </ButtonGroup>
            </div>
        );
    }
}
