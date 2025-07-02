return {
  {
    "tpope/vim-fugitive",
    lazy = false,
    config = function()
      vim.keymap.set("n", "<leader>gg", ":Git<CR>", { desc = "[G]it summary" })
      vim.keymap.set("n", "<leader>g<space>", ":Git ", { desc = "[G]it command builder" })
    end,
  },

  -- -- GIT SIGNS AND NAVIGATION
  {
    "lewis6991/gitsigns.nvim",
    lazy = true,
    event = { "BufReadPre", "BufNewFile" },
    cmd = "Gitsigns",
    config = function()
      require("gitsigns").setup {
        signcolumn = true, -- Toggle with `:Gitsigns toggle_signs`
        numhl = false,     -- Toggle with `:Gitsigns toggle_numhl`
        linehl = false,    -- Toggle with `:Gitsigns toggle_linehl`
        word_diff = false, -- Toggle with `:Gitsigns toggle_word_diff`
        on_attach = function(bufnr)
          local gs = package.loaded.gitsigns
          local function map(mode, l, r, opts)
            opts = opts or {}
            opts.buffer = bufnr
            vim.keymap.set(mode, l, r, opts)
          end
          map("n", "<leader>gr", ":Gitsigns reset_hunk<CR>", { desc = "[G]it [r]eset hunk" })
          map("n", "<leader>gR", ":Gitsigns reset_buffer<CR>", { desc = "[G]it [r]eset buffer" })
          map("n", "<leader>gd", gs.diffthis, { desc = "[G]it [d]iff" })
          map("n", "<leader>gD", ":Gitsigns toggle_word_diff<CR>", { desc = "[G]it word [D]iff" })
          map("n", "<leader>gh", "<cmd>Gitsigns preview_hunk<CR>", { desc = "[G]it [H]unk (gitsigns)" })
          map("n", "]g", ":Gitsigns next_hunk<CR>", { desc = "Goto next hunk gitsigns" })
          map("n", "[g", ":Gitsigns prev_hunk<CR>", { desc = "Goto prev hunk gitsigns" })
          map(
            "n",
            "<leader>gB",
            ":Gitsigns blame<CR><C-w>w:Gitsigns toggle_current_line_blame<CR>",
            { desc = "[G]it [b]lame" }
          )
        end,
      }
    end,
  },
  { "akinsho/git-conflict.nvim", version = "*", config = true },
}
