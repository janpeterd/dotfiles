return {
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    keys = {
      {
        "<leader>?",
        function()
          require("which-key").show { global = false }
        end,
        desc = "[?] Which Key",
      },
    },
    config = function()
      local wk = require "which-key"
      wk.add {
        { "<leader>g", group = "[G]it", icon = { name = "git", cat = "filetype", hl = "DevIconGitLogo" } },
        { "<leader>f", desc = "[F]ile", icon = { icon = "󰈔 ", color = "blue" } },
        { "<leader>b", desc = "[B]uffer", icon = { icon = "󰈔 ", color = "green" } },
        { "<leader>s", desc = "[S]earch", icon = { icon = " ", color = "yellow" } },
        { "<leader>w", desc = "[W]indow", icon = { icon = " ", color = "orange" } },
        { "<leader>u", desc = "[U]i", icon = { icon = "󰙵 ", color = "azure" } },
        { "<leader>t", desc = "[T]abs", icon = { icon = "󰓩 ", color = "purple" } },
        { "<leader>T", desc = "[T]oggle", icon = { icon = " ", color = "red" } },
        { "<leader>c", desc = "[C]ode (lsp)", icon = { icon = " ", color = "green" } },
        { "<leader>h", desc = "[H]elp", icon = { icon = "󰞋 ", color = "purple" } },
        { "<leader>o", desc = "[O]pen", icon = { icon = "󰌧 ", color = "cyan" } },
        { "<leader>r", desc = "[R]eload", icon = { icon = "󰑓 ", color = "yellow" } },
      }
      wk.setup {
        preset = "helix",
      }
    end,
  },
}
