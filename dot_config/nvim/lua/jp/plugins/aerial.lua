return {
  {
    "stevearc/aerial.nvim",
    opts = {},
    keys = {
      {
        "<leader>cl",
        "<cmd>AerialToggle!<CR>",
        desc = "[C]ode [L]ayout (aerial)",
      },
    },
    -- Optional dependencies
    dependencies = {
      "nvim-treesitter/nvim-treesitter",
      "nvim-tree/nvim-web-devicons",
    },
  },
}
