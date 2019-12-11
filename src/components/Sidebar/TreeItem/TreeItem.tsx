import React from 'react';
import { inject } from 'mobx-react';
import { Button, Intent } from '@blueprintjs/core';

import ApplicationStore from '../../../stores/ApplicationStore';
import './TreeItem.css';

interface ITreeItemProps {
    value: number;
    index: number;
    disabled: boolean;
    applicationStore?: ApplicationStore;
}

@inject('applicationStore')
export default class TreeItem extends React.Component<ITreeItemProps, {}> {
    /** Remove this node from all trees. */
    private removeNode = () => {
        this.props.applicationStore!.removeItemAtIndex(this.props.index);
    };

    render(): React.ReactNode {
        return (
            <div className="sidebarTreeItem">
                <div className="treeItemContents">{this.props.value}</div>
                <Button intent={Intent.DANGER} onClick={this.removeNode} disabled={this.props.disabled}>Remove</Button>
            </div>
        );
    }
}
