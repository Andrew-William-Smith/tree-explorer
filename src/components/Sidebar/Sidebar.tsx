import React from 'react';
import { observer, inject } from 'mobx-react';
import { InputGroup } from '@blueprintjs/core';

import ApplicationStore from '../../stores/ApplicationStore';
import './Sidebar.css';

interface ISidebarProps {
    applicationStore?: ApplicationStore
}

@inject('applicationStore')
@observer
export default class Sidebar extends React.Component<ISidebarProps, {}> {
    private addTreeItem = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        // If the user pressed Enter, add their item to the tree
        if (evt.key === 'Enter') {
            this.props.applicationStore!.addItem(evt.currentTarget.value);
            evt.currentTarget.value = '';
        }
    };

    render(): React.ReactNode {
        return (
            <div className="sidebar">
                <InputGroup leftIcon="new-object" placeholder="Insert an item" onKeyUp={this.addTreeItem} />

                <h2>Tree contents</h2>
            </div>
        );
    }
}
