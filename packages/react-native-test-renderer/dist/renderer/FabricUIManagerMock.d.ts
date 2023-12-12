/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 *
 */

import type {
  InternalInstanceHandle,
  Node,
} from "../../../react-native/Libraries/Renderer/shims/ReactNativeTypes";
import type { RootTag } from "../../../react-native/Libraries/ReactNative/RootTag.js";
import type {
  NodeProps,
  NodeSet,
  Spec as FabricUIManager,
} from "../../../react-native/Libraries/ReactNative/FabricUIManager.js";
export type NodeMock = {
  children: NodeSet;
  instanceHandle: InternalInstanceHandle;
  props: NodeProps;
  reactTag: number;
  rootTag: RootTag;
  viewName: string;
};
export declare function fromNode(node: Node): NodeMock;
export declare function toNode(node: NodeMock): Node;
export declare function getNodeInChildSet(
  node: Node,
  childSet: NodeSet
): null | undefined | Node;
interface IFabricUIManagerMock extends FabricUIManager {
  fireEvent(
    fiberTarget: {},
    topLevelType: TopLevelType,
    nativeEvent: Event
  ): void;
  getRoot(rootTag: RootTag | number): NodeSet;
  __getInstanceHandleFromNode(node: Node): InternalInstanceHandle;
  __addCommitHook(commitHook: UIManagerCommitHook): void;
  __removeCommitHook(commitHook: UIManagerCommitHook): void;
}
export interface UIManagerCommitHook {
  shadowTreeWillCommit: (
    rootTag: RootTag,
    oldChildSet: null | undefined | NodeSet,
    newChildSet: NodeSet
  ) => void;
}
type TopLevelType =
  | "topMouseDown"
  | "topMouseMove"
  | "topMouseUp"
  | "topScroll"
  | "topSelectionChange"
  | "topTouchCancel"
  | "topTouchEnd"
  | "topTouchMove"
  | "topTouchStart";
export declare function getFabricUIManager():
  | null
  | undefined
  | IFabricUIManagerMock;
