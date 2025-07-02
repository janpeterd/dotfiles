local ls = require "luasnip"

-- snippet
local s = ls.s
-- snippet node
local sn = ls.sn
-- Insert
local i = ls.insert_node
-- Text
local t = ls.text_node
-- Dynamic
local d = ls.dynamic_node
-- Dynamic
local c = ls.choice_node
-- Function
local f = ls.function_node
-- Format
local fmt = require("luasnip.extras.fmt").fmt
local fmta = require("luasnip.extras.fmt").fmta

-- Return the snippets for all filetypes
return {
  -- Console log snippet
  s("cl", { t { 'console.log(' }, i(0), t { ')' } }),
  s(
    "s-load",
    fmta(
      [[
export async function load ({ <params> }) {

}
]],
      {
        params = i(0),
      }
    )
  ),
}
