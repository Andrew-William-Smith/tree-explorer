import React from 'react';
import { action } from 'mobx';

import { AbstractTree, BinaryTreeNode } from './AbstractTree';
import HighlightNode, { HighlightColours } from '../components/HighlightNode/HighlightNode';
import NodeColour from '../components/HighlightNode/NodeColour';

export default class RedBlackTree extends AbstractTree {
    private RED: string = 'red';
    private BLACK: string = 'black';

    @action.bound
    public async addItem(item: number): Promise<void> {
        let addedNode = new BinaryTreeNode(item, this.RED);
        await this.addNodeNaive(addedNode, false);

        await this.explainStep('Restore invariants', <div>
            We have now added <strong>{item}</strong> to the tree as a
                <HighlightNode node={addedNode} colour={HighlightColours.GREEN}>red node</HighlightNode>
            ; however, it is possible that as a result of doing so, we have violated
            one of the invariants of the red-black tree.  We shall now rebalance
            the tree to ensure that all invariants hold.
        </div>);

        await this.rebalance(addedNode);
    }

    /**
     * Rebalance this tree to restore all red-black tree invariants:
     * - The root of the tree is black.
     * - If a node is red, its children must be black (red rule).
     * - Every path from a node to a null terminator must contain the same
     *   number of black nodes (path rule).
     *
     * @param node The node relative to which to rebalance this tree.
     */
    @action.bound
    private async rebalance(node: BinaryTreeNode): Promise<void> {
        if (node === this.root) {
            // If this node is the root, colour it black
            node.colour = this.BLACK;
            await this.explainStep('Colour root black', <div>
                Since the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance </HighlightNode>
                is the root of the tree, we shall colour it <NodeColour colour={this.BLACK} />.
            </div>, true);
        } else if (node.parent!.colour === this.BLACK) {
            // If the parent is black, no further modification is necessary
            await this.explainStep('Invariants hold', <div>
                Since the
                    <HighlightNode node={node.parent!} colour={HighlightColours.BLUE}>parent </HighlightNode>
                of this node is <NodeColour colour={this.BLACK} />, the addition of
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>
                        this <NodeColour colour={this.RED} /> node
                    </HighlightNode> does not violate the path rule.  No modification is necessary.
            </div>, true);
        } else if (node.ommer !== null && node.ommer.colour === this.RED) {
            // If the parent and ommer are both red, recolour them black and colour the grandparent red
            await this.explainStep('Recolour parent and uncle', <div>
                We now have the case that the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance</HighlightNode>, its
                    <HighlightNode node={node.parent!} colour={HighlightColours.BLUE}>parent</HighlightNode>, and its
                    <HighlightNode node={node.ommer} colour={HighlightColours.ORANGE}>uncle </HighlightNode>
                are all <NodeColour colour={this.RED} />, a violation of the red rule.
                To rectify this issue, we shall colour both the parent and the uncle <NodeColour colour={this.BLACK} />;
                we shall also recolour the
                    <HighlightNode node={node.grandparent!} colour={HighlightColours.RED}>grandparent </HighlightNode>
                <NodeColour colour={this.RED} /> to maintain the path rule.
            </div>);

            node.ommer.colour = this.BLACK;
            node.parent!.colour = this.BLACK;
            node.grandparent!.colour = this.RED;

            // Continue rebalancing up the tree
            await this.explainStep('Restore invariants from grandparent', <div>
                This recolouring has gotten us closer to a properly coloured tree;
                however, it is possible that recolouring the
                    <HighlightNode node={node.grandparent!} colour={HighlightColours.RED}>grandparent </HighlightNode>
                <NodeColour colour={this.RED} /> has resulted in more invariant violations.
                We shall continue rectifying the tree relative to the grandparent.
            </div>);
            await this.rebalance(node.grandparent!);
        } else {
            // The parent is red but the ommer is black: rotate!
            await this.rebalanceDifferingAntecedents(node);
        }

        this.numOperations++;
    }

    @action.bound
    private async rebalanceDifferingAntecedents(node: BinaryTreeNode): Promise<void> {
        // At this point, we know that there is a grandparent, so let's save some !'s
        let grandparent = node.grandparent!;
        let parent = node.parent!;
        await this.explainStep('Determine rotation direction', <div>
            As the
                <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance </HighlightNode>
            is <NodeColour colour={this.RED} />, this tree currently violates the red rule.
            To rectify this situation, we want to rotate the current node into the position of its
                <HighlightNode node={grandparent} colour={HighlightColours.ORANGE}>grandparent</HighlightNode>.
        </div>);

        // Determine which direction to rotate, if any
        let doRotateLeft = (node.isRightChild() && parent.isLeftChild());
        let doRotateRight = (node.isLeftChild() && parent.isRightChild());
        if (doRotateLeft || doRotateRight) {
            // The current node is "inside" its grandparent, so we have to rotate
            let rotateDirection = doRotateLeft ? 'left' : 'right';
            await this.explainStep('Rotate outside grandparent', <div>
                The <HighlightNode node={node} colour={HighlightColours.GREEN}>node to rebalance </HighlightNode>
                is "inside" its
                    <HighlightNode node={grandparent} colour={HighlightColours.ORANGE}>grandparent</HighlightNode>
                : that is, it is not reachable by travelling solely {rotateDirection} from the grandparent.
                To prepare to rotate relative to the grandparent, we must first rotate <strong>{rotateDirection}</strong> relative to the
                    <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent</HighlightNode>.
            </div>);
        }

        // If necessary, rotate outward
        if (doRotateLeft) {
            await this.rotateLeft(parent);
            node = node.leftChild!;
        } else if (doRotateRight) {
            await this.rotateRight(parent);
            node = node.rightChild!;
        }

        // Reassign parent and grandparent, as rotation could have changed them
        parent = node.parent!;
        grandparent = node.grandparent!;

        // Rotate about the grandparent
        await this.explainStep('Rotate about grandparent', <div>
            We shall now shift our focus to the 
                <HighlightNode node={node} colour={HighlightColours.GREEN}>modified node </HighlightNode>
            that is furthest down the tree.  We know that this node is "outside" its
                <HighlightNode node={grandparent} colour={HighlightColours.ORANGE}>grandparent</HighlightNode>
            : the path between these nodes through the modified node's
                <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
            travels exclusively {node === parent.leftChild ? 'left': 'right'}.
            If we now rotate <strong>{node === parent.leftChild ? 'right' : 'left'}</strong> about its grandparent,
            which we know to be <NodeColour colour={this.BLACK} /> by way of the red rule,
            then all that will be required to restore compliance with the red rule is a colour change.
        </div>);

        if (node.isLeftChild())
            await this.rotateRight(grandparent);
        else
            await this.rotateLeft(grandparent);

        // Recolour old parent and grandparent
        await this.explainStep('Recolour relocated nodes', <div>
            The final step in the rebalancing process is to recolour the
            <HighlightNode node={node} colour={HighlightColours.GREEN}>modified node</HighlightNode>'s old
            <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent</HighlightNode> and
            <HighlightNode node={grandparent} colour={HighlightColours.ORANGE}>grandparent </HighlightNode>
            (now sibling) to restore compliance with the red rule.
            We shall colour the parent <NodeColour colour={this.BLACK} /> and the sibling <NodeColour colour={this.RED} />.
        </div>, true);
        parent.colour = this.BLACK;
        grandparent.colour = this.RED;
    }

    /**
     * Rotate the subtree formed by the specified node left:
     * ```
     *    A             C
     *  B   C   =>   A    E
     *     D E      B D
     * ```
     *
     * @param node The node relative to which to rotate.
     */
    @action.bound
    private async rotateLeft(node: BinaryTreeNode): Promise<void> {
        let oldRight = node.rightChild!;
        let oldParent = node.parent;
        // Determine new right child of rotation node
        await this.explainStep('Promote grandchild', <div>
            We begin this rotation by promoting the
                <HighlightNode node={oldRight.leftChild!} colour={HighlightColours.ORANGE}>left child </HighlightNode>
            of the
                <HighlightNode node={oldRight} colour={HighlightColours.BLUE}>right child </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            to be the rotated node's right child.
        </div>);

        node.rightChild = oldRight.leftChild;
        oldRight.leftChild = node;
        node.parent = oldRight;
        if (node.rightChild!.value !== null)
            node.rightChild!.parent = node;

        await this.explainStep('Rotate under right child', <div>
            Now that the
                <HighlightNode node={node.rightChild!} colour={HighlightColours.ORANGE}>proper grandchild </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            has been promoted, we must place the rotated node under its old <strong>right child</strong> (not shown).
        </div>);

        // Only subjugate rotated node if it is not the root of the tree
        if (oldParent !== null) {
            if (node === oldParent.leftChild)
                oldParent.leftChild = oldRight;
            else
                oldParent.rightChild = oldRight;
        } else {
            this.root = oldRight;
        }

        // Set the new parent of the promoted node
        oldRight.parent = oldParent;
        await this.explainStep('Rotation complete', <div>
            We have now finished the leftward rotation of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>target node </HighlightNode>
            under its former
                <HighlightNode node={oldRight} colour={HighlightColours.BLUE}>right child</HighlightNode>
            , and can now proceed with our original operation.
        </div>);
    }

    /**
     * Rotate the subtree formed by the specified node right:
     * ```
     *     A            B
     *   B   E   =>   C   A
     *  C D              D E
     * ```
     *
     * @param node The node relative to which to rotate.
     */
    @action.bound
    private async rotateRight(node: BinaryTreeNode): Promise<void> {
        let oldLeft = node.leftChild!;
        let oldParent = node.parent;
        // Determine new right child of rotation node
        await this.explainStep('Promote grandchild', <div>
            We begin this rotation by promoting the
                <HighlightNode node={oldLeft.rightChild!} colour={HighlightColours.ORANGE}>right child </HighlightNode>
            of the
                <HighlightNode node={oldLeft} colour={HighlightColours.BLUE}>left child </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            to be the rotated node's left child.
        </div>);

        node.leftChild = oldLeft.rightChild;
        oldLeft.rightChild = node;
        node.parent = oldLeft;
        if (node.leftChild!.value !== null)
            node.leftChild!.parent = node;

        await this.explainStep('Rotate under left child', <div>
            Now that the
                <HighlightNode node={node.leftChild!} colour={HighlightColours.ORANGE}>proper grandchild </HighlightNode>
            of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>rotated node </HighlightNode>
            has been promoted, we must place the rotated node under its old <strong>left child</strong> (not shown).
        </div>);

        // Only subjugate rotated node if it is not the root of the tree
        if (oldParent !== null) {
            if (node === oldParent.leftChild)
                oldParent.leftChild = oldLeft;
            else
                oldParent.rightChild = oldLeft;
        } else {
            this.root = oldLeft;
        }

        // Set the new parent of the promoted node
        oldLeft.parent = oldParent;
        await this.explainStep('Rotation complete', <div>
            We have now finished the rightward rotation of the
                <HighlightNode node={node} colour={HighlightColours.GREEN}>target node </HighlightNode>
            under its former
                <HighlightNode node={oldLeft} colour={HighlightColours.BLUE}>left child</HighlightNode>
            , and can now proceed with our original operation.
        </div>);
    }

    @action.bound
    public async removeItem(item: number): Promise<void> {
        // Replace the node containing the item to remove
        let replacement = await this.replaceItem(item, this.root);

        this.size--;
        this.numOperations++;
    }

    /**
     * Replace the item in this tree containing the specified value with its
     * right value if one exists, otherwise its left value.
     *
     * @param item The item to be replaced.
     * @param node The current candidate node for replacement.
     * @returns The node with which the target node was replaced.
     */
    @action.bound
    private async replaceItem(item: number, node: BinaryTreeNode): Promise<BinaryTreeNode> {
        if (node.value === item) {
            // We have found the node to delete, so let's splice it out of the tree
            return await this.spliceNode(node);
        } else {
            // Continue navigating down the tree
            await this.explainNavigation(item, node);
            return await this.replaceItem(item, item < node.value! ? node.leftChild! : node.rightChild!);
        }
    }

    /**
     * Splice the specified node out of the tree according to red-black tree
     * deletion rules:
     * - If the node is a leaf, set it to null.
     * - If the node has only one non-null child, set it to that child.
     * - If the node has two non-null children, replace the node with the
     *   minimum node in its right subtree.
     * 
     * @param node The node to be spliced out of the tree.
     */
    @action.bound
    private async spliceNode(node: BinaryTreeNode): Promise<BinaryTreeNode> {
        // The node with which to replace the specified node
        let replacement: BinaryTreeNode;

        if (node.isLeaf()) {
            await this.explainStep('Replace leaf with null', <div>
                We have found the
                    <HighlightNode node={node} colour={HighlightColours.RED}>node with value {node.value}</HighlightNode>
                , so we can now remove it.
                Since this node is a leaf, we shall replace it with null as it has no children to promote.
            </div>);

            // If the node is a leaf, replace it with null
            node.makeNull();
            replacement = node;
        } else if (node.rightChild!.value === null) {
            await this.explainStep('Promote left child', <div>
                We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node node with value {node.value}</HighlightNode>
                , so we can now remove it.
                Since this node has a <HighlightNode node={node.rightChild!} colour={HighlightColours.BLUE}>a null right child </HighlightNode>
                and a <HighlightNode node={node.leftChild!} colour={HighlightColours.GREEN}>a non-null left child</HighlightNode>,
                so we shall replace the node with its <strong>left</strong> child.
            </div>);

            // If there is no right child, replace with the left
            replacement = node.leftChild!;
            this.replaceNode(node, replacement);
        } else if (node.leftChild!.value === null) {
            await this.explainStep('Replace with non-null right child', <div>
                We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node node with value {node.value}</HighlightNode>
                , so we can now remove it.
                Since this node has a <HighlightNode node={node.leftChild!} colour={HighlightColours.BLUE}>a null left child </HighlightNode>
                and a <HighlightNode node={node.rightChild!} colour={HighlightColours.GREEN}>a non-null right child</HighlightNode>,
                so we shall replace the node with its <strong>right</strong> child.
            </div>);

            // If there is no left child, replace with the right
            replacement = node.rightChild!;
            this.replaceNode(node, replacement);
        } else {
            await this.explainStep('Find minimum greater value', <div>
                We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node with value {node.value} </HighlightNode>
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
            node.colour = minChild.colour;

            // Delete minimum greater node
            await this.explainStep('Splice out replacement node', <div>
                With the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>promoted node </HighlightNode>
                having assumed its new position, we must now remove it from its
                    <HighlightNode node={minChild} colour={HighlightColours.RED}>old position</HighlightNode>
                .  Since we know that there are no values to the left of this node, we can simply promote its
                    <HighlightNode node={minChild.rightChild!} colour={HighlightColours.BLUE}>right child </HighlightNode>
                to its position.
            </div>);
            // Minimum child will never be the root, so we can safely set the parent's values
            minChild.rightChild!.parent = minChild.parent;
            minChild.parent!.rightChild = minChild.rightChild;
            replacement = node;
        }

        return replacement;
    }

    /**
     * Replace a node in this tree, correctly modifying parent references.
     * Helper method for spliceNode().
     *
     * @param oldNode The node to be replaced.
     * @param newNode The node with which to replace the old node.
     * @see RedBlackTree#spliceNode(BinaryTreeNode)
     */
    @action.bound
    private replaceNode(oldNode: BinaryTreeNode, newNode: BinaryTreeNode): void {
        newNode.parent = oldNode.parent;
        if (oldNode.parent === null) {
            // If there is no parent, this node was the root
            this.root = newNode;
        } else if (oldNode.isLeftChild()) {
            oldNode.parent.leftChild = newNode;
        } else {
            oldNode.parent.rightChild = newNode;
        }
    }
}
