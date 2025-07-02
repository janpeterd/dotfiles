local ls = require "luasnip"
local i = ls.insert_node
local s = ls.s
local fmt = require("luasnip.extras.fmt").fmt

return {
  s(
    "thymeleaf",
    fmt(
      [[
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>{title}</title>
</head>
<body>
    {body}
</body>
</html>
]],
      {
        title = i(1, "Page Title"),
        body = i(2, "Body Content"),
      }
    )
  ),
}
