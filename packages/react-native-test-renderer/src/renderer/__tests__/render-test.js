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

import * as ReactNativeTestRenderer from '../ReactNativeTestRenderer';

import * as React from 'react';
import {Text, View} from 'react-native';
import 'react-native/Libraries/Components/View/ViewNativeComponent';

function TestComponent() {
  return (
    <View>
      <Text>Hello</Text>
      <View />
    </View>
  );
}

function TestComponent2() {
  return (
    <View testID="top">
      <Text>Hello</Text>
      <View testID="world-container">
        <Text>World</Text>
      </View>
    </View>
  );
}


describe('render', () => {
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = undefined;
  })

  describe('toJSON', () => {
    it('returns expected JSON output based on renderer component', async () => {
      const result = await ReactNativeTestRenderer.render(<TestComponent />);
      expect(result.toJSON()).toMatchSnapshot();
    });
  });

  describe('findByTestID', () => {
    it('returns the first element with a matching testID', async () => {
      const result = await ReactNativeTestRenderer.render(<TestComponent2 />);
      expect(result.findByTestID('world-container')).not.toBeNull();
    });
  });

  describe('press', () => {
    it('invokes onPress callback', async () => {
      let pressed = false;
      const result = await ReactNativeTestRenderer.render(
        <View>
          <Text testID="text" onPress={() => (pressed = true)}>
            Hello
          </Text>
        </View>,
      );
      const text = result.findByTestID('text');
      expect(pressed).toBe(false);
      ReactNativeTestRenderer.fireEvent(text, 'press');
      expect(pressed).toBe(true);
    });
  });
});
