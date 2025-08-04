local configuration = vim.fn["sonokai#get_configuration"]()
local palette = vim.fn["sonokai#get_palette"](configuration.style, configuration.colors_override)

vim.cmd [[
        highlight clear DiffAdd
        highlight clear DiffChange
        highlight clear DiffDelete
        highlight clear DiffText
]]

vim.api.nvim_set_hl(0, "DiffAdd", {
  fg = "none",
  bg = palette.bg_green[1],
})

vim.api.nvim_set_hl(0, "DiffChange", {
  fg = "none",
  bg = palette.bg_blue[1],
})

vim.api.nvim_set_hl(0, "DiffDelete", {
  fg = "none",
  bg = palette.bg_red[1],
})

vim.api.nvim_set_hl(0, "DiffText", {
  fg = palette.yellow[1],
  bg = palette.bg_yellow[1],
  bold = true,
})
