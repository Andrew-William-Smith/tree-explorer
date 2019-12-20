import React from 'react';
import { observer, inject } from 'mobx-react';

import ApplicationStore from '../../stores/ApplicationStore';
import { BinaryTreeNode } from '../../stores/AbstractTree';

/** Colours for highlighting nodes.  Derived from Blueprint swatches. */
export enum HighlightColours {
    GREEN = '#0D8050',
    BLUE = '#106BA3',
    ORANGE = '#BF7326',
    RED = '#C23030'
}

interface IHighlightNodeProps {
    children: React.ReactNode;
    applicationStore?: ApplicationStore;
    node: BinaryTreeNode;
    colour: HighlightColours;
}

@inject('applicationStore')
@observer
export default class HighlightNode extends React.Component<IHighlightNodeProps, {}> {
    shouldHighlight: boolean;

    /**
     * Construct a new HighlightNode component.  If the specified node is null
     * and null node rendering is disabled, this component is essentially a
     * no-op, simply rendering its children.
     */
    constructor(props: IHighlightNodeProps) {
        super(props);
        this.shouldHighlight = this.props.node.value !== null || this.props.applicationStore!.renderNullNodes;
        if (this.shouldHighlight) {
            this.props.node.renderProps.highlightColour = this.props.colour;
            this.props.applicationStore!.tree.highlightedNodes.push(this.props.node);
        }
    }

    render(): React.ReactNode {
        if (this.shouldHighlight) {
            return <span style={{color: this.props.colour, fontWeight: 600}}>&#32;{this.props.children}</span>
        }

        return <span>&#32;{this.props.children}</span>;
    }
}
