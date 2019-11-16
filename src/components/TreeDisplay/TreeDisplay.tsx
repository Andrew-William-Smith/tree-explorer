import React from 'react';
import { observer, inject } from 'mobx-react';

import './TreeDisplay.css';
import ApplicationStore from '../../stores/ApplicationStore';
import { BinaryTreeNode } from '../../stores/AbstractTree';
import TreeNode from './TreeNode/TreeNode';

interface ITreeDisplayProps {
    applicationStore?: ApplicationStore;
}

interface ITreeDisplayState {
    connectionLines: Array<React.ReactNode>;
}

@inject('applicationStore')
@observer
export default class TreeDisplay extends React.Component<ITreeDisplayProps, ITreeDisplayState> {
    /** Whether connections have been rendered for the last update of this tree. */
    private renderedConnections: boolean;
    /** How far the user has scrolled in this view. */
    private scrollPosition: { x: number, y: number };

    constructor(props: ITreeDisplayProps) {
        super(props);
        this.renderedConnections = false;
        this.scrollPosition = { x: 0, y: 0 };
        this.state = {
            connectionLines: []
        };
    }

    /** Render connections for all nodes in this tree. */
    private renderConnections = () => {
        if (!this.renderedConnections) {
            // Render connection lines for this tree
            let newConnectionLines: Array<React.ReactNode> = [];
            this.renderNodeConnections(this.props.applicationStore!.tree.root, newConnectionLines, [0]);
            // Avoid an infinite loop between componentDidUpdate() <-> render()
            this.renderedConnections = true;
            this.setState(() => ({
                connectionLines: newConnectionLines
            }));
        } else {
            // This was a recursive call: allow rendering on the next tree update
            this.renderedConnections = false;
        }
    };

    /** Render connections for the specified node and its descendants. */
    private renderNodeConnections = (node: BinaryTreeNode, lines: Array<React.ReactNode>, key: [number]) => {
        // Render connections to the left
        if (node.leftChild !== null) {
            lines.push(this.createConnection(node, node.leftChild, key[0]));
            key[0]++;
            this.renderNodeConnections(node.leftChild, lines, key);
        }
        // Render connections to the right
        if (node.rightChild !== null) {
            lines.push(this.createConnection(node, node.rightChild, key[0]));
            key[0]++;
            this.renderNodeConnections(node.rightChild, lines, key);
        }
    };

    /** Create a tree connection between the specified nodes. */
    private createConnection = (parent: BinaryTreeNode, child: BinaryTreeNode, key: number): React.ReactNode => {
        let parentAnchor = parent.renderProps.bottomAnchor;
        let childAnchor = child.renderProps.topAnchor;
        // The left position should be that of whichever node is furthest left
        let leftPos = Math.min(parentAnchor.x, childAnchor.x);
        // Standard point-distance formula
        let xDiff = childAnchor.x - parentAnchor.x;
        let yDiff = childAnchor.y - parentAnchor.y;
        let length = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)) + 1;
        // Compute the angle by which to rotate
        let angle = Math.atan(yDiff / xDiff);

        return (
            <div className="treeDisplayConnection" key={key} style={{
                left: leftPos - this.scrollPosition.x,
                top: (xDiff > 0 ? parentAnchor.y : childAnchor.y) - this.scrollPosition.y,
                width: length,
                transform: `rotate(${angle}rad)`
            }}></div>
        );
    };

    private handleScroll = (evt: React.UIEvent<HTMLDivElement>): void => {
        this.scrollPosition = {
            x: evt.currentTarget.scrollLeft,
            y: evt.currentTarget.scrollTop
        };
        this.renderConnections();
    };

    componentDidUpdate(): void {
        this.renderConnections();
    };

    render(): React.ReactNode {
        return (
            <div className="treeDisplay" onScroll={this.handleScroll}>
                {this.props.applicationStore!.tree.size}
                <TreeNode node={this.props.applicationStore!.tree.root} />
                {this.state.connectionLines}
            </div>
        );
    }
}
