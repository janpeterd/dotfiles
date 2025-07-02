return {
  {
    "nvim-telescope/telescope.nvim",
    lazy = true,
    enabled = true,
    cmd = "Telescope",
    keys = {
      { "<leader>fr",  desc = "[F]ind [r]ecent" },
      { "<leader>ff",  desc = "[F]ind [f]iles" },
      { "<Leader>fF",  desc = "[F]ind [F]iles (inc hidden, ignore)" },
      { "<Leader>fd",  desc = "[F]ind [d]irectories" },
      { "<leader>fg",  desc = "[F]ind [g]rep" },
      { "<leader>fcn", desc = "[F]ind [c]onfig [n]vim" },
      { "<leader>hh",  desc = "[H]elp [h]elp pages (nvim)" },
      { "<leader>hH",  desc = "[H]elp [H]istory" },
      { "<leader>hc",  desc = "[H]elp [c]ommands (nvim)" },
      { "<leader>hk",  desc = "[H]elp [k]eybinds" },
      { "<leader>hm",  desc = "[H]elp [m]an pages" },
      { "<leader>ho",  desc = "[H]elp [o]ptions" },
      { "<leader>hs",  desc = "[H]elp [s]earch history" },
      { "<leader>bb",  desc = "[B]uffers" },
      { "<leader>,",   desc = "[B]uffers" },
      { "<leader>uc",  desc = "[U]I [c]olorscheme" },
      { "<leader>uh",  desc = "[U]I [h]ighlight (under cursor)" },
      { "<leader>sg",  desc = "[S]earch [g]rep (rg with args)" },
      {
        "<leader>sg",
        mode = "v",
        desc = "[S]earch [g]rep (rg with args)",
      },
      { "<leader>sp", desc = "[S]earch [p]roject files (git)" },
      { "<leader>ss", desc = "[S]earch buffer lines" },
      {
        "<leader>ss",
        mode = "v",
        desc = "[S]earch buffer lines",
      },
      { "<leader>sj", desc = "[S]earch [j]umplist" },
      { "<leader>sf", desc = "[S]earch [f]ile (entire system (locate)" },
      { "<leader>gc", desc = "[G]it [c]ommits" },
      { "<leader>gC", desc = "[G]it [C]ommits (buffer)" },
      { "<leader>gb", desc = "[G]it [b]ranches" },
    },
    dependencies = {
      "nvim-lua/plenary.nvim",
      "BurntSushi/ripgrep",
      -- Extensions
      { "nvim-telescope/telescope-fzf-native.nvim",    build = "make" },

      -- Replace UI.select()
      -- { "nvim-telescope/telescope-ui-select.nvim" },

      -- Live grep with ability to pass arguments to rg
      { "nvim-telescope/telescope-live-grep-args.nvim" },
      -- {
      --   "danielfalk/smart-open.nvim",
      --   branch = "0.2.x",
      --   cond = vim.fn.has "win32" ~= 1, -- doesnt work on windows currently
      --   dependencies = {
      --     {
      --       "kkharji/sqlite.lua",
      --       config = function()
      --         if vim.fn.has "win32" == 1 then
      --           vim.g.sqlite_clib_path = vim.env.USERPROFILE .. "/AppData/Local/nvim-data/sqlite/sqlite3.dll"
      --         end
      --       end,
      --     },
      --   },
      -- },
    },
    config = function()
      local telescope = require "telescope"
      local actions = require "telescope.actions"
      local actions_layout = require "telescope.actions.layout"
      local action_state = require "telescope.actions.state"
      local lga_actions = require "telescope-live-grep-args.actions"
      local transform_mod = require("telescope.actions.mt").transform_mod

      local builtin = require "telescope.builtin"
      local set = vim.keymap.set

      -- ------------------ CUSTOM ACTIONS --------------------------------------------

      local myactions = {}
      --- Scroll the results window up
      ---@param prompt_bufnr number: The prompt bufnr
      function myactions.results_scrolling_up(prompt_bufnr)
        myactions.scroll_results(prompt_bufnr, -1)
      end

      --- Scroll the results window down
      ---@param prompt_bufnr number: The prompt bufnr
      function myactions.results_scrolling_down(prompt_bufnr)
        myactions.scroll_results(prompt_bufnr, 1)
      end

      ---@param prompt_bufnr number: The prompt bufnr
      ---@param direction number: 1|-1
      function myactions.scroll_results(prompt_bufnr, direction)
        local status = action_state.get_status(prompt_bufnr)
        local default_speed = vim.api.nvim_win_get_height(status.results_win) / 2
        local speed = status.picker.layout_config.scroll_speed or default_speed

        actions.set.shift_selection(prompt_bufnr, math.floor(speed) * direction)
      end

      ---@param prompt_bufnr number: The prompt bufnr
      function myactions.yank_lines(prompt_bufnr)
        local final_string
        local picker = action_state.get_current_picker(prompt_bufnr)
        if next(picker:get_multi_selection()) ~= nil then
          local selected_lines = {}
          for index, entry in ipairs(picker:get_multi_selection()) do
            print(vim.inspect(entry))
            selected_lines[index] = entry["ordinal"]
          end
          final_string = table.concat(selected_lines, "\n")
        else
          local line = action_state.get_selected_entry()
          final_string = line["ordinal"]
        end
        vim.notify("yanked: " .. final_string)
        vim.fn.setreg("+", final_string)
        vim.fn.setreg("*", final_string)
        vim.fn.setreg('"', final_string)
      end

      -- ADD master/stack tiling action for telescope buffers
      -- myactions.master_stack = function(prompt_bufnr)
      --   local picker = action_state.get_current_picker(prompt_bufnr)
      --   actions.close(prompt_bufnr)
      --   vim.cmd [[tabnew]]
      --   for index, entry in ipairs(picker:get_multi_selection()) do
      --     if index == 1 then
      --       vim.cmd("edit " .. entry.path)
      --     elseif index == 2 then
      --       vim.cmd("vsplit " .. entry.path)
      --     else
      --       vim.cmd("split " .. entry.path)
      --     end
      --   end
      --   vim.cmd [[wincmd =]]
      -- end

      -- make them proper telescope actions
      transform_mod(myactions)
      -- ------------------ END ACTIONS --------------------------------------------
      local config = {
        defaults = {
          -- layout_strategy = "bottom_pane",
          -- prompt_prefix      = "󰭎",
          -- path_display = { "truncate" },
          layout_strategy = "bottom_pane",
          layout_config = {
            width = 0.95,
            height = 0.85,
            prompt_position = "top",
            -- horizontal = {
            --   preview_width = function(_, cols, _)
            --     if cols > 200 then
            --       return math.floor(cols * 0.4)
            --     else
            --       return math.floor(cols * 0.6)
            --     end
            --   end,
            -- },
            --
            vertical = {
              width = 0.9,
              height = 0.95,
              preview_height = 0.5,
            },

            flex = {
              horizontal = {
                preview_width = 0.9,
              },
            },
          },

          -- selection_strategy = "reset", -- (default)
          selection_strategy = "closest",
          -- sorting_strategy   = "descending",
          sorting_strategy = "ascending",
          scroll_strategy = "cycle",
          color_devicons = true,

          mappings = {
            i = {
              ["<M-j>"] = actions.cycle_history_next,
              ["<M-k>"] = actions.cycle_history_prev,
              ["<M-p>"] = actions_layout.toggle_preview,
              ["<M-u>"] = myactions.results_scrolling_up,
              ["<M-d>"] = myactions.results_scrolling_down,
              ["<C-enter>"] = "to_fuzzy_refine",
              ["<M-BS>"] = function()
                vim.cmd [[normal! bcw]]
              end,
              ["<C-u>"] = false, -- clear prompt with C-u
              ["<C-y>"] = myactions.yank_lines,
              -- ["<C-m>"] = myactions.master_stack,
            },
            n = { ["q"] = actions.close },
          },
        },
        pickers = {
          find_files = {
            -- previewer = false,
          },
          buffers = {
            sort_lastused = true,
            sort_mru = true,
            mappings = {
              i = {
                ["<C-x>"] = "delete_buffer",
              },
              n = {
                ["dd"] = "delete_buffer",
              },
            },
          },
          current_buffer_fuzzy_find = {
            previewer = false,
          },
          git_commits = {
            sorting_strategy = "descending",
          },
        },
        extensions = {
          live_grep_args = {
            mappings = {
              i = {
                ["<C-k>"] = lga_actions.quote_prompt(),
                ["<C-i>"] = lga_actions.quote_prompt { postfix = " --iglob " },
              },
            },
          },
          fzf = {
            fuzzy = true,
            override_generic_sorter = true,
            override_file_sorter = true,
            case_mode = "smart_case",
          },
        },
      }

      -- if vim.fn.has "win32" ~= 1 then
      --   config.extensions.smart_open = {
      --     match_algorithm = "fzf",
      --   }
      -- end

      telescope.setup(config)

      -- Extensions
      telescope.load_extension "fzf"
      -- if vim.fn.has "win32" ~= 1 then
      --   telescope.load_extension "smart_open"
      -- end
      telescope.load_extension "live_grep_args"
      telescope.load_extension "harpoon"

      -------------------------------------------------------------------------------------------------------

      ---------------------------
      ---------------------------
      -- KEYMAPPINGS ------------
      ---------------------------
      ---------------------------

      set("n", "<leader>fr", builtin.oldfiles, { desc = "[F]ind Telescope recent files" })

      ------------
      -- File
      ------------

      -- if vim.fn.has "win32" == 1 then
      set("n", "<leader>ff", "<cmd>Telescope find_files<cr>", { desc = "[F]ind [f]iles" })
      -- else
      --   set("n", "<leader><CR>", "<cmd>Telescope smart_open<cr>", { desc = "Telescope smart open" })
      --   set("n", "<leader>ff", "<cmd>Telescope smart_open<cr>", { desc = "Telescope smart open" })
      -- end
      set(
        "n",
        "<Leader>fF",
        ':lua require"telescope.builtin".find_files({ hidden = true, no_ignore = true })<CR>',
        { noremap = true, silent = true, desc = "[F]ind [F]iles (inc. hidden, gitignore)" }
      )

      set("n", "<Leader>fd", ":Telescope fd find_command=fd,-t=d<CR>", { desc = "[F]ind [d]irectories" })
      set("n", "<leader>fg", builtin.live_grep, { desc = "[F]ind [g]rep" })
      set("n", "<leader>fcn", function()
        if vim.fn.has "win32" == 1 then
          builtin.find_files { cwd = vim.env.USERPROFILE .. "/AppData/Local/nvim" }
        else
          builtin.find_files { cwd = vim.env.HOME .. "/.config/nvim" }
        end
      end, { desc = "[F]ind [c]onfig [n]vim" })

      ------------
      -- Help
      ------------

      set("n", "<leader>hh", builtin.help_tags, { desc = "[H]elp [h]elp pages" })
      set("n", "<leader>hH", builtin.command_history, { desc = "[H]elp [H]istory" })
      set("n", "<leader>hc", builtin.commands, { desc = "[H]elp [c]ommands" })
      set("n", "<leader>hk", builtin.keymaps, { desc = "[H]elp [k]ey mappings" })
      set("n", "<leader>hm", "<cmd>Telescope man_pages sections=ALL<cr>", { desc = "[H]elp [m]an pages (system)" })
      set("n", "<leader>ho", builtin.vim_options, { desc = "[H]elp [o]ptions (nvim)" })
      set("n", "<leader>hs", builtin.search_history, { desc = "[H]elp [s]earch history" })

      ------------
      -- Buffer
      ------------

      set("n", "<leader>bb", "<cmd>Telescope buffers sort_lastused=true<CR>", { desc = "[B]uffers" })
      set("n", "<leader>,", builtin.buffers, { desc = "[B]uffer [,] list" })

      ------------
      -- UI
      ------------

      set("n", "<leader>uc", builtin.colorscheme, {})
      set("n", "<leader>uh", builtin.highlights, { desc = "[U]i [H]ighlights" })

      ------------
      -- Search
      ------------

      set(
        "n",
        "<leader>sg",
        ":lua require('telescope').extensions.live_grep_args.live_grep_args()<CR>",
        { desc = "[S]earch with Rip[g]rep (with args)" }
      )
      set(
        "v",
        "<leader>sg",
        "y<ESC>:Telescope live_grep default_text=<c-r>0<CR>",
        { desc = "[S]earch Ripgrep for selection" }
      )
      set("n", "<leader>sp", "<cmd>Telescope git_files<cr>", { desc = "[S]earch [p]roject files (git)" }) -- Fuzzy search contents of project files (git)
      set("n", "<leader>ss", builtin.current_buffer_fuzzy_find, { desc = "[S]earch buffer lines" })
      set(
        "v",
        "<leader>ss",
        "y<ESC>:Telescope current_buffer_fuzzy_find default_text=<c-r>0<CR>",
        { desc = "[S]earch buffer lines (selection)" }
      )
      set("n", "<leader>sj", builtin.jumplist, { desc = "[S]earch [J]umplist" })
      set("n", "<leader>sf", "<cmd>TelescopeLocate<cr>", { desc = "[S]earch [f]ile (entire filesystem locate)" })

      ------------
      -- Git
      ------------
      set(
        "n",
        "<leader>gc",
        "<cmd>Telescope git_commits temp__scrolling_limit=100000<cr>",
        { desc = "[G]it [c]ommits and checkout" }
      )
      set(
        "n",
        "<leader>gC",
        "<cmd>Telescope git_bcommits temp__scrolling_limit=100000<cr>",
        { desc = "[G]it [C]ommits (buffer)" }
      )
      set("n", "<leader>gb", "<cmd>Telescope git_branches<cr>", { desc = "[G]it [b]ranches" })
    end,
  },
}
