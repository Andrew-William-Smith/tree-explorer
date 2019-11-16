import { AbstractTree, BinaryTreeNode } from './AbstractTree';
import { action } from 'mobx';

export default class NaiveTree extends AbstractTree {
    @action.bound
    public addItem(item: number, explain: boolean): void {
        this.root = this.addRecursive(item, this.root, explain);
    }

    @action.bound
    private addRecursive(item: number, node: BinaryTreeNode, explain: boolean): BinaryTreeNode {
        // We have reached a dead end, add here
        if (node.value === null) {
            this.size++;
            return new BinaryTreeNode(item);
        }

        // Otherwise, determine which direction to travel: left if less than, right if greater
        if (item < node.value)
            node.leftChild = this.addRecursive(item, node.leftChild!, explain);
        else if (item > node.value)
            node.rightChild = this.addRecursive(item, node.rightChild!, explain);
        return node;
    }

    @action.bound
    public removeItem(item: number, explain: boolean): void {
        this.root = this.removeRecursive(item, this.root, explain);
    }

    @action.bound
    private removeRecursive(item: number, node: BinaryTreeNode, explain: boolean): BinaryTreeNode {
        // If the node is a null leaf, it cannot be traversed down
        if (node.value !== null) {
            // Determine which direction to travel down the tree
            if (item < node.value) {
                node.leftChild = this.removeRecursive(item, node.leftChild!, explain);
            } else if (item > node.value) {
                node.rightChild = this.removeRecursive(item, node.rightChild!, explain);
            } else {
                // Remove the desired node from the subtree
                this.size--;
                if (node.isLeaf()) {
                    // Node is a leaf: revert to null node
                    node = new BinaryTreeNode(null);
                } else if (node.leftChild!.value === null) {
                    // Left child is null, promote the right child
                    node = node.rightChild!;
                } else if (node.rightChild!.value === null) {
                    // Right child is null, promote the left child
                    node = node.leftChild!;
                } else {
                    // Node has two children, virtually promote the minimum
                    // value in the right subtree
                    node.value = node.rightChild!.minChild();
                    node.rightChild = this.removeRecursive(node.value, node.rightChild!, explain);
                    // Increment size after removeRecursive call
                    this.size++;
                }
            }
        }
        return node;
    }
}
