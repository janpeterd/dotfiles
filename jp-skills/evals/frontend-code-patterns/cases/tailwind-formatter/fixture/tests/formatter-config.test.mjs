import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const config = fs.readFileSync(new URL("../oxfmt.config.ts", import.meta.url), "utf8")

test("sorts Tailwind v4 classes in repository helpers", () => {
  assert.match(config, /stylesheet:\s*["']\.\/src\/index\.css["']/)
  assert.match(config, /functions:\s*\[[^\]]*["']cn["']/s)
  assert.match(config, /functions:\s*\[[^\]]*["']cva["']/s)
})

test("keeps formatter scripts as the write and check paths", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
  )
  assert.equal(packageJson.scripts.format, "oxfmt .")
  assert.equal(packageJson.scripts["format:check"], "oxfmt --check .")
})
