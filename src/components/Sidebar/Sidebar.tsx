import React from 'react';
import { observer, inject } from 'mobx-react';
import { Button, ButtonGroup, Card, Divider, Intent, NumericInput, Slider, Switch } from '@blueprintjs/core';

import ApplicationStore, { Traversal } from '../../stores/ApplicationStore';
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

    private setAnimationInterval = (interval: number) => {
        this.props.applicationStore!.animationInterval = interval;
    }

    render(): React.ReactNode {
        let store = this.props.applicationStore!;
        // Generate a list of the items in this tree
        let treeOperating = store.treeOperating;
        let treeItemList = store.items.map((item, idx) => {
            return <TreeItem value={item} index={idx} key={item} disabled={treeOperating} />
        });
        let treeItems = <div className="sidebarTreeItems">{treeItemList}</div>;

        // If there are no items in the tree, show a placeholder instead
        if (treeItemList.length === 0 && !treeOperating) {
            treeItems = <Card>No items in tree &mdash; add one above!</Card>;
        }

        return (
            <div className="sidebar">
                <NumericInput leftIcon="new-object" placeholder="Add an item" onKeyUp={this.addTreeItem}
                    disabled={treeOperating} />
                <div>
                    <Switch className="explainCheckbox" checked={store.explainAdd}
                        label="Explain additions" onChange={store.toggleExplainAdd}
                        disabled={treeOperating} inline />
                    <Switch className="explainCheckbox" checked={store.explainRemove}
                        label="Explain removals" onChange={store.toggleExplainRemove}
                        disabled={treeOperating} inline />
                    <Switch className="explainCheckbox" checked={store.explainTraverse}
                        label="Explain traversals" onChange={store.toggleExplainTraverse}
                        disabled={treeOperating} />

                    <div className="animationSliderContainer">
                        Animation speed (ms):
                        <Slider min={0} max={1000} stepSize={10} labelStepSize={250}
                            value={store.animationInterval} onChange={this.setAnimationInterval} />
                    </div>
                </div>

                <Divider />

                <h2>Tree contents</h2>
                <ButtonGroup className="sidebarTraversals">
                    <Button onClick={() => store.traverse(Traversal.PRE_ORDER)}
                        disabled={treeOperating}>Pre-Order</Button>
                    <Button onClick={() => store.traverse(Traversal.IN_ORDER)}
                        disabled={treeOperating}>In-Order</Button>
                    <Button onClick={() => store.traverse(Traversal.POST_ORDER)}
                        disabled={treeOperating}>Post-Order</Button>
                    <Button onClick={store.clearTree} intent={Intent.DANGER}
                        disabled={treeOperating || store.tree.size === 0}>Clear</Button>
                </ButtonGroup>
                {treeItems}
            </div>
        );
    }
}
