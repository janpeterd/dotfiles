return {
  {
    "folke/zen-mode.nvim",
    lazy = true,
    cmd = "ZenMode",
    keys = {
      { "<leader>TW", desc = "[T]oggle [W]ritermode (zen)" },
    },
    config = function()
      require("zen-mode").setup {
        plugins = {
          twilight = { enabled = false },
        },
        window = {
          options = {
            spell = true,
            wrap = true,
            linebreak = true,
            signcolumn = "no",
            colorcolumn = "",
            cursorline = false,
            scrolloff = 99999,
          },
          width = 0.90, -- width will be 85% of the editor width
          height = 0.80, -- height of the Zen window
        },
      }

      vim.keymap.set("n", "<leader>TW", "<cmd>ZenMode<cr>")
    end,
  },
}
