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
  -- Pre => stringify the data and display in pre block
  s(
    "pre",
    fmt(
      [[
<pre>
  {{JSON.stringify({data}, null, 2)}}
</pre>
]],
      {
        data = i(0, "data"),
      }
    )
  ),
  s(
    "script",
    fmt(
      [[
<script{lang}>
  {script}
</script>
]],
      {
        lang = i(0, ' lang="ts"'),
        script = i(1),
      }
    )
  ),
}
