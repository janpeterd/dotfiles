require("catppuccin").setup {
  flavour = "macchiato",
  transparent_background = false,
  integrations = {
    treesitter = true,
    treesitter_context = true,
    native_lsp = {
      enabled = true,
      virtual_text = {
        errors = { "italic" },
        hints = { "italic" },
        warnings = { "italic" },
        information = { "italic" },
      },
      underlines = {
        errors = { "underline" },
        hints = { "underline" },
        warnings = { "underline" },
        information = { "underline" },
      },
      inlay_hints = {
        background = true,
      },
    },
    cmp = true,
    mason = true,
    dap = true,
    neogit = true,
    -- which_key = true,
    fidget = true,
    semantic_tokens = true,
    lsp_trouble = true,
    indent_blankline = {
      enabled = true,
      colored_indent_levels = false,
    },
  },
}
