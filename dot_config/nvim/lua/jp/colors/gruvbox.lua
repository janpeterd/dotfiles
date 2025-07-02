require("gruvbox").setup {
  terminal_colors = true, -- add neovim terminal colors
  undercurl = true,
  underline = true,
  bold = true,
  italic = {
    strings = true,
    emphasis = true,
    comments = true,
    operators = false,
    folds = true,
  },
  strikethrough = true,
  invert_selection = false,
  invert_signs = true,
  invert_tabline = true,
  invert_intend_guides = false,
  inverse = true, -- invert background for search, diffs, statuslines and errors
  contrast = "hard", -- can be "hard", "soft" or empty string
  palette_overrides = {},
  overrides = {
    -- SignColumn = { bg = "#ff9900" },
    -- GruvboxGreenSign = { bg = "" },
    -- GruvboxOrangeSign = { bg = "" },
    -- GruvboxPurpleSign = { bg = "" },
    -- GruvboxYellowSign = { bg = "" },
    -- GruvboxRedSign = { bg = "" },
    -- GruvboxBlueSign = { bg = "" },
    -- GruvboxAquaSign = { bg = "" },
  },
  dim_inactive = false,
  transparent_mode = false,
}
