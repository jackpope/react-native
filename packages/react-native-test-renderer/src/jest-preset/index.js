/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

module.export = {
  globalSetup: function() {},
  globalTeardown: function() {},
  testEnvironment: require('../jest-environment/index'),
  setupFiles: [require('../jest-setup/index')],
};
