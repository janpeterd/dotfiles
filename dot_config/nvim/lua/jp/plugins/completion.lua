return {
  {
    "saghen/blink.cmp",
    enabled = false,
    dependencies = {
      "rafamadriz/friendly-snippets",
    },

    version = "1.*",
    ---@module 'blink.cmp'
    ---@type blink.cmp.Config
    opts = {
      enabled = function()
        return not vim.g.disable_completion
      end,

      -- 'default' for mappings similar to built-in completion
      -- 'super-tab' for mappings similar to vscode (tab to accept, arrow keys to navigate)
      -- 'enter' for mappings similar to 'super-tab' but with 'enter' to accept
      keymap = { preset = "default" },

      appearance = {
        use_nvim_cmp_as_default = true,
        nerd_font_variant = "mono",
      },

      sources = {
        default = { "lazydev", "lsp", "path", "snippets" },
        providers = {
          lazydev = {
            name = "LazyDev",
            module = "lazydev.integrations.blink",
            score_offset = 100,
          },
        },
      },
      fuzzy = { implementation = "prefer_rust_with_warning" },
      completion = {
        documentation = {
          window = { border = "rounded" },
          auto_show = true,
        },
        menu = { border = "rounded" },
      },
    },
    opts_extend = { "sources.default" },
  },
}
