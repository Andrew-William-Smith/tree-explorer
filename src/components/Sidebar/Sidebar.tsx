import React from 'react';
import { observer, inject } from 'mobx-react';
import { Card, Checkbox, Divider, NumericInput } from '@blueprintjs/core';

import ApplicationStore from '../../stores/ApplicationStore';
import TreeItem from './TreeItem/TreeItem';
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
            let newItem = evt.currentTarget.value;
            if (newItem !== '') {
                this.props.applicationStore!.addItem(+newItem);
                evt.currentTarget.value = '';
            }
        }
    };

    render(): React.ReactNode {
        // Generate a list of the items in this tree
        let treeItemList = this.props.applicationStore!.items.map((item, idx) => {
            return <TreeItem value={item} index={idx} key={item}
                disabled={this.props.applicationStore!.explaining} />
        });
        let treeItems = <div className="sidebarTreeItems">{treeItemList}</div>;

        // If there are no items in the tree, show a placeholder instead
        if (treeItemList.length === 0) {
            treeItems = <Card>No items in tree &mdash; add one above!</Card>;
        }

        return (
            <div className="sidebar">
                <NumericInput leftIcon="new-object" placeholder="Add an item" onKeyUp={this.addTreeItem}
                    disabled={this.props.applicationStore!.explaining} />
                <div>
                    <Checkbox className="explainCheckbox" checked={this.props.applicationStore!.explainAdd}
                        label="Explain additions" onChange={this.props.applicationStore!.toggleExplainAdd}
                        disabled={this.props.applicationStore!.explaining} />
                    <Checkbox className="explainCheckbox" checked={this.props.applicationStore!.explainRemove}
                        label="Explain removals" onChange={this.props.applicationStore!.toggleExplainRemove}
                        disabled={this.props.applicationStore!.explaining} />
                </div>

                <Divider />

                <h2>Tree contents</h2>
                {treeItems}
            </div>
        );
    }
}
