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
exports.fireEvent = fireEvent;
exports.render = render;
var FabricUIManager = _interopRequireWildcard(require("./FabricUIManagerMock"));
var _reactTestRenderer = require("react-test-renderer");
var _ReactFabric = _interopRequireDefault(
  require("react-native/Libraries/Renderer/shims/ReactFabric")
);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function buildRenderResult(rootNode) {
  return {
    toJSON: () => stringify(rootNode),
    findByTestID: (testID) => findByTestID(rootNode, testID),
  };
}
async function render(element) {
  console.warn("*****START");
  throw new Error("1")
  const manager = FabricUIManager.getFabricUIManager();
  throw new Error("2")
  console.warn("*****GOT THE MANAGER");
  if (!manager) {
    throw new Error("No FabricUIManager found");
  }
  const containerTag = Math.round(Math.random() * 1000000);
  throw new Error("3")
  console.warn("*****before render");
  await (0, _reactTestRenderer.act)(() => {
    _ReactFabric.default.render(element, containerTag, () => {}, true);
  });
  throw new Error("4")
  console.warn("*****after render");

  // $FlowFixMe
  const root = manager.getRoot(containerTag);
  if (root == null) {
    throw new Error("No root found for containerTag " + containerTag);
  }
  return buildRenderResult(root);
}
function fireEvent(node, eventName) {
  const manager = FabricUIManager.getFabricUIManager();
  if (!manager) {
    throw new Error("No FabricUIManager found");
  }
  const touch = {};
  const event = new Event("touchstart");
  const event2 = new Event("touchend");
  // $FlowFixMe
  event.changedTouches = [];
  // $FlowFixMe
  event.touches = [touch];
  // $FlowFixMe
  event2.changedTouches = [];
  // $FlowFixMe
  event2.touches = [touch];
  (0, _reactTestRenderer.act)(() => {
    manager.fireEvent(node.instanceHandle, "topTouchStart", event);
    manager.fireEvent(node.instanceHandle, "topTouchEnd", event2);
  });
}
function stringify(node, indent = "") {
  const nextIndent = "  " + indent;
  if (Array.isArray(node)) {
    return `<>
${node.map((n) => nextIndent + stringify(n, nextIndent)).join("\n")}
</>`;
  }
  const children = node.children;
  const props = node.props
    ? Object.entries(node.props)
        .map(([k, v]) => ` ${k}=${JSON.stringify(v) ?? ""}`)
        .join("")
    : "";
  if (children.length > 0) {
    return `<${node.viewName}${props}>
${children.map((c) => nextIndent + stringify(c, nextIndent)).join("\n")}
${indent}</${node.viewName}>`;
  } else {
    return `<${node.viewName}${props} />`;
  }
}
function findBy(node, predicate) {
  if (!node) {
    return null;
  }
  if (predicate(node)) {
    return node;
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const result = findBy(child, predicate);
      if (result != null) {
        return result;
      }
    }
  }
  return null;
}
function findByTestID(root, testID) {
  const node = findBy(
    root[0],
    (n) => n.instanceHandle?.memoizedProps?.testID === testID
  );
  if (node == null) {
    throw new Error(`Could not find a node with the testID "${testID}"`);
  }
  return node;
}
