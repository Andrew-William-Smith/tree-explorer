import React from 'react';
import { observer, inject } from 'mobx-react';

import { Button, ButtonGroup, Card, ControlGroup, Divider, Icon, Intent, NumericInput, Position, Slider, Switch, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import ApplicationStore, { Traversal } from '../../stores/ApplicationStore';
import TreeItem from './TreeItem/TreeItem';
import './Sidebar.css';

interface ISidebarProps {
    applicationStore?: ApplicationStore
}

interface ISidebarState {
    addOneValue: string;
    addManyValue: string;
}

@inject('applicationStore')
@observer
export default class Sidebar extends React.Component<ISidebarProps, ISidebarState> {
    constructor(props: ISidebarProps) {
        super(props);
        this.state = { addOneValue: '', addManyValue: '' };
    }

    private addTreeItemKbd = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        // If the user pressed Enter, add their item to the tree
        if (evt.key === 'Enter') {
            this.addTreeItem();
        }
    }

    private addTreeItem = () => {
        if (this.state.addOneValue !== '') {
            this.props.applicationStore!.addItem(+this.state.addOneValue);
            this.setState({ addOneValue: '' });
        }
    };

    private addManyAscending = async () => {
        if (this.state.addManyValue !== '') {
            for (let i = 1; i <= +this.state.addManyValue; i++)
                await this.props.applicationStore!.addItem(i);

            this.setState({ addManyValue: '' });
        }
    }

    private addManyDescending = async () => {
        if (this.state.addManyValue !== '') {
            for (let i = +this.state.addManyValue; i >= 1; i--)
                await this.props.applicationStore!.addItem(i);

            this.setState({ addManyValue: '' });
        }
    }

    private addManyRandom = async () => {
        if (this.state.addManyValue !== '') {
            // Generate a list of numbers in random order
            let itemNum = +this.state.addManyValue;
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
            this.setState({ addManyValue: '' });
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
                    <NumericInput value={this.state.addOneValue}
                        onValueChange={(asNum, asString) => this.setState({ addOneValue: asString })}
                        leftIcon={IconNames.NEW_OBJECT}
                        placeholder="Add an item" onKeyUp={this.addTreeItemKbd}
                        disabled={treeOperating} fill />
                    <Button intent={Intent.SUCCESS} onClick={this.addTreeItem}
                        disabled={treeOperating}>Add</Button>
                </ControlGroup>

                <ControlGroup className="addManyInput" fill>
                    <NumericInput value={this.state.addManyValue}
                        onValueChange={(asNum, asString) => this.setState({ addManyValue: asString })}
                        leftIcon={IconNames.ADD_TO_ARTIFACT} placeholder="Add many items"
                        disabled={treeOperating} fill />
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

                <div className="animationExplanationContainer">
                    Show explanations for:
                    <ButtonGroup>
                        <Button active={store.explainAdd}
                            icon={<Icon icon={IconNames.ADD} intent={Intent.SUCCESS} />}
                            onClick={store.toggleExplainAdd}>Addition</Button>
                        <Button active={store.explainRemove}
                            icon={<Icon icon={IconNames.REMOVE} intent={Intent.DANGER} />}
                            onClick={store.toggleExplainRemove}>Removal</Button>
                        <Button active={store.explainTraverse}
                            icon={<Icon icon={IconNames.DIAGRAM_TREE} intent={Intent.PRIMARY} />}
                            onClick={store.toggleExplainTraverse}>Traversal</Button>
                    </ButtonGroup>

                    <div className="animationSliderContainer">
                        Animation speed (ms):
                        <Slider min={0} max={1000} stepSize={10} labelStepSize={250}
                            value={store.animationInterval} onChange={this.setAnimationInterval} />
                    </div>

                    <Switch className="showNullSwitch" checked={store.renderNullNodes}
                        onClick={store.toggleRenderNullNodes}
                        labelElement={<span>Show <code>null</code> nodes</span>} />
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
