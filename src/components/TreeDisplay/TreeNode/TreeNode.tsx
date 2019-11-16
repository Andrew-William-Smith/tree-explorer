import React from 'react';

import { BinaryTreeNode } from "../../../stores/AbstractTree";
import './TreeNode.css';

interface ITreeNodeProps {
    /** The node that this element represents. */
    node: BinaryTreeNode | null;
}

export default class TreeNode extends React.Component<ITreeNodeProps, {}> {
    render(): React.ReactNode {
        // If this node is non-null, navigate down the tree
        if (this.props.node !== null) {
            let leftNode = <TreeNode node={this.props.node.leftChild} />;
            let rightNode = <TreeNode node={this.props.node.rightChild} />;

            return (
                <div className="subtreeGroup">
                    <div className="treeNode">
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
        return (
            <div className="treeNode">
                <i>null</i>
            </div>
        );
    }
}
