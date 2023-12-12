/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 *
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.fromNode = fromNode;
exports.getFabricUIManager = getFabricUIManager;
exports.getNodeInChildSet = getNodeInChildSet;
exports.toNode = toNode;
var _RootTag = require("../../../react-native/Libraries/ReactNative/RootTag.js");
function fromNode(node) {
  // $FlowExpectedError[incompatible-return]
  return node;
}
function toNode(node) {
  // $FlowExpectedError[incompatible-return]
  return node;
}

// Mock of the Native Hooks

const roots = new Map();
const allocatedTags = new Set();
function ensureHostNode(node) {
  if (node == null || typeof node !== "object") {
    throw new Error(
      `Expected node to be an object. Got ${
        node === null ? "null" : typeof node
      } value`
    );
  }
  if (typeof node.viewName !== "string") {
    throw new Error(
      `Expected node to be a host node. Got object with ${
        node.viewName === null ? "null" : typeof node.viewName
      } viewName`
    );
  }
}
function getAncestorsInChildSet(node, childSet) {
  const rootNode = toNode({
    reactTag: 0,
    rootTag: fromNode(node).rootTag,
    viewName: "RootNode",
    // $FlowExpectedError
    instanceHandle: null,
    props: {},
    children: childSet,
  });
  let position = 0;
  for (const child of childSet) {
    const ancestors = getAncestors(child, node);
    if (ancestors) {
      return [[rootNode, position]].concat(ancestors);
    }
    position++;
  }
  return null;
}
function getAncestorsInCurrentTree(node) {
  const childSet = roots.get(fromNode(node).rootTag);
  if (childSet == null) {
    return null;
  }
  return getAncestorsInChildSet(node, childSet);
}
function getAncestors(root, node) {
  if (fromNode(root).reactTag === fromNode(node).reactTag) {
    return [];
  }
  let position = 0;
  for (const child of fromNode(root).children) {
    const ancestors = getAncestors(child, node);
    if (ancestors != null) {
      return [[root, position]].concat(ancestors);
    }
    position++;
  }
  return null;
}
function getNodeInChildSet(node, childSet) {
  const ancestors = getAncestorsInChildSet(node, childSet);
  if (ancestors == null) {
    return null;
  }
  const [parent, position] = ancestors[ancestors.length - 1];
  const nodeInCurrentTree = fromNode(parent).children[position];
  return nodeInCurrentTree;
}
function getNodeInCurrentTree(node) {
  const childSet = roots.get(fromNode(node).rootTag);
  if (childSet == null) {
    return null;
  }
  return getNodeInChildSet(node, childSet);
}
function* dfs(node) {
  if (node == null) {
    return;
  }
  yield node;
  for (const child of fromNode(node).children) {
    yield* dfs(child);
  }
}
function hasDisplayNone(node) {
  const props = fromNode(node).props;
  // Style is flattened when passed to native, so there's no style object.
  // $FlowFixMe[prop-missing]
  return props != null && props.display === "none";
}
const commitHooks = new Set();
let eventDispatcher;
const FabricUIManagerMock = {
  registerEventHandler: (dispatchEvent) => {
    eventDispatcher = dispatchEvent;
  },
  fireEvent: (fiberTarget, topLevelType, nativeEvent) => {
    if (!eventDispatcher) {
      throw new Error("No event dispatcher registered");
    }
    eventDispatcher(fiberTarget, topLevelType, nativeEvent);
  },
  setIsJSResponder: () => {},
  createNode: jest.fn((reactTag, viewName, rootTag, props, instanceHandle) => {
    if (allocatedTags.has(reactTag)) {
      throw new Error(`Created two native views with tag ${reactTag}`);
    }
    allocatedTags.add(reactTag);
    return toNode({
      reactTag,
      rootTag,
      viewName,
      instanceHandle,
      props: props,
      children: [],
    });
  }),
  cloneNode: jest.fn((node) => {
    return toNode({
      ...fromNode(node),
    });
  }),
  cloneNodeWithNewChildren: jest.fn((node) => {
    return toNode({
      ...fromNode(node),
      children: [],
    });
  }),
  cloneNodeWithNewProps: jest.fn((node, newProps) => {
    return toNode({
      ...fromNode(node),
      props: {
        ...fromNode(node).props,
        ...newProps,
      },
    });
  }),
  cloneNodeWithNewChildrenAndProps: jest.fn((node, newProps) => {
    return toNode({
      ...fromNode(node),
      children: [],
      props: {
        ...fromNode(node).props,
        ...newProps,
      },
    });
  }),
  createChildSet: jest.fn((rootTag) => {
    return [];
  }),
  appendChild: jest.fn((parentNode, child) => {
    // Although the signature returns a Node, React expects this to be mutating.
    fromNode(parentNode).children.push(child);
    return parentNode;
  }),
  appendChildToSet: jest.fn((childSet, child) => {
    childSet.push(child);
  }),
  completeRoot: jest.fn((rootTag, childSet) => {
    commitHooks.forEach((hook) =>
      hook.shadowTreeWillCommit(rootTag, roots.get(rootTag), childSet)
    );
    roots.set(rootTag, childSet);
  }),
  measure: jest.fn((node, callback) => {
    ensureHostNode(node);
    callback(10, 10, 100, 100, 0, 0);
  }),
  measureInWindow: jest.fn((node, callback) => {
    ensureHostNode(node);
    callback(10, 10, 100, 100);
  }),
  measureLayout: jest.fn((node, relativeNode, onFail, onSuccess) => {
    ensureHostNode(node);
    ensureHostNode(relativeNode);
    onSuccess(1, 1, 100, 100);
  }),
  configureNextLayoutAnimation: jest.fn(
    (config, callback, errorCallback) => {}
  ),
  sendAccessibilityEvent: jest.fn((node, eventType) => {}),
  findShadowNodeByTag_DEPRECATED: jest.fn((reactTag) => {}),
  getBoundingClientRect: jest.fn((node, includeTransform) => {
    ensureHostNode(node);
    const nodeInCurrentTree = getNodeInCurrentTree(node);
    const currentProps =
      nodeInCurrentTree != null ? fromNode(nodeInCurrentTree).props : null;
    if (currentProps == null) {
      return null;
    }
    const boundingClientRectForTests =
      // $FlowExpectedError[prop-missing]
      currentProps.__boundingClientRectForTests;
    if (boundingClientRectForTests == null) {
      return null;
    }
    const { x, y, width, height } = boundingClientRectForTests;
    return [x, y, width, height];
  }),
  hasPointerCapture: jest.fn((node, pointerId) => false),
  setPointerCapture: jest.fn((node, pointerId) => {}),
  releasePointerCapture: jest.fn((node, pointerId) => {}),
  setNativeProps: jest.fn((node, newProps) => {}),
  dispatchCommand: jest.fn((node, commandName, args) => {}),
  getParentNode: jest.fn((node) => {
    const ancestors = getAncestorsInCurrentTree(node);
    if (ancestors == null || ancestors.length - 2 < 0) {
      return null;
    }
    const [parentOfParent, position] = ancestors[ancestors.length - 2];
    const parentInCurrentTree = fromNode(parentOfParent).children[position];
    return fromNode(parentInCurrentTree).instanceHandle;
  }),
  getChildNodes: jest.fn((node) => {
    const nodeInCurrentTree = getNodeInCurrentTree(node);
    if (nodeInCurrentTree == null) {
      return [];
    }
    return fromNode(nodeInCurrentTree).children.map(
      (child) => fromNode(child).instanceHandle
    );
  }),
  isConnected: jest.fn((node) => {
    return getNodeInCurrentTree(node) != null;
  }),
  getTextContent: jest.fn((node) => {
    const nodeInCurrentTree = getNodeInCurrentTree(node);
    let result = "";
    if (nodeInCurrentTree == null) {
      return result;
    }
    for (const childNode of dfs(nodeInCurrentTree)) {
      if (fromNode(childNode).viewName === "RCTRawText") {
        const props = fromNode(childNode).props;
        // $FlowExpectedError[prop-missing]
        const maybeString = props.text;
        if (typeof maybeString === "string") {
          result += maybeString;
        }
      }
    }
    return result;
  }),
  compareDocumentPosition: jest.fn((node, otherNode) => {
    /* eslint-disable no-bitwise */
    const ReadOnlyNode =
      require("../../../react-native/Libraries/DOM/Nodes/ReadOnlyNode.js").default;

    // Quick check for node vs. itself
    if (fromNode(node).reactTag === fromNode(otherNode).reactTag) {
      return 0;
    }
    if (fromNode(node).rootTag !== fromNode(otherNode).rootTag) {
      return ReadOnlyNode.DOCUMENT_POSITION_DISCONNECTED;
    }
    const ancestors = getAncestorsInCurrentTree(node);
    if (ancestors == null) {
      return ReadOnlyNode.DOCUMENT_POSITION_DISCONNECTED;
    }
    const otherAncestors = getAncestorsInCurrentTree(otherNode);
    if (otherAncestors == null) {
      return ReadOnlyNode.DOCUMENT_POSITION_DISCONNECTED;
    }

    // Consume all common ancestors
    let i = 0;
    while (
      i < ancestors.length &&
      i < otherAncestors.length &&
      ancestors[i][1] === otherAncestors[i][1]
    ) {
      i++;
    }
    if (i === ancestors.length) {
      return (
        ReadOnlyNode.DOCUMENT_POSITION_CONTAINED_BY |
        ReadOnlyNode.DOCUMENT_POSITION_FOLLOWING
      );
    }
    if (i === otherAncestors.length) {
      return (
        ReadOnlyNode.DOCUMENT_POSITION_CONTAINS |
        ReadOnlyNode.DOCUMENT_POSITION_PRECEDING
      );
    }
    if (ancestors[i][1] > otherAncestors[i][1]) {
      return ReadOnlyNode.DOCUMENT_POSITION_PRECEDING;
    }
    return ReadOnlyNode.DOCUMENT_POSITION_FOLLOWING;
  }),
  getOffset: jest.fn((node) => {
    const ancestors = getAncestorsInCurrentTree(node);
    if (ancestors == null) {
      return null;
    }
    const [parent, position] = ancestors[ancestors.length - 1];
    const nodeInCurrentTree = fromNode(parent).children[position];
    const currentProps =
      nodeInCurrentTree != null ? fromNode(nodeInCurrentTree).props : null;
    if (currentProps == null || hasDisplayNone(nodeInCurrentTree)) {
      return null;
    }
    const offsetForTests =
      // $FlowExpectedError[prop-missing]
      currentProps.__offsetForTests;
    if (offsetForTests == null) {
      return null;
    }
    let currentIndex = ancestors.length - 1;
    while (currentIndex >= 0 && !hasDisplayNone(ancestors[currentIndex][0])) {
      currentIndex--;
    }
    if (currentIndex >= 0) {
      // The node or one of its ancestors have display: none
      return null;
    }
    return [
      fromNode(parent).instanceHandle,
      offsetForTests.top,
      offsetForTests.left,
    ];
  }),
  getScrollPosition: jest.fn((node) => {
    ensureHostNode(node);
    const nodeInCurrentTree = getNodeInCurrentTree(node);
    const currentProps =
      nodeInCurrentTree != null ? fromNode(nodeInCurrentTree).props : null;
    if (currentProps == null) {
      return null;
    }
    const scrollForTests =
      // $FlowExpectedError[prop-missing]
      currentProps.__scrollForTests;
    if (scrollForTests == null) {
      return null;
    }
    const { scrollLeft, scrollTop } = scrollForTests;
    return [scrollLeft, scrollTop];
  }),
  getScrollSize: jest.fn((node) => {
    ensureHostNode(node);
    const nodeInCurrentTree = getNodeInCurrentTree(node);
    const currentProps =
      nodeInCurrentTree != null ? fromNode(nodeInCurrentTree).props : null;
    if (currentProps == null) {
      return null;
    }
    const scrollForTests =
      // $FlowExpectedError[prop-missing]
      currentProps.__scrollForTests;
    if (scrollForTests == null) {
      return null;
    }
    const { scrollWidth, scrollHeight } = scrollForTests;
    return [scrollWidth, scrollHeight];
  }),
  getInnerSize: jest.fn((node) => {
    ensureHostNode(node);
    const nodeInCurrentTree = getNodeInCurrentTree(node);
    const currentProps =
      nodeInCurrentTree != null ? fromNode(nodeInCurrentTree).props : null;
    if (currentProps == null) {
      return null;
    }
    const innerSizeForTests =
      // $FlowExpectedError[prop-missing]
      currentProps.__innerSizeForTests;
    if (innerSizeForTests == null) {
      return null;
    }
    const { width, height } = innerSizeForTests;
    return [width, height];
  }),
  getBorderSize: jest.fn((node) => {
    ensureHostNode(node);
    const nodeInCurrentTree = getNodeInCurrentTree(node);
    const currentProps =
      nodeInCurrentTree != null ? fromNode(nodeInCurrentTree).props : null;
    if (currentProps == null) {
      return null;
    }
    const borderSizeForTests =
      // $FlowExpectedError[prop-missing]
      currentProps.__borderSizeForTests;
    if (borderSizeForTests == null) {
      return null;
    }
    const {
      topWidth = 0,
      rightWidth = 0,
      bottomWidth = 0,
      leftWidth = 0,
    } = borderSizeForTests;
    return [topWidth, rightWidth, bottomWidth, leftWidth];
  }),
  getTagName: jest.fn((node) => {
    ensureHostNode(node);
    return "RN:" + fromNode(node).viewName;
  }),
  getRoot(containerTag) {
    const tag = (0, _RootTag.createRootTag)(containerTag);
    const root = roots.get(tag);
    if (!root) {
      throw new Error("No root found for containerTag " + Number(tag));
    }
    return root;
  },
  __getInstanceHandleFromNode(node) {
    return fromNode(node).instanceHandle;
  },
  __addCommitHook(commitHook) {
    commitHooks.add(commitHook);
  },
  __removeCommitHook(commitHook) {
    commitHooks.delete(commitHook);
  },
};
global.nativeFabricUIManager = FabricUIManagerMock;
function getFabricUIManager() {
  return FabricUIManagerMock;
}
