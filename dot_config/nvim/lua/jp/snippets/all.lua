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

-- Return the snippets for all filetypes
return {
	-- Choice snippet with my name
	s("name", c(1, { t("Jan-Peter Dhallé"), t("Jan-Peter"), t("Dhallé"), t("BenoîtCartier") })),
	-- Choice snippet with my email
	s("mailaddr",
		c(1, { t("janpeter.dhalle@gmail.com"), t("janpeter3110@gmail.com"), t("janpeter.dhalle@protonmail.com") })),

	-- PROGRAMMING
	s("ternary", fmt(
		"{} = ({}) ? {} : {}, ", { i(1, "a"), i(2, "condition"), i(3, "b"), i(4, "c") }
	))
}


-- c = (a < b) ? a : b;
