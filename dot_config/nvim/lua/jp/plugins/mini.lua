return {
  {
    "echasnovski/mini.nvim",
    lazy = false,
    priority = 500,
    config = function()
      require("mini.bufremove").setup()
      require("mini.ai").setup()
      require("mini.notify").setup {
        content = {
          format = nil,
          sort = nil,
        },

        lsp_progress = {
          enable = true,
          duration_last = 1000,
        },

        window = {
          config = {
            border = "rounded",
          },

          max_width_share = 0.382,
          winblend = 25,
        },
      }

      -- KEYMAPS
      vim.keymap.set(
        "n",
        "<leader>bj",
        require("mini.bufremove").delete,
        { desc = "[B]uffer [J]oink (delete buf, keep window)" }
      )
    end,
  },
}
