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
        let removedNode = await this.findRemovedNode(item, this.root);
        // The value to remove should always be contained in the tree, but if it is not, return
        if (removedNode === null) {
            return;
        }
        await this.spliceNode(removedNode);
        this.size--;
        this.numOperations++;
    }

    /**
     * Locate the node to be removed from this tree, explaining traversals along
     * the way.
     *
     * @param item The value stored in the node to be removed from the tree.
     * @param node The node relative to which to navigate down the tree.
     * @returns The node containing the specified value; if there is no such
     *     node, null.
     */
    @action.bound
    private async findRemovedNode(item: number, node: BinaryTreeNode): Promise<BinaryTreeNode | null> {
        if (node.value === null) {
            // If the node is a null leaf, we cannot continue traversing
            await this.explainStep('Null node', <div>
                We have found a
                    <HighlightNode node={node} colour={HighlightColours.RED}><code>null</code> node</HighlightNode>,
                so we shall not operate upon it any further.
            </div>, true);
            return null;
        }

        // Navigate based on the value of the current node
        if (item < node.value) {
            await this.explainNavigation(item, node);
            return await this.findRemovedNode(item, node.leftChild!);
        } else if (item > node.value) {
            await this.explainNavigation(item, node);
            return await this.findRemovedNode(item, node.rightChild!);
        } else {
            return node;
        }
    }

    /**
     * Splice the specified node out of this tree according to red-black tree
     * deletion rules:
     * - If the node is a leaf, set it to null.
     * - If the node has only one non-null child, set it to that child.
     * - If the node has two non-null children, replace the node with the
     *   minimum node in its right subtree.
     *
     * @param node The node to be removed from the tree.
     */
    @action.bound
    private async spliceNode(node: BinaryTreeNode): Promise<void> {
        // If the node has two children, promote the minimum greater value in the right subtree to avoid restructuring
        if (node.leftChild!.value !== null && node.rightChild!.value !== null) {
            await this.explainStep('Find minimum greater value', <div>
                We have found the <HighlightNode node={node} colour={HighlightColours.RED}>node with value {node.value}</HighlightNode>
                , which has both
                    <HighlightNode node={node.leftChild!} colour={HighlightColours.BLUE}>left </HighlightNode>
                and
                    <HighlightNode node={node.rightChild!} colour={HighlightColours.GREEN}>right </HighlightNode>
                children.  Instead of removing this node directly, we shall promote the minimum value in the <strong>right</strong> subtree
                to avoid restructuring the tree.
            </div>);
            let minChild = node.rightChild!.minChild();

            await this.explainStep('Promote minimum greater value', <div>
                Now that we have found the
                    <HighlightNode node={minChild} colour={HighlightColours.GREEN}>minimum greater node</HighlightNode>
                , we shall promote its value into the
                    <HighlightNode node={node} colour={HighlightColours.RED}>node to remove </HighlightNode>
                and mark the <strong>minimum greater node</strong> for deletion instead.
            </div>);
            node.value = minChild.value;
            node = minChild;
        }

        // This node is now known to have only one child
        let definedChild = node.leftChild!.value === null ? node.rightChild! : node.leftChild!;
        if (node === this.root) {
            if (node.isLeaf()) {
                // If the root is a leaf, it is safe to clear the tree
                await this.removeLeaf(node);
            } else {
                await this.explainStep('Promote child to root', <div>
                    We have found the
                        <HighlightNode node={node} colour={HighlightColours.RED}>node with value {node.value}</HighlightNode>
                    , so we can now remove it.  As this node is the root of the tree and it has only one
                        <HighlightNode node={definedChild} colour={HighlightColours.GREEN}>non-null child</HighlightNode>
                    , we can safely promote the child without violating any red-black tree invariants.
                </div>, true);
                // If we are removing the root, just replace the root with the non-null child
                definedChild.parent = null;
                this.root = definedChild;
                // Root must be coloured black
                definedChild.colour = this.BLACK;
            }
        } else if (node.colour === this.RED) {
            // If we have made it this far and the node is red, it is a leaf
            await this.removeLeaf(node);
        } else if (definedChild.colour === this.RED) {
            await this.explainStep('Promote child node', <div>
                We have found the
                    <HighlightNode node={node} colour={HighlightColours.RED}>node with value {node.value}</HighlightNode>
                , so we can now remove it.  As this node has only
                    <HighlightNode node={definedChild} colour={HighlightColours.GREEN}>one <NodeColour colour={this.RED} /> child</HighlightNode>
                , we can promote that child to the position of the node to remove.
            </div>);

            // Removing a black node with a red child: promote the red child
            if (node.isLeftChild()) {
                node.parent!.leftChild = definedChild;
            } else {
                node.parent!.rightChild = definedChild;
            }
            definedChild.parent = node.parent;

            await this.explainStep('Colour promoted node black', <div>
                As a consequence of promoting a
                    <HighlightNode node={definedChild} colour={HighlightColours.GREEN}><NodeColour colour={this.RED} /> node</HighlightNode>
                , this tree now violates the path rule since paths through the promoted node will have one fewer <NodeColour colour={this.BLACK} /> node than others.
                To rectify this issue, we shall colour the promoted node <NodeColour colour={this.BLACK} />.
            </div>, true);

            // Colour promoted node black to restore path rule compliance
            definedChild.colour = this.BLACK;
        } else {
            await this.explainStep('Rebalance double-black path', <div>
                We have found the
                    <HighlightNode node={node} colour={HighlightColours.RED}>node with value {node.value}</HighlightNode>
                , so we can now remove it.  As this node is <NodeColour colour={this.BLACK} /> and has only
                    <HighlightNode node={definedChild} colour={HighlightColours.GREEN}>one <NodeColour colour={this.BLACK} /> child</HighlightNode>
                , simply removing the node from the tree and promoting the child would result in a violation of the path rule.
                Thus, we must first rebalance the tree to ensure that it will be compliant with the path rule after the target node has been deleted.
            </div>);
            // Removing a black node with a black child: multiple cases
            await this.rebalanceRootDoubleBlack(node);
            await this.removeLeaf(node);
        }
    }

    /**
     * "Case One" of double-black rebalancing.  If the node on which to
     * rebalance is the root, colour it black.
     *
     * @param node The node relative to which to rebalance the tree.
     */
    @action.bound
    private async rebalanceRootDoubleBlack(node: BinaryTreeNode): Promise<void> {
        if (node.parent === null) {
            await this.explainStep('Recolour root black', <div>
                As the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node upon which to rebalance </HighlightNode>
                the tree is also the root of the tree, we shall simply colour this node <NodeColour colour={this.BLACK} />.
            </div>);
            node.colour = this.BLACK;
        } else {
            // Case does not apply, proceed to next
            await this.rebalanceRotateRedSibling(node);
        }
    }

    /**
     * "Case Two" of double-black rebalancing.  In the following case:
     * - The parent of the node on which to rebalance is black
     * - The sibling of this node is red
     * - The sibling's children are black
     *
     * Rotate about the parent such that the sibling occupies its former
     * position in the tree.
     *
     * @param node The node relative to which to rebalance the tree.
     */
    @action.bound
    private async rebalanceRotateRedSibling(node: BinaryTreeNode): Promise<void> {
        // Avoid non-null assertions
        let parent = node.parent!, sibling = node.sibling!;
        if (parent.colour === this.BLACK && sibling.colour === this.RED
                && sibling.leftChild!.colour === this.BLACK && sibling.rightChild!.colour === this.BLACK) {
            await this.explainStep('Rotate about parent', <div>
                As the
                    <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
                of the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node upon which to rebalance </HighlightNode>
                the tree is <NodeColour colour={this.BLACK} /> and the
                    <HighlightNode node={sibling} colour={HighlightColours.ORANGE}>rebalance node's sibling </HighlightNode>
                is <NodeColour colour={this.RED} /> with exclusively <NodeColour colour={this.BLACK} /> children,
                we can rotate <strong>{node.isLeftChild() ? 'left' : 'right'}</strong> about the <strong>parent</strong>
                to restore compliance with the path rule.
            </div>);

            // Rotate in order to promote the sibling
            if (node.isLeftChild()) {
                this.rotateLeft(parent);
            } else {
                this.rotateRight(parent);
            }

            await this.explainStep('Recolour rotated nodes', <div>
                Now that we have finished rotating about the
                    <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
                of the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node upon which to rebalance</HighlightNode>
                , we still have a path rule violation to handle.
                The <strong>{node.isLeftChild() ? 'right' : 'left'}</strong> subtree of the
                    <HighlightNode node={sibling} colour={HighlightColours.ORANGE}>promoted sibling </HighlightNode>
                now has one fewer <NodeColour colour={this.BLACK} /> nodes than the
                <strong>{node.isLeftChild() ? 'left' : 'right'}</strong> subtree;
                to rectify this issue, we can recolour the parent <NodeColour colour={this.RED} /> and the sibling <NodeColour colour={this.BLACK} />.
            </div>);

            // Recolour to restore path rule compliance
            parent.colour = this.RED;
            sibling.colour = this.BLACK;
            await this.rebalanceRootDoubleBlack(node);
        } else {
            // Case does not apply, proceed to next
            await this.rebalanceBlackCluster(node);
        }
    }

    /**
     * "Case Three" of double-black rebalancing.  In the following case:
     * - The parent of the node on which to rebalance is black
     * - The sibling of the node is black
     * - The sibling's children are black
     *
     * Recolour the sibling red and rebalance relative to the parent.
     *
     * @param node The node relative to which to rebalanace the tree.
     */
    @action.bound
    private async rebalanceBlackCluster(node: BinaryTreeNode): Promise<void> {
        let parent = node.parent!, sibling = node.sibling!;
        if (parent.colour === this.BLACK && sibling.colour === this.BLACK
                && sibling.leftChild!.colour === this.BLACK && sibling.rightChild!.colour === this.BLACK) {
            await this.explainStep('Recolour sibling red', <div>
                As the
                    <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
                of the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node upon which to rebalance </HighlightNode>
                the tree is <NodeColour colour={this.BLACK} />, as are the
                    <HighlightNode node={sibling} colour={HighlightColours.ORANGE}>rebalance node's sibling </HighlightNode>
                and both of its children, we shall recolour the sibling <NodeColour colour={this.RED} /> in an attempt to restore compliance with the path rule.
                However, doing so may cause an invariant violation at a higher level of the tree,
                so we shall now attempt to rebalance relative to the <strong>parent</strong>.
            </div>);

            // Recolour in a in attempt to restore path rule violation
            sibling.colour = this.RED;
            await this.rebalanceRootDoubleBlack(parent);
        } else {
            // Case does not apply, proceed to next
            await this.rebalanceAlternatingSiblingBranch(node);
        }
    }

    /**
     * "Case Four" of double-black rebalancing.  In the following case:
     * - The parent of the node on which to rebalance is red
     * - The sibling of the node is black
     * - The sibling's children are black
     * 
     * Swap the colours of the parent and sibling to restore compliance with the
     * path rule.
     *
     * @param node The node relative to which to rebalance the tree.
     */
    @action.bound
    private async rebalanceAlternatingSiblingBranch(node: BinaryTreeNode): Promise<void> {
        let parent = node.parent!, sibling = node.sibling!;
        if (parent.colour === this.RED && sibling.colour === this.BLACK &&
                sibling.leftChild!.colour === this.BLACK && sibling.rightChild!.colour === this.BLACK) {
            await this.explainStep('Swap parent and sibling colours', <div>
                As the
                    <HighlightNode node={parent} colour={HighlightColours.BLUE}>parent </HighlightNode>
                of the
                    <HighlightNode node={node} colour={HighlightColours.GREEN}>node upon which to rebalance </HighlightNode>
                the tree is <NodeColour colour={this.RED} /> and the
                    <HighlightNode node={sibling} colour={HighlightColours.ORANGE}>rebalance node's sibling </HighlightNode>
                and both of its children are <NodeColour colour={this.BLACK} />,
                we shall simply swap their colours to restore compliance with the path rule.
            </div>);

            // Swap colours without recursing
            parent.colour = this.BLACK;
            sibling.colour = this.RED;
        } else {
            // Case does not apply, proceed to next
            // TODO case 5
        }
    }

    /**
     * Remove the specified node from the tree, provided that node is a leaf.
     * Removal is done "in-place" by simply setting the value and children of
     * the node to null.
     *
     * @param leaf The leaf node to remove from the tree.
     */
    @action.bound
    private async removeLeaf(leaf: BinaryTreeNode): Promise<void> {
        await this.explainStep('Replace leaf with null', <div>
            We have found the
                <HighlightNode node={leaf} colour={HighlightColours.RED}>node with value {leaf.value}</HighlightNode>
            , so we can now remove it.
            Since this node is a leaf, we shall replace it with null as it has no children to promote.
        </div>, true);

        leaf.makeNull();
    }
}
