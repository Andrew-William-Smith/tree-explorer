import { AbstractTree, BinaryTreeNode } from './AbstractTree';
import { action } from 'mobx';

export default class NaiveTree extends AbstractTree {
    @action.bound
    public addItem(item: number, explain: boolean): void {
        this.root = this.addRecursive(item, this.root, explain);
    }

    @action.bound
    private addRecursive(item: number, node: BinaryTreeNode | null, explain: boolean): BinaryTreeNode {
        // We have reached a dead end, add here
        if (node === null) {
            this.size++;
            return new BinaryTreeNode(item);
        }

        // Otherwise, determine which direction to travel: left if less than, right if greater
        if (item < node.value)
            node.leftChild = this.addRecursive(item, node.leftChild, explain);
        else if (item > node.value)
            node.rightChild = this.addRecursive(item, node.rightChild, explain);
        return node;
    }

    public removeItem(item: number, explain: boolean): void {
        console.log("Not yet implemented");
    }
}
