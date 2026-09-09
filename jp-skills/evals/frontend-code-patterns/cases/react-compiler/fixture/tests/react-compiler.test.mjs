import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
const viteConfig = fs.readFileSync("vite.config.ts", "utf8")

test("installs the React Compiler and Vite 6 Babel integration", () => {
  assert.ok(packageJson.devDependencies["babel-plugin-react-compiler"])
  assert.ok(packageJson.devDependencies["@rolldown/plugin-babel"])
})

test("connects the official compiler preset to Vite", () => {
  assert.ok(viteConfig.includes("reactCompilerPreset"))
  assert.ok(viteConfig.includes("@rolldown/plugin-babel"))
  assert.ok(viteConfig.includes("presets: [reactCompilerPreset()]"))
  assert.equal(viteConfig.includes("babel: {"), false)
})

test("keeps a compiler configuration check in the project workflow", () => {
  const scripts = packageJson.scripts ?? {}
  const commands = Object.values(scripts).join(" ")
  assert.ok(commands.includes("react-compiler"))
})
