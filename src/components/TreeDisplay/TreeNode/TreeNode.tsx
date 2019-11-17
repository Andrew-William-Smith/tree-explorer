import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { BinaryTreeNode } from "../../../stores/AbstractTree";
import './TreeNode.css';

interface ITreeNodeProps {
    /** The node that this element represents. */
    node: BinaryTreeNode;
}

export default class TreeNode extends React.Component<ITreeNodeProps, {}> {
    private ownRef: React.RefObject<any>;

    constructor(props: ITreeNodeProps) {
        super(props);
        this.ownRef = React.createRef();
    }

    /**
     * Set the rendering properties of the underlying BinaryTreeNode for this
     * node.  Used to trigger connection rendering.
     */
    private setRenderProps = () => {
        // Set anchor coordinates to allow connections to be drawn
        let bounds = this.ownRef.current.getBoundingClientRect();
        let xCoordinate = this.ownRef.current.offsetLeft + bounds.width / 2;
        this.props.node.renderProps.topAnchor = {
            x: xCoordinate,
            y: this.ownRef.current.offsetTop
        };
        this.props.node.renderProps.bottomAnchor = {
            x: xCoordinate,
            y: this.ownRef.current.offsetTop + bounds.height
        };
    };

    componentDidMount(): void {
        this.setRenderProps();
    }

    componentDidUpdate(): void {
        this.setRenderProps();
    }

    render(): React.ReactNode {
        let highlightColour = this.props.node.renderProps.highlightColour;

        // If this node is non-null, navigate down the tree
        if (this.props.node.value !== null) {
            let leftNode = <TreeNode node={this.props.node.leftChild!} />;
            let rightNode = <TreeNode node={this.props.node.rightChild!} />;

            // Determine style for this node
            let nodeStyle = highlightColour === null
                ? { color: this.props.node.colour, borderColor: this.props.node.colour }
                : { color: 'white', backgroundColor: highlightColour, borderColor: highlightColour };

            return (
                <div className="subtreeGroup">
                    <div ref={this.ownRef} className="treeNode" style={nodeStyle}>
                        {this.props.node.value}
                    </div>
                    <div className="treeNodeChildren">
                        {leftNode}
                        {rightNode}
                    </div>
                </div>
            );
        }

        // The node is null, render a placeholder
        let nodeStyle = highlightColour !== null
            ? { color: highlightColour, borderColor: highlightColour, backgroundColor: `${highlightColour}11` }
            : {};
        return (
            <div ref={this.ownRef} className="treeNode nullNode" style={nodeStyle}>
                <Icon icon={IconNames.DISABLE} />
            </div>
        );
    }
}
