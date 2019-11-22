import React from 'react';
import { action, observable } from 'mobx';
import HighlightNode, { HighlightColours } from '../components/HighlightNode/HighlightNode';

type ExplainPromise = (title: string, message: React.ReactElement, terminal?: boolean) => Promise<any>;

/** Properties of binary tree nodes used exclusively for rendering. */
interface IBinaryTreeNodeRender {
    /** The position of the center-top anchor of this node. */
    topAnchor: { x: number, y: number };
    /** The position of the center-bottom anchor of this node. */
    bottomAnchor: { x: number, y: number };
    /** The colour with which to highlight this node. */
    highlightColour: string | null;
}

/**
 * A single node within a binary search tree.  Stores a colour to aid in
 * implementing self-balancing trees.
 */
export class BinaryTreeNode {
    /** The value stored in this tree node. */
    value: number | null;
    /** The colour of this node. */
    @observable colour: string;
    /** The parent of this node. */
    parent: BinaryTreeNode | null;
    /** The subordinate node stored to the left of this node. */
    leftChild: BinaryTreeNode | null;
    /** The subordinate node stored to the right of this node. */
    rightChild: BinaryTreeNode | null;
    /** Rendering properties for this node. */
    @observable renderProps: IBinaryTreeNodeRender;

    constructor(value: number | null, colour: string = 'black') {
        this.value = value;
        this.colour = colour;
        this.parent = null;

        // If the value is non-null, create children
        if (this.value !== null) {
            this.leftChild = new BinaryTreeNode(null);
            this.rightChild = new BinaryTreeNode(null);
        } else {
            this.leftChild = null;
            this.rightChild = null;
        }

        // Set initial rendering properties for this node
        this.renderProps = {
            topAnchor: { x: 0, y: 0 },
            bottomAnchor: { x: 0, y: 0 },
            highlightColour: null
        };
    }

    /**
     * The grandparent (parent of parent) of this node.
     */
    public get grandparent(): BinaryTreeNode | null {
        // If there is no parent, there cannot be a grandparent
        if (this.parent === null)
            return null;

        return this.parent.parent;
    }

    /**
     * The sibling of this node: the other node with the same parent as this
     * node, provided this node has a parent.
     */
    public get sibling(): BinaryTreeNode | null {
        // If there is no parent, there cannot be a sibling
        if (this.parent === null)
            return null;

        if (this.parent.leftChild === this)
            return this.parent.rightChild;
        return this.parent.leftChild;
    }

    /**
     * The ommer (aunt/uncle) of this node: the other node with the same
     * grandparent as this node's parent.
     */
    public get ommer(): BinaryTreeNode | null {
        // If there is no grandparent, there cannot be an ommer
        if (this.grandparent === null)
            return null;

        return this.parent!.sibling;
    }

    /** Determine whether this tree node represents a leaf. */
    public isLeaf(): boolean {
        return this.leftChild !== null && this.leftChild.value === null
            && this.rightChild !== null && this.rightChild.value === null;
    }

    /** Determine the value of the smallest child of this node. */
    public minChild(): BinaryTreeNode {
        let curNode: BinaryTreeNode = this;
        // Navigate as far left as possible
        while (curNode.leftChild !== null && curNode.leftChild.value !== null)
            curNode = curNode.leftChild;
        // Once we reach a dead end, we have found the minimum
        return curNode;
    }

    /** Make this node into a null terminator. */
    public makeNull(): void {
        this.value = null;
        this.colour = 'black';
        this.leftChild = null;
        this.rightChild = null;
    }

    /** Returns whether this node is the left child of its parent. */
    public isLeftChild(): boolean {
        return this.parent !== null && this == this.parent.leftChild;
    }

    /** Returns whether this node is the right child of its parent. */
    public isRightChild(): boolean {
        return this.parent !== null && this == this.parent.rightChild;
    }
}

/**
 * Some variant of a binary search tree.  Controls tree display, explanation,
 * and any additional properties that must be displayed for the tree.
 */
export abstract class AbstractTree {
    /** The root of this tree. */
    root: BinaryTreeNode;
    /** The size of this tree, used to determine when to rerender. */
    @observable size: number;
    /** The number of operations performed on this tree, used to determine when
     * to rerender. */
    @observable numOperations: number;
    /** The function used to explain steps of tree operations. */
    protected explainFunction: ExplainPromise;
    /** A list of nodes in this tree that are highlighted. */
    highlightedNodes: Array<BinaryTreeNode>;

    /**
     * Constructor for a binary search tree.  If items are specified, add them
     * to the tree without explanation.
     * 
     * @param items List of items to be added to this binary search tree.
     */
    constructor(explain: ExplainPromise, items: Array<number> = []) {
        // Cannot call reset() or the TypeScript compiler throws a fit
        this.root = new BinaryTreeNode(null);
        this.size = 0;
        this.numOperations = 0;
        this.explainFunction = explain;
        this.highlightedNodes = [];
        items.forEach(item => this.addItem(item));
    }

    /**
     * Reset this tree to its initial state, containing only a null root.
     */
    public reset(): void {
        this.root = new BinaryTreeNode(null);
        this.size = 0;
        this.numOperations = 0;
    }

    /**
     * Show an explanation for the current step of the ongoing operation using
     * the passed explanation function.
     *
     * @param title The title of this step.
     * @param message The body of the explanation for this step.
     * @param terminal Whether this is the last step in the operation.
     */
    @action.bound
    protected async explainStep(title: string, message: React.ReactElement, terminal: boolean = false): Promise<any> {
        this.numOperations++;
        await this.explainFunction(title, message, terminal);
        // Unhighlight all nodes from this step
        this.highlightedNodes.forEach(node => {
            node.renderProps.highlightColour = null;
        });
        this.highlightedNodes = [];
    }

    /**
     * Explain the process of navigating through the tree from the specified
     * node in search of the specified item.
     *
     * @param item The item for which the tree operation is being performed.
     * @param node The tree node from which to navigate.
     */
    protected async explainNavigation(item: number, node: BinaryTreeNode): Promise<void> {
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

    /**
     * Add the specified item to this tree.  It is expected that the tree does
     * not already contain this item.
     *
     * @param item The item to add to this tree.
     */
    public abstract async addItem(item: number): Promise<void>;

    /**
     * Remove the specified item from this tree.  It is expected that the tree
     * contains this item.
     *
     * @param item The item to remove from this tree.
     */
    public abstract async removeItem(item: number): Promise<void>;

    /**
     * Add a node to this tree using the "naïve" algorithm.
     * @param newNode The node to be added to the tree.
     * @param final Whether to designate the addition of the node as the final
     *     operation of an explanation.
     */
    @action.bound
    protected async addNodeNaive(newNode: BinaryTreeNode, final: boolean): Promise<void> {
        this.root = await this.addRecursive(newNode, final, this.root);
        this.root.parent = null;
        this.size++;
        this.numOperations++;
    }

    @action.bound
    private async addRecursive(newNode: BinaryTreeNode, final: boolean, node: BinaryTreeNode): Promise<BinaryTreeNode> {
        // We have reached a dead end, add here
        if (node.value === null) {
            await this.explainStep('Insert node', <div>
                We have found a
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>position </HighlightNode>
                at which we can insert our node. We shall do so, finishing our insertion operation.
            </div>, final);
            return newNode;
        }

        // Otherwise, determine which direction to travel: left if less than, right if greater
        let newValue = newNode.value!;
        await this.explainNavigation(newValue, node);
        if (newValue < node.value) {
            let leftChild = await this.addRecursive(newNode, final, node.leftChild!);
            leftChild.parent = node;
            node.leftChild = leftChild;
        }
        else if (newValue > node.value) {
            let rightChild = await this.addRecursive(newNode, final, node.rightChild!);
            rightChild.parent = node;
            node.rightChild = rightChild;
        }
        return node;
    }

    /**
     * Perform a pre-order traversal of this tree.
     */
    public async *traversePreOrder(): any {
        if (this.root.value !== null)
            yield* this.navigatePreOrder(this.root);

        await this.explainStep('Traversal complete', <div>
            The pre-order traversal of this tree is complete.
            The full results may be seen in the list of tree contents in the sidebar.
        </div>, true);
    }

    private async *navigatePreOrder(node: BinaryTreeNode): any {
        let continuePreOrder = (node: BinaryTreeNode) => this.navigatePreOrder(node);
        yield* this.explainTraverseCurrent(node);
        yield* this.explainTraverseLeft(node, 'Next', continuePreOrder);
        yield* this.explainTraverseRight(node, 'Finally', continuePreOrder);
    }

    /**
     * Perform an in-order traversal of this tree.
     */
    public async *traverseInOrder(): any {
        if (this.root.value !== null)
            yield* this.navigateInOrder(this.root);

        await this.explainStep('Traversal complete', <div>
            The in-order traversal of this tree is complete.
            The full results may be seen in the list of tree contents in the sidebar.
        </div>, true);
    }

    private async *navigateInOrder(node: BinaryTreeNode): any {
        let continueInOrder = (node: BinaryTreeNode) => this.navigateInOrder(node);
        yield* this.explainTraverseLeft(node, 'First', continueInOrder);
        yield* this.explainTraverseCurrent(node);
        yield* this.explainTraverseRight(node, 'Finally', continueInOrder);
    }

    /**
     * Perform a post-order traversal of this tree.
     */
    public async *traversePostOrder(): any {
        if (this.root.value !== null)
            yield* this.navigatePostOrder(this.root);

        await this.explainStep('Traversal complete', <div>
            The post-order traversal of this tree is complete.
            The full results may be seen in the list of tree contents in the sidebar.
        </div>, true);
    }

    private async *navigatePostOrder(node: BinaryTreeNode): any {
        let continuePostOrder = (node: BinaryTreeNode) => this.navigatePostOrder(node);
        yield* this.explainTraverseLeft(node, 'First', continuePostOrder);
        yield* this.explainTraverseRight(node, 'Next', continuePostOrder);
        yield* this.explainTraverseCurrent(node);
    }

    /**
     * Explain the traversal of the current node.
     * @param node The node for which to give an explanation.
     * @param prefix The prefix to add to the explanation message.
     */
    private async *explainTraverseCurrent(node: BinaryTreeNode) {
        yield node.value;
        await this.explainStep('Add current node', <div>
            Add the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>current node </HighlightNode>
            to the list of results.
        </div>);
    }

    /**
     * Explain the traversal of the node to the left of the specified node.
     * @param node The node from which to traverse.
     * @param prefix The prefix to add to the explanation message.
     * @param callback The function to use to continue traversing the tree.
     */
    private async *explainTraverseLeft(node: BinaryTreeNode, prefix: string, callback: (node: BinaryTreeNode) => any) {
        if (node.leftChild!.value !== null) {
            await this.explainStep('Traverse left child', <div>
                {prefix}, proceed from the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>current node </HighlightNode>
                down the subtree formed under its
                    <HighlightNode node={node.leftChild!} colour={HighlightColours.BLUE}>left child</HighlightNode>.
            </div>);
            yield* callback(node.leftChild!);
        }
    }

    /**
     * Explain the traversal of the node to the right of the specified node.
     * @param node The node from which to traverse.
     * @param prefix The prefix to add to the explanation message.
     * @param callback The function to use to continue traversing the tree.
     */
    private async *explainTraverseRight(node: BinaryTreeNode, prefix: string, callback: (node: BinaryTreeNode) => any) {
        if (node.rightChild!.value !== null) {
            await this.explainStep('Traverse right child', <div>
                {prefix}, proceed from the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>current node </HighlightNode>
                down the subtree formed under its
                    <HighlightNode node={node.rightChild!} colour={HighlightColours.BLUE}>right child</HighlightNode>.
            </div>);
            yield* callback(node.rightChild!);
        }
    }
}
