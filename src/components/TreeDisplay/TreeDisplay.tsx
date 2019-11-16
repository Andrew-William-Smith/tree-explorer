import React from 'react';
import { observer, inject } from 'mobx-react';

import './TreeDisplay.css';
import ApplicationStore from '../../stores/ApplicationStore';
import TreeNode from './TreeNode/TreeNode';

interface ITreeDisplayProps {
    applicationStore?: ApplicationStore
}

@inject('applicationStore')
@observer
export default class TreeDisplay extends React.Component<ITreeDisplayProps, {}> {
    render(): React.ReactNode {
        return (
            <div className="treeDisplay">
                {this.props.applicationStore!.tree.size}
                <TreeNode node={this.props.applicationStore!.tree.root} />
            </div>
        );
    }
}
