return {
  {
    "ibhagwan/fzf-lua",
    enabled = true,
    -- optional for icon support
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      local fzf_lua = require "fzf-lua"
      fzf_lua.setup { "fzf-native" }
      local set = vim.keymap.set
      set(
        "n",
        "<leader>fF",
        '<cmd>lua require(\'fzf-lua\').files({ cmd = [[find . -type f  -iname "*.*" ! -iname ".*" ]] })<CR>',
        { desc = "Fzf files" }
      )
      set("n", "<leader>ff", fzf_lua.files, { desc = "Fzf Files" })
      set(
        "n",
        "<leader>fd",
        "<cmd>lua require('fzf-lua').files({ cmd = 'find * -type d' })<CR>",
        { desc = "Fzf directories" }
      )
      set("n", "<leader>hh", fzf_lua.helptags, { desc = "Fzf help" })
      set("n", "<leader>hm", fzf_lua.manpages, { desc = "Fzf manpages" })
      set("n", "<leader>hk", fzf_lua.keymaps, { desc = "Fzf keymaps" })
      set("n", "<leader>bb", fzf_lua.buffers, { desc = "Fzf buffers" })
      set("n", "<leader>,", fzf_lua.buffers, { desc = "Fzf buffers" })
      set("n", "<leader>fr", fzf_lua.oldfiles, { desc = "Fzf oldfiles" })
      vim.keymap.set("n", "<leader>fcn", function()
        fzf_lua.files { cwd = "/home/jp/.local/share/chezmoi/dot_config/nvim" }
      end, { desc = "Fzf config files" })
      set("n", "<leader>fcN", function()
        fzf_lua.files { cwd = "/home/jp/Sync/org" }
      end, { desc = "Fzf org notes" })
      vim.keymap.set("n", "<leader>sg", function()
        require("fzf-lua").live_grep {
          winopts = {
            fullscreen = true,
          },
        }
      end, { desc = "Fzf live native grep" })
      vim.keymap.set("n", "<leader>sG", function()
        require("fzf-lua").grep {
          winopts = {
            fullscreen = true,
          },
        }
      end, { desc = "Fzf grep" })
      set("n", "<leader>gb", fzf_lua.git_branches, { desc = "Fzf git branches" })
      set("n", "<leader>uc", fzf_lua.colorschemes, { desc = "Fzf colorschemes" })
      set("n", "<leader>uh", fzf_lua.highlights, { desc = "Fzf highlights" })
      set("n", "<leader>gc", fzf_lua.git_commits, { desc = "Fzf git commits" })
      set("n", "<leader>gC", fzf_lua.git_bcommits, { desc = "Fzf git buffer commits" })
      vim.keymap.set("n", "<leader>ss", function()
        require("fzf-lua").blines { previewer = false }
      end, { desc = "Fzf buffer lines" })
    end,
  },
}
