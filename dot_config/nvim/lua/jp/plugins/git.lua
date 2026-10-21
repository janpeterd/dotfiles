return {
  {
    "NeogitOrg/neogit",
    lazy = true,
    cmd = { "Neogit", "NeogitResetState" },
    keys = {
      {
        "<leader>gg",
        function()
          require("neogit").open { kind = "replace" }
        end,
        desc = "[G]it Neo[g]it",
      },
    },
    dependencies = {
      "nvim-lua/plenary.nvim",
      {
        "esmuellert/codediff.nvim",
        cmd = "CodeDiff",
        opts = {
          diff = { layout = "inline" },
        },
      },
    },
    config = function()
      -- Remove when Neogit adopts CodeDiff's current session schema:
      -- https://github.com/NeogitOrg/neogit/issues/2008
      local view = require "codediff.ui.view"
      local path = require "codediff.core.path"
      local create = view.create
      view.create = function(session, filetype, on_ready)
        if session.mode == "explorer" or session.mode == "standalone" then
          session.original = session.original or path.make_ref(session.original_path, session.git_root)
          session.modified = session.modified or path.make_ref(session.modified_path, session.git_root)
          if session.mode == "explorer" and not session.panel then
            session.panel = { name = "explorer", data = session.explorer_data or {} }
          end
        end
        return create(session, filetype, on_ready)
      end

      local neogit = require "neogit"
      neogit.setup {
        integrations = {
          telescope = true,
          codediff = true,
          auto_show_console_on = "always",
        },
      }
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
        numhl = false, -- Toggle with `:Gitsigns toggle_numhl`
        linehl = false, -- Toggle with `:Gitsigns toggle_linehl`
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
  {
    "FabijanZulj/blame.nvim",
    lazy = true,
    cmd = "BlameToggle",
    keys = {
      { "<leader>gB", desc = "[G]it [b]lame" },
    },
    config = function()
      require("blame").setup()
      vim.keymap.set("n", "<leader>gB", "<cmd>BlameToggle<cr>", { desc = "[G]it [b]lame" })
    end,
  },
  -- { "akinsho/git-conflict.nvim", version = "*", config = true },
  {
    "georgeguimaraes/review.nvim",
    version = "v*",
    dependencies = {
      "esmuellert/codediff.nvim",
      "MunifTanjim/nui.nvim",
    },
    event = "VeryLazy",
    keys = {
      { "<leader>rr", "<cmd>Review<cr>", desc = "Review working tree" },
      { "<leader>rc", "<cmd>Review commits<cr>", desc = "Review commits" },
      { "<leader>rb", "<cmd>Review branch<cr>", desc = "Review branch" },
      { "<leader>rn", ":Review note<cr>", mode = { "n", "v" }, desc = "Review: note here" },
      { "<leader>re", "<cmd>Review edit<cr>", desc = "Review: edit comment" },
      { "<leader>rd", "<cmd>Review delete<cr>", desc = "Review: delete comment" },
      { "<leader>rx", "<cmd>Review export<cr>", desc = "Review: export" },
    },
    opts = {},
  },
}
