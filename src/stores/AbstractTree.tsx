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
    /** The subordinate node stored to the left of this node. */
    leftChild: BinaryTreeNode | null;
    /** The subordinate node stored to the right of this node. */
    rightChild: BinaryTreeNode | null;
    /** Rendering properties for this node. */
    @observable renderProps: IBinaryTreeNodeRender;

    constructor(value: number | null, colour: string = "#000") {
        this.value = value;
        this.colour = colour;

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
        this.root = new BinaryTreeNode(null);
        this.size = 0;
        this.numOperations = 0;
        this.explainFunction = explain;
        this.highlightedNodes = [];
        items.forEach(item => this.addItem(item));
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
     * Perform a pre-order traversal of this tree.
     */
    public async *traversePreOrder(): any {
        if (this.root.value !== null)
            yield* this.navigatePreOrder(this.root);

        await this.explainStep('Traversal complete', <div>
            The in-order traversal of this tree is complete.
            The full results may be seen in the list of tree contents in the sidebar.
        </div>, true);
    }

    private async *navigatePreOrder(node: BinaryTreeNode): any {
        // Add this node
        yield node.value;
        await this.explainStep('Add current node', <div>
            Begin by adding the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>current node </HighlightNode>
            to the list of results.
        </div>);

        // Add the left node
        if (node.leftChild!.value !== null) {
            await this.explainStep('Traverse left child', <div>
                In order to proceed from the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>current node </HighlightNode>
                , we first travel down the subtree formed under the
                    <HighlightNode node={node.leftChild!} colour={HighlightColours.BLUE}>left child</HighlightNode>.
            </div>);
            yield* this.navigatePreOrder(node.leftChild!);
        }

        // Add the right node
        if (node.rightChild!.value !== null) {
            await this.explainStep('Traverse right child', <div>
                Finally, we shall proceed from the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>current node </HighlightNode>
                down the subtree formed by the
                    <HighlightNode node={node.rightChild!} colour={HighlightColours.BLUE}>right child</HighlightNode>.
            </div>);
            yield* this.navigatePreOrder(node.rightChild!);
        }
    }
}
