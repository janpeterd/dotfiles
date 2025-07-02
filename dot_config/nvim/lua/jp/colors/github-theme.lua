local spec = require("github-theme.spec").load "github_dark"
local palette = spec.palette

require("github-theme").setup {
  groups = {
    github_dark_high_contrast = {
      ["Function"] = { fg = "palette.green" },
      ["@property"] = { fg = "palette.green" },
      ["@type"] = { fg = "palette.orange" },
      ["@type.builtin"] = { fg = "palette.orange" },
      ["@variable.member"] = { fg = "palette.orange" },
      ["@org.keyword.done"] = { fg = "palette.red" },
      ["@org.agenda.scheduled"] = { fg = "palette.green" },
      TelescopeMatching = { fg = "palette.green" },
      TelescopeTitle = { fg = "palette.green" },
      TelescopeSelectionCaret = { fg = "palette.green" },
      HarpoonBorder = { fg = "palette.green" },
      TelescopeBorder = { fg = "palette.green" },
      GitSignsAdd = { fg = "palette.green" },
      GitSignsChange = { fg = "palette.blue" },
      GitSignsDelete = { fg = "palette.red" },
    },
  },
  options = {
    styles = { -- Style to be applied to different syntax groups
      comments = "italic", -- Value is any valid attr-list value `:help attr-list`
      functions = "bold,italic",
      keywords = "NONE",
      variables = "NONE",
      conditionals = "bold",
      constants = "NONE",
      numbers = "NONE",
      operators = "NONE",
      strings = "italic",
      types = "bold",
    },
    darken = { -- Darken floating windows and sidebar-like windows
      floats = false,
      sidebars = {
        enable = true,
        list = { "TERMINAL" }, -- Apply dark background to specific windows
      },
    },
    modules = {
      dap = {
        enabled = true,
        enable_ui = true, -- enable nvim-dap-ui
      },
      cmp = true,
      gitsigns = true,
      telescope = true,
      fidget = true,
      neogit = true,
      treesitter = true,
      -- whichkey = true,
    },
  },
}
