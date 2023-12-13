/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

import type {Element, ElementType} from 'react';

import * as FabricUIManager from './FabricUIManagerMock';

import {act} from 'react-test-renderer';
import ReactFabric from 'react-native/Libraries/Renderer/shims/ReactFabric';

type ReactNode = {
  children: Array<ReactNode>,
  props: {...},
  viewName: string,
  instanceHandle: {
    memoizedProps: {testID: ?string, ...},
    ...
  },
};

type RootReactNode = $ReadOnlyArray<ReactNode>;

type RenderResult = {
  toJSON: () => string,
  findByTestID: (testID: string) => ReactNode,
};

function buildRenderResult(rootNode: RootReactNode): RenderResult {
  return {
    toJSON: () => stringify(rootNode),
    findByTestID: (testID: string) => findByTestID(rootNode, testID),
  };
}

export function render(
  element: Element<ElementType>,
): RenderResult {
  const manager = FabricUIManager.getFabricUIManager();
  if (!manager) {
    throw new Error('No FabricUIManager found');
  }
  const containerTag = Math.round(Math.random() * 1000000);
  act(() => {
    ReactFabric.render(element, containerTag, () => {}, true);
  });

  // $FlowFixMe
  const root: RootReactNode = manager.getRoot(containerTag);

  if (root == null) {
    throw new Error('No root found for containerTag ' + containerTag);
  }

  return buildRenderResult(root);
}

export function fireEvent(node: ReactNode, eventName: 'press') {
  const manager = FabricUIManager.getFabricUIManager();
  if (!manager) {
    throw new Error('No FabricUIManager found');
  }
  const touch = {};
  const event = new Event('touchstart');
  const event2 = new Event('touchend');
  // $FlowFixMe
  event.changedTouches = [];
  // $FlowFixMe
  event.touches = [touch];
  // $FlowFixMe
  event2.changedTouches = [];
  // $FlowFixMe
  event2.touches = [touch];

  act(() => {
    manager.fireEvent(node.instanceHandle, 'topTouchStart', event);
    manager.fireEvent(node.instanceHandle, 'topTouchEnd', event2);
  });
}

function stringify(
  node: RootReactNode | ReactNode,
  indent: string = '',
): string {
  const nextIndent = '  ' + indent;
  if (Array.isArray(node)) {
    return `<>
${node.map(n => nextIndent + stringify(n, nextIndent)).join('\n')}
</>`;
  }
  const children = node.children;
  const props = node.props
    ? Object.entries(node.props)
        .map(([k, v]) => ` ${k}=${JSON.stringify(v) ?? ''}`)
        .join('')
    : '';

  if (children.length > 0) {
    return `<${node.viewName}${props}>
${children.map(c => nextIndent + stringify(c, nextIndent)).join('\n')}
${indent}</${node.viewName}>`;
  } else {
    return `<${node.viewName}${props} />`;
  }
}

function findBy(node: ReactNode, predicate: ReactNode => boolean): ?ReactNode {
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

function findByTestID(root: RootReactNode, testID: string) {
  const node = findBy(
    root[0],
    n => n.instanceHandle?.memoizedProps?.testID === testID,
  );

  if (node == null) {
    throw new Error(`Could not find a node with the testID "${testID}"`);
  }

  return node;
}
