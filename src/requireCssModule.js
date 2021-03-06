// @flow

import {
  dirname,
  resolve
} from 'path';
import {
  readFileSync
} from 'fs';
import postcss from 'postcss';
import genericNames from 'generic-names';
import ExtractImports from 'postcss-modules-extract-imports';
import LocalByDefault from 'postcss-modules-local-by-default';
import Parser from 'postcss-modules-parser';
import Scope from 'postcss-modules-scope';
import Values from 'postcss-modules-values';
import type {
  StyleModuleMapType
} from './types';

const getTokens = (runner, cssSourceFilePath: string): StyleModuleMapType => {
  const lazyResult = runner
    .process(readFileSync(cssSourceFilePath, 'utf-8'), {
      from: cssSourceFilePath
    });

  lazyResult
    .warnings()
    .forEach((message) => {
      // eslint-disable-next-line no-console
      console.warn(message.text);
    });

  return lazyResult.root.tokens;
};

type OptionsType = {|
  generateScopedName?: string
|};

export default (cssSourceFilePath: string, options: OptionsType): StyleModuleMapType => {
  // eslint-disable-next-line prefer-const
  let runner;

  const scopedName = genericNames(options.generateScopedName);

  const fetch = (to: string, from: string) => {
    const fromDirectoryPath = dirname(from);
    const toPath = resolve(fromDirectoryPath, to);

    return getTokens(runner, toPath);
  };

  const plugins = [
    Values,
    LocalByDefault,
    ExtractImports,
    new Scope({
      generateScopedName: scopedName
    }),
    new Parser({
      fetch
    })
  ];

  runner = postcss(plugins);

  return getTokens(runner, cssSourceFilePath);
};
