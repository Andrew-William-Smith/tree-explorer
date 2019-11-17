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
    render(): React.ReactNode {
        this.props.node.renderProps.highlightColour = this.props.colour;
        this.props.applicationStore!.tree.highlightedNodes.push(this.props.node);
        return <span style={{color: this.props.colour, fontWeight: 600}}>&#32;{this.props.children}</span>
    }
}
