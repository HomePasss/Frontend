// CHANGE: Browser polyfills for Node globals required by wallet-adapter deps.
// WHY: Vite externalizes the `buffer` module; wiring the global prevents runtime errors.
// QUOTE(TЗ): "Данные не грузятся почему-то" (wallet error blocked init)
// REF: user-message-7
// SOURCE: https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility

import { Buffer } from 'buffer'

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}
