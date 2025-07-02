return {
  {
    "windwp/nvim-autopairs",
    event = "InsertEnter",
    opts = {
      check_ts = true,
      disable_filetypes = { "TelescopePrompt", "vim" },
      disable_in_replace_mode = false,
      -- ts_config = { java = false },
      config = function()
        local autopairs = require "nvim-autopairs"
        local Rule = autopairs.rule
        local ts_conds = autopairs.ts_conds

        autopairs.setup {
          check_ts = true,
          disable_filetypes = { "TelescopePrompt", "vim" },
          disable_in_replace_mode = false,
        }

        -- Rules with or without treesitter: https://github.com/windwp/nvim-autopairs#treesitter
        autopairs.add_rules {
          Rule("*", "*", "markdown"):with_pair(ts_conds.is_not_ts_node { "code_span" }),
        }
      end,
    },
  },
}
