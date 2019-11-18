import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { BinaryTreeNode } from "../../../stores/AbstractTree";
import './TreeNode.css';

interface ITreeNodeProps {
    /** The node that this element represents. */
    node: BinaryTreeNode;
}

interface ITreeNodeState {
    color: string;
    borderColor: string;
    backgroundColor: string;
}

export default class TreeNode extends React.Component<ITreeNodeProps, ITreeNodeState> {
    private ownRef: React.RefObject<any>;

    constructor(props: ITreeNodeProps) {
        super(props);
        this.ownRef = React.createRef();

        this.state = {
            color: this.props.node.colour,
            borderColor: this.props.node.colour,
            backgroundColor: 'white'
        };
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

    static getDerivedStateFromProps(nextProps: ITreeNodeProps, prevState: ITreeNodeState) {
        let nodeColour = nextProps.node.colour;
        let highlightColour = nextProps.node.renderProps.highlightColour;
        let highlighted = highlightColour !== null;

        if (nextProps.node.value === null) {
            return {
                color: highlighted ? highlightColour : '#aaa',
                borderColor: highlighted ? highlightColour : '#ddd',
                backgroundColor: highlighted ? `${highlightColour}11` : 'white'
            };
        } else {
            return {
                color: highlighted ? 'white' : nodeColour,
                borderColor: nodeColour,
                backgroundColor: highlighted ? highlightColour : 'white'
            }
        }
    };

    componentDidMount(): void {
        this.setRenderProps();
    }

    componentDidUpdate(): void {
        this.setRenderProps();
    }

    render(): React.ReactNode {
        // If this node is non-null, navigate down the tree
        if (this.props.node.value !== null) {
            let leftNode = <TreeNode node={this.props.node.leftChild!} />;
            let rightNode = <TreeNode node={this.props.node.rightChild!} />;

            return (
                <div className="subtreeGroup">
                    <div ref={this.ownRef} className="treeNode" style={this.state}>
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
            <div ref={this.ownRef} className="treeNode nullNode" style={this.state}>
                <Icon icon={IconNames.DISABLE} />
            </div>
        );
    }
}
