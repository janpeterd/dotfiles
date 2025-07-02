return {
  {
    "stevearc/oil.nvim",
    lazy = false,
    priority = 50,
    config = function()
      local oil = require "oil"
      oil.setup {
        columns = { "icon" },
        delete_to_trash = false,
        keymaps = {
          ["<C-h>"] = false,
          ["<M-h>"] = "actions.select_split",
          ["g:"] = "actions.open_cmdline",
          ["y."] = "actions.copy_entry_path",
          view_options = {
            show_hidden = true,
          },
        },
      }

      -- Open parent directory in current window
      vim.keymap.set("n", "-", "<CMD>Oil<CR>", { desc = "Open parent directory (oil)" })

      -- Open parent directory in floating window
      vim.keymap.set("n", "<space>-", require("oil").toggle_float, { desc = "Floating file explorer (oil)" })
    end,
  },
}
