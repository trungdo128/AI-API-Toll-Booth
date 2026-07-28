import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { inlineScriptHashes } from "../src/security/csp-hashes.js";

describe("inlineScriptHashes", () => {
  it("allows only exact inline scripts emitted by the static Next build", () => {
    const first = "self.__next_f.push([1])";
    const second = "self.__next_f.push([2])";
    const expected = (value: string) =>
      `'sha256-${createHash("sha256").update(value).digest("base64")}'`;
    expect(inlineScriptHashes([
      `<script>${first}</script><script src="/bundle.js"></script>`,
      `<script>${second}</script><script>${first}</script>`,
    ])).toEqual([expected(first), expected(second)]);
  });
});
