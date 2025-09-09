return {
  {
    "ibhagwan/fzf-lua",
    enabled = true,
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      local fzf_lua = require "fzf-lua"
      local set = vim.keymap.set
      local defaults = fzf_lua.defaults.keymap.builtin

      local custom_keymaps = {
        ["<M-p>"] = "toggle-preview",
        ["<M-d>"] = "preview-page-down",
        ["<M-u>"] = "preview-page-up",
      }

      local keymap = vim.tbl_extend("force", {}, defaults, custom_keymaps)

      fzf_lua.setup({
        keymap = {
          builtin = keymap,
        },
      })

      -- Keybinds
      -- Builtin handy keybinds:
      --  <F1> : Help
      --  <F2> : Fullscreen
      --  <F4> : Toggle preview

      -- <M-i> : Toggle ignore
      -- <M-h> : Toggle hidden

      set("n", "<leader>ff", fzf_lua.files, { desc = "Fzf Files" })
      set("n", "<leader>fd", function()
        require("fzf-lua").files { cmd = "fd -t d" }
      end, { desc = "Fzf directories" })
      set("n", "<leader>hh", fzf_lua.helptags, { desc = "Fzf help" })
      set("n", "<leader>hm", fzf_lua.manpages, { desc = "Fzf manpages" })
      set("n", "<leader>hk", fzf_lua.keymaps, { desc = "Fzf keymaps" })
      set("n", "<leader>bb", fzf_lua.buffers, { desc = "Fzf buffers" })
      set("n", "<leader>,", fzf_lua.buffers, { desc = "Fzf buffers" })
      set("n", "<leader>fr", fzf_lua.oldfiles, { desc = "Fzf oldfiles" })
      set("n", "<leader>fcn", function()
        fzf_lua.files { cwd = vim.env.HOME .. "/.local/share/chezmoi/dot_config/nvim" }
      end, { desc = "Fzf config files" })
      set("n", "<leader>fcN", function()
        fzf_lua.files { cwd = vim.env.HOME .. "/Sync/org" }
      end, { desc = "Fzf org notes" })
      set("n", "<leader>sg", function()
        require("fzf-lua").live_grep_native {
          multiline = 1,
          winopts = {
            fullscreen = true,
          },
        }
      end, { desc = "Fzf live native grep" })
      set("n", "<leader>sG", function()
        require("fzf-lua").grep {
          multiline = 1,
          winopts = {
            fullscreen = true,
          },
        }
      end, { desc = "Fzf grep" })
      set("n", "<leader>sl", function()
        require("fzf-lua").grep_last {
          multiline = 1,
          winopts = {
            fullscreen = true,
          },
        }
      end, { desc = "[S]earch fzf grep [l]ast" })
      set("n", "<leader>gb", fzf_lua.git_branches, { desc = "Fzf git branches" })
      set("n", "<leader>uc", fzf_lua.colorschemes, { desc = "Fzf colorschemes" })
      set("n", "<leader>uh", fzf_lua.highlights, { desc = "Fzf highlights" })
      set("n", "<leader>gc", fzf_lua.git_commits, { desc = "Fzf git commits" })
      set("n", "<leader>gC", fzf_lua.git_bcommits, { desc = "Fzf git buffer commits" })
      set("n", "<leader>ss", function()
        require("fzf-lua").blines { previewer = false }
      end, { desc = "Fzf buffer lines" })
    end,
  },
}
