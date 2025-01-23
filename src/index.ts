import { ExtensionContext } from "@foxglove/extension";

import { initApollo_transmit } from "./Apollo_transmitPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "Apollo_test", initPanel: initApollo_transmit });
}
