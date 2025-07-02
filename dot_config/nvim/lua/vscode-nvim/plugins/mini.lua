return {
  {
    "echasnovski/mini.nvim",
    lazy = true,
    event = "VeryLazy",
    config = function()
      -- require("mini.statusline").setup()
      -- require("mini.indentscope").setup {
      --   symbol = "|",
      --   }
      require("mini.bufremove").setup()
      require("mini.move").setup {
        mappings = {
          -- Move current line in *Normal* mode
          line_left = "<M-h>",
          line_right = "<M-l>",
          line_down = "",
          line_up = "",

          -- Move visual selection in *Visual* mode. Defaults are Alt (Meta) + hjkl.
          left = "<M-h>",
          right = "<M-l>",
          up = "K",
          down = "J",
        },
      }
      require("mini.ai").setup()
      -- require("mini.notify").setup {
      --   -- Content management
      --   content = {
      --     -- Function which formats the notification message
      --     -- By default prepends message with notification time
      --     format = nil,
      --
      --     -- Function which orders notification array from most to least important
      --     -- By default orders first by level and then by update timestamp
      --     sort = nil,
      --   },
      --
      --   -- Notifications about LSP progress
      --   lsp_progress = {
      --     -- Whether to enable showing
      --     enable = true,
      --
      --     -- Duration (in ms) of how long last message should be shown
      --     duration_last = 1000,
      --   },
      --
      --   -- Window options
      --   window = {
      --     -- Floating window config
      --     config = {
      --       border = "rounded",
      --     },
      --
      --     -- Maximum window width as share (between 0 and 1) of available columns
      --     max_width_share = 0.382,
      --
      --     -- Value of 'winblend' option
      --     winblend = 25,
      --   },
      -- }
      -- vim.cmd [[autocmd TabNewEntered * ++nested lua MiniStarter.open()]]
      -- local starter = require "mini.starter"
      -- local default_header = function()
      --   local hour = tonumber(vim.fn.strftime "%H")
      --   -- [04:00, 12:00) - morning, [12:00, 20:00) - day, [20:00, 04:00) - evening
      --   local part_id = math.floor((hour + 4) / 8) + 1
      --   local day_part = ({ "evening", "morning", "afternoon", "evening" })[part_id]
      --   local username = vim.loop.os_get_passwd()["username"] or "USERNAME"
      --
      --   return ("Good %s, %s"):format(day_part, username)
      -- end
      -- local get_pwd = function()
      --   return ("\nYou are in: %s"):format(vim.fn.getcwd(0))
      -- end
      -- starter.setup {
      --   evaluate_single = true,
      --   header = default_header()
      --     .. [[
      --         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢀⠀⠀⢀⣴⣯⣶⣴⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣿⣿⠆⠀⣿⣿⣿⣿⡟⣀⣤⣄⢀⣠⡶⢶⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⠶⠶⢶⣞⣿⣿⣿⣠⣤⣿⣿⣿⣿⣶⣯⣀⣸⢋⡁⠀⠀⠀⠉⢳⣀⣀⣼⡆⢰⢶⡄⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⠏⠀⠀⠀⠀⠘⣿⡿⠟⠉⠀⠈⠋⠛⠀⠀⠈⠙⠷⣞⠀⡴⠚⠀⠀⠀⠉⠉⣹⡳⠏⠈⣧⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⡼⠃⠀⠀⠀⠀⣠⠞⠁⡥⠄⠀⠀⠀⡴⢦⣀⡄⠀⠀⠀⠹⣼⣁⠀⠀⠀⠀⠀⠚⠉⠀⠀⢀⡇⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⣼⠃⠀⠀⠀⢀⡼⠃⢰⠼⠀⠀⠀⠀⢀⡀⠀⠓⠁⠀⠀⠀⣴⠛⠉⠁⠀⢰⢇⡴⠀⠀⠀⠀⣜⣿⡀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⣿⢰⡏⠀⢀⡾⣁⣤⣄⠀⣼⣷⠀⠀⣿⣿⠀⠀⠀⠀⠀⣸⠃⠀⠀⢀⢠⠾⣯⠀⠀⠀⠀⢸⠞⢸⡇⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⢹⣽⡇⠀⣸⣱⠋⠀⠙⣧⡿⠿⣄⡜⢭⡍⠙⣆⠀⠀⠀⣿⠀⠀⠀⢸⢁⣤⡸⡇⠀⠀⠀⠀⠀⣸⠃⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠉⢻⣀⡇⣇⠀⠀⠀⣏⠀⠀⢨⡇⠀⠀⢀⡟⠀⠀⠀⢸⡄⡀⢠⣼⢸⡄⢈⡇⠀⠀⠀⠀⣠⠏⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⡇⠹⣶⠴⠚⠙⠷⡶⠋⠻⢦⠴⢮⣄⠀⠀⠀⠀⣿⡇⢸⡟⠘⢁⡼⠀⠀⠀⣠⠴⠃⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⢰⠇⠀⠀⠀⢰⡇⠀⠀⠀⠀⠀⠹⡆⠀⠀⠐⣻⣂⡾⠷⣶⠋⢐⣒⠶⠋⠁⠀⠀⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣇⣻⡤⠀⠀⠀⢸⣗⠀⠀⠀⠀⠀⠰⠿⣄⠀⠐⠛⠋⠀⢀⡏⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡟⠉⠀⠀⠀⠀⠀⢿⡄⠀⢀⠀⠀⠀⠀⠈⢳⡄⠀⠀⣴⣽⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡏⠀⠀⠀⠀⠀⢰⡆⡼⠙⢦⡟⠀⠀⠀⠀⠀⢀⢧⣠⣾⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
      --           ⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣧⠤⠀⠀⠀⠀⢸⡟⠁⠀⢸⡇⠀⣠⠀⠀⠀⠘⣾⣿⣿⣿⣿⣿⣿⣿⣦⣀⣤⣤⣀⠀⠀⠀⠀⠀
      --           ⠀⠀⣀⣀⠀⢀⣴⣿⣿⠟⠁⠀⠀⠀⠀⡀⣸⣧⣄⣀⣀⣹⣦⣻⣰⠀⠀⢠⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀
      --           ⣠⣾⣿⣿⣷⣿⣿⣿⡏⠀⠀⠀⠀⡄⢸⣱⠏⣠⣿⠿⣿⣯⡁⢸⠃⠀⠀⣸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀
      --         ⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⡷⠁⠀⠀⢀⣧⣿⣇⠺⣿⠃⠀⠹⠛⠁⣸⠀⠀⠀⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀
      --         ⠀⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⢀⣾⣿⣿⣿⣦⠀⠀⠀⠀⣠⣾⣿⣧⡀⢠⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷
      --         ⠀⣿⣿⣿⣿⣿⣿⣿⡯⢞⣀⣤⣾⣿⣿⣿⣿⣿⣿⣷⣀⣴⣿⣿⣿⣿⣿⣿⣮⣷⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
      --         ⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇
      --         ⠀⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠈⠉⠁⠀⠀
      --   ]]
      --     .. get_pwd(),
      --   items = {
      --     starter.sections.builtin_actions(),
      --     starter.sections.recent_files(5, false),
      --     starter.sections.recent_files(5, true),
      --   },
      --   footer = vim.fn.system "fortune",
      --   content_hooks = {
      --     starter.gen_hook.adding_bullet(),
      --     starter.gen_hook.aligning("center", "center"),
      --   },
      -- }

      -- KEYMAPS
      vim.keymap.set(
        "n",
        "<leader>bj",
        require("mini.bufremove").delete,
        { desc = "Delete current buffer, but keep window" }
      )
    end,
  },
}
