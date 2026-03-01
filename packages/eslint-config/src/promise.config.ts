import { defineConfig } from 'eslint/config';
import promisePlugin from 'eslint-plugin-promise';

export function buildPromiseConfig() {
  return defineConfig([
    // @ts-expect-error -- ESLint plugin type incompatibility with defineConfig
    promisePlugin.configs['flat/recommended'],
    {
      rules: {
        'promise/always-return': ['error', { ignoreLastCallback: true }],
        'promise/no-multiple-resolved': 'error',
        'promise/no-promise-in-callback': 'error',
        // promise plugin の recommended が require-await を有効にするが、
        // buildTsConfig() ではなくここで off にする理由:
        // ESLint の設定は後勝ちのため、promise config が ts config より後に読み込まれると
        // ts config 側の設定が上書きされる。確実に off にするため、原因元の promise config 内で制御する。
        '@typescript-eslint/require-await': 'off',
      },
    },
  ]);
}
