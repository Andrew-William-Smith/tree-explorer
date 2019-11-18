import React from 'react';
import { observer, inject } from 'mobx-react';

import { Button, ButtonGroup, Card, ControlGroup, Divider, Intent, NumericInput, Position, Slider, Switch, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import ApplicationStore, { Traversal } from '../../stores/ApplicationStore';
import TreeItem from './TreeItem/TreeItem';
import './Sidebar.css';

interface ISidebarProps {
    applicationStore?: ApplicationStore
}

@inject('applicationStore')
@observer
export default class Sidebar extends React.Component<ISidebarProps, {}> {
    private addItemRef: HTMLInputElement | null;
    private addManyRef: HTMLInputElement | null;

    constructor(props: ISidebarProps) {
        super(props);
        this.addItemRef = null;
        this.addManyRef = null;
    }

    private addTreeItemKbd = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        // If the user pressed Enter, add their item to the tree
        if (evt.key === 'Enter') {
            this.addTreeItem();
        }
    }

    private addTreeItem = () => {
        if (this.addItemRef !== null) {
            let item = this.addItemRef.value;
            if (item !== '') {
                this.props.applicationStore!.addItem(+item);
                this.addItemRef.value = '';
            }
        }
    };

    private addManyAscending = async () => {
        if (this.addManyRef !== null) {
            let item = this.addManyRef.value;
            if (item !== '') {
                for (let i = 1; i <= +item; i++)
                    await this.props.applicationStore!.addItem(i);

                this.addManyRef.value = '';
            }
        }
    }

    private addManyDescending = async () => {
        if (this.addManyRef !== null) {
            let item = this.addManyRef.value;
            if (item !== '') {
                for (let i = +item; i >= 1; i--)
                    await this.props.applicationStore!.addItem(i);

                this.addManyRef.value = '';
            }
        }
    }

    private addManyRandom = async () => {
        if (this.addManyRef !== null) {
            let item = this.addManyRef.value;
            if (item !== '') {
                // Generate a list of numbers in random order
                let itemNum = +item;
                let items = [];
                for (let i = 1; i <= itemNum; i++)
                    items.push(i);
                // Fisher-Yates shuffle
                for (let i = itemNum - 1; i > 0; i--) {
                    const newIdx = Math.floor(Math.random() * (i + 1));
                    [items[i], items[newIdx]] = [items[newIdx], items[i]];
                }
                // Add values to tree
                for (let i = 0; i < itemNum; i++)
                    await this.props.applicationStore!.addItem(items[i]);
                this.addManyRef.value = '';
            }
        }
    }

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
                <ControlGroup fill>
                    <NumericInput inputRef={ref => this.addItemRef = ref} leftIcon={IconNames.NEW_OBJECT}
                        placeholder="Add an item" onKeyUp={this.addTreeItemKbd}
                        disabled={treeOperating} fill />
                    <Button intent={Intent.SUCCESS} onClick={this.addTreeItem}
                        disabled={treeOperating}>Add</Button>
                </ControlGroup>

                <ControlGroup className="addManyInput" fill>
                    <NumericInput inputRef={ref => this.addManyRef = ref} leftIcon={IconNames.ADD_TO_ARTIFACT}
                        placeholder="Add many items" disabled={treeOperating} fill />
                    <Tooltip content="Add values ascending" position={Position.BOTTOM}>
                        <Button intent={Intent.SUCCESS} icon={IconNames.SORT_NUMERICAL}
                            onClick={this.addManyAscending} disabled={treeOperating} />
                    </Tooltip>
                    <Tooltip content="Add values descending" position={Position.BOTTOM}>
                        <Button intent={Intent.SUCCESS} icon={IconNames.SORT_NUMERICAL_DESC}
                            onClick={this.addManyDescending} disabled={treeOperating} />
                    </Tooltip>
                    <Tooltip content="Add values randomly" position={Position.BOTTOM}>
                        <Button intent={Intent.SUCCESS} icon={IconNames.SOCIAL_MEDIA}
                            onClick={this.addManyRandom} disabled={treeOperating} />
                    </Tooltip>
                </ControlGroup>

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
