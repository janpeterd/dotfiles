return {
  {
    "echasnovski/mini.nvim",
    lazy = false,
    priority = 500,
    enabled = function()
      return not vim.g.mininotify_disable
    end,
    config = function()
      -- require("mini.pick").setup()
      require("mini.extra").setup()
      require("mini.colors").setup()
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
      -- vim.keymap.set("n", "<leader>ff", "<cmd>Pick files<cr>", { desc = "[F]ind [f]iles" })
      -- vim.keymap.set("n", "<leader>fr", "<cmd>Pick oldfiles<cr>", { desc = "[F]ind [R]ecent files" })
      -- vim.keymap.set("n", "<leader>hh", "<cmd>Pick help<cr>", { desc = "[H]elp [h]elp pages" })
      -- vim.keymap.set("n", "<leader>hk", "<cmd>Pick keymaps<cr>", { desc = "[H]elp [K]eymaps" })
      -- vim.keymap.set("n", "<leader>,", "<cmd>Pick buffers<cr>", { desc = "[B]uffer [,] list" })
      -- vim.keymap.set("n", "<leader>sg", "<cmd>Pick grep_live<cr>", { desc = "[S]earch [g]rep (live update)" })
      -- vim.keymap.set("n", "<leader>sG", "<cmd>Pick grep<cr>", { desc = "[S]earch [g]rep (single grep)" })
      -- vim.keymap.set("n", "<leader>ss", "<cmd>Pick buf_lines<cr>", { desc = "[S]earch buffer lines" })
      -- vim.keymap.set("n", "<leader>uc", "<cmd>Pick colorschemes<cr>", { desc = "[U]i [C]olorschemes" })
      -- vim.keymap.set("n", "<leader>uh", "<cmd>Pick hipatterns<cr>", { desc = "[U]i [H]ighlights" })
      -- vim.keymap.set("n", "<leader>gb", "<cmd>Pick git_branches<cr>", { desc = "[G]it [B]ranches" })
      -- vim.keymap.set("n", "<leader>gf", '<cmd>Pick files tool="git"<cr>', { desc = "[G]it [F]iles" })
    end,
  },
}
