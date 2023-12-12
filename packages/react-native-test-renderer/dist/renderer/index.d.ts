/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 *
 */

import type { Element, ElementType } from "react";
type ReactNode = {
  children: Array<ReactNode>;
  props: {};
  viewName: string;
  instanceHandle: { memoizedProps: { testID: null | undefined | string } };
};
type RenderResult = {
  toJSON: () => string;
  findByTestID: (testID: string) => ReactNode;
};
export declare function render(
  element: Element<ElementType>
): Promise<RenderResult>;
export declare function fireEvent(node: ReactNode, eventName: "press"): void;
