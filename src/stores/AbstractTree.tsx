import React from 'react';
import { observable } from 'mobx';

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
    renderProps: IBinaryTreeNodeRender;

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
    public minChild(): number {
        let curNode: BinaryTreeNode = this;
        // Navigate as far left as possible
        while (curNode.leftChild !== null && curNode.leftChild.value !== null)
            curNode = curNode.leftChild;
        // Once we reach a dead end, we have found the minimum
        return curNode.value!;
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
    size: number;
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
        items.forEach(item => this.addItem(item, false));
    }

    protected async explainStep(title: string, message: React.ReactElement, terminal: boolean = false): Promise<any> {
        this.numOperations++;
        await this.explainFunction(title, message, terminal);
        // Unhighlight all nodes from this step
        this.highlightedNodes.filter(node => {
            node.renderProps.highlightColour = null;
            return false;
        });
        this.numOperations++;
    }

    /**
     * Add the specified item to this tree.  It is expected that the tree does
     * not already contain this item.
     *
     * @param item The item to add to this tree.
     * @param explain Whether to explain the steps taken to add the item.
     */
    public abstract addItem(item: number, explain: boolean): void;

    /**
     * Remove the specified item from this tree.  It is expected that the tree
     * contains this item.
     *
     * @param item The item to remove from this tree.
     * @param explain Whether to explain the steps taken to remove the item.
     */
    public abstract removeItem(item: number, explain: boolean): void;
}