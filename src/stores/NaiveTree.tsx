import React from 'react';
import { action } from 'mobx';

import { AbstractTree, BinaryTreeNode } from './AbstractTree';
import HighlightNode, { HighlightColours } from '../components/HighlightNode/HighlightNode';

export default class NaiveTree extends AbstractTree {
    @action.bound
    public async addItem(item: number): Promise<void> {
        this.root = await this.addRecursive(item, this.root);
        this.size++;
        this.numOperations++;
    }

    @action.bound
    private async addRecursive(item: number, node: BinaryTreeNode): Promise<BinaryTreeNode> {
        // We have reached a dead end, add here
        if (node.value === null) {
            await this.explainStep('Insert node', <div>
                We have found a
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>position </HighlightNode>
                at which we can insert our node. We shall do so, finishing our insertion operation.
            </div>, true);
            return new BinaryTreeNode(item);
        }

        // Otherwise, determine which direction to travel: left if less than, right if greater
        await this.explainNavigation(item, node);
        if (item < node.value)
            node.leftChild = await this.addRecursive(item, node.leftChild!);
        else if (item > node.value)
            node.rightChild = await this.addRecursive(item, node.rightChild!);
        return node;
    }

    @action.bound
    public async removeItem(item: number): Promise<void> {
        this.root = await this.removeRecursive(item, this.root);
        this.size--;
        this.numOperations++;
    }

    @action.bound
    private async removeRecursive(item: number, node: BinaryTreeNode): Promise<BinaryTreeNode> {
        // If the node is a null leaf, it cannot be traversed down
        if (node.value !== null) {
            // Determine which direction to travel down the tree
            if (item < node.value) {
                await this.explainNavigation(item, node);
                node.leftChild = await this.removeRecursive(item, node.leftChild!);
            } else if (item > node.value) {
                await this.explainNavigation(item, node);
                node.rightChild = await this.removeRecursive(item, node.rightChild!);
            } else {
                // Remove the desired node from the subtree
                if (node.isLeaf()) {
                    await this.explainStep('Remove leaf node', <div>
                        We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node with value {item} </HighlightNode>
                        , so we can now remove it.  This node is a leaf, with both its
                            <HighlightNode node={node.leftChild!} colour={HighlightColours.GREEN}>left </HighlightNode>
                        and
                            <HighlightNode node={node.rightChild!} colour={HighlightColours.BLUE}>right </HighlightNode>
                        children being <code>null</code>.
                        We shall delete this node straightaway.
                    </div>, true);

                    // Node is a leaf: revert to null node
                    node = new BinaryTreeNode(null);
                } else if (node.leftChild!.value === null) {
                    await this.explainStep('Promote right child', <div>
                        We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node with value {item} </HighlightNode>
                        , so we can now remove it.  This node has only a 
                            <HighlightNode node={node.rightChild!} colour={HighlightColours.GREEN}>right </HighlightNode>
                        child, with its
                            <HighlightNode node={node.leftChild!} colour={HighlightColours.BLUE}>left </HighlightNode>
                        child being <code>null</code>.
                        As a result, we shall promote the <strong>right</strong> child to the removed node's position.
                    </div>, true);

                    // Left child is null, promote the right child
                    node = node.rightChild!;
                } else if (node.rightChild!.value === null) {
                    await this.explainStep('Promote left child', <div>
                        We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node with value {item} </HighlightNode>
                        , so we can now remove it.  This node has only a 
                            <HighlightNode node={node.leftChild!} colour={HighlightColours.GREEN}>left </HighlightNode>
                        child, with its
                            <HighlightNode node={node.rightChild!} colour={HighlightColours.BLUE}>right </HighlightNode>
                        child being <code>null</code>.
                        As a result, we shall promote the <strong>left</strong> child to the removed node's position.
                    </div>, true);

                    // Right child is null, promote the left child
                    node = node.leftChild!;
                } else {
                    await this.explainStep('Find minimum greater value', <div>
                        We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node with value {item} </HighlightNode>
                        , so we can now remove it.  This node has both
                            <HighlightNode node={node.leftChild!} colour={HighlightColours.BLUE}>left </HighlightNode>
                        and
                            <HighlightNode node={node.rightChild!} colour={HighlightColours.GREEN}>right </HighlightNode>
                        children, so we need to promote the minimum value in the <strong>right</strong> subtree.
                    </div>);

                    // Node has two children, promote the minimum value in the right subtree
                    let minChild = node.rightChild!.minChild();

                    await this.explainStep('Promote minimum greater value', <div>
                        Now that we have found the
                            <HighlightNode node={minChild} colour={HighlightColours.GREEN}>minimum greater node</HighlightNode>
                        , we shall replace the
                            <HighlightNode node={node} colour={HighlightColours.RED}>node to remove</HighlightNode>.
                    </div>);
                    node.value = minChild.value;

                    await this.explainStep('Remove promoted node', <div>
                        With the
                            <HighlightNode node={node} colour={HighlightColours.GREEN}>promoted node </HighlightNode>
                        having assumed its new position, we must now remove it from its
                            <HighlightNode node={minChild} colour={HighlightColours.RED}>old position</HighlightNode>.
                        We shall use the same algorithm we used to remove the initial node.
                    </div>);
                    node.rightChild = await this.removeRecursive(node.value!, node.rightChild!);
                }
            }
        } else {
            await this.explainStep('Null node', <div>
                We have found a
                    <HighlightNode node={node} colour={HighlightColours.RED}><code>null</code> node</HighlightNode>,
                so we shall not operate upon it any further.
            </div>, true);
        }

        return node;
    }

    /**
     * Explain the process of navigating through the tree from the specified
     * node in search of the specified item.
     *
     * @param item The item for which the tree operation is being performed.
     * @param node The tree node from which to navigate.
     */
    private async explainNavigation(item: number, node: BinaryTreeNode): Promise<void> {
        let directionName = item < node.value! ? 'left' : 'right';

        await this.explainStep(`Navigate ${directionName} from ${node.value}`, <div>
            We need to determine in which direction to navigate down the tree.
            As the value under consideration, <strong>{item}</strong>, is less than the value of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>current node</HighlightNode>
            , <strong>{node.value}</strong>, we shall navigate to the
                <HighlightNode node={item < node.value! ? node.leftChild! : node.rightChild!} colour={HighlightColours.BLUE}>
                    <strong>{directionName}</strong>
                </HighlightNode>.
        </div>);

        return;
    }
}
