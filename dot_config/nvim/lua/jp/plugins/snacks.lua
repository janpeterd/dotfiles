return {
  {
    "folke/snacks.nvim",
    lazy = false,
    priority = 100,
    opts = {
      picker = {
        enabled = true,
        layout = { preset = "telescope" },
        matcher = { frecency = true, cwd_bonus = true },
      },
      image = { enabled = true },
      bigfile = { enabled = true },
      indent = { enabled = true },
      statuscolumn = { enabled = true },
    },
    keys = {
      -- Find
      {
        "<leader>fr",
        function()
          Snacks.picker.recent()
        end,
        desc = "[F]ind [r]ecent",
      },
      {
        "<leader>fF",
        function()
          Snacks.picker.files { hidden = true, ignored = true }
        end,
        desc = "[F]ind [F]iles (hidden, no ignore)",
      },
      {
        "<leader>fcn",
        function()
          Snacks.picker.files { cwd = vim.fn.stdpath "config" }
        end,
        desc = "[F]ind [c]onfig [n]vim",
      },
      {
        "<leader>fz",
        function()
          Snacks.picker.zoxide()
        end,
        desc = "[F]ind with [z]oxide",
      },
      {
        "<leader>fp",
        function()
          Snacks.picker.projects()
        end,
        desc = "[F]ind [p]rojects",
      },

      {
        "<leader>oi",
        function()
          Snacks.image.hover()
        end,
        desc = "[O]pen [i]mage under cursor",
      },

      -- Help
      {
        "<leader>hh",
        function()
          Snacks.picker.help()
        end,
        desc = "[H]elp [h]elp pages",
      },
      {
        "<leader>hH",
        function()
          Snacks.picker.command_history()
        end,
        desc = "[H]elp command [H]istory",
      },
      {
        "<leader>hc",
        function()
          Snacks.picker.commands()
        end,
        desc = "[H]elp [c]ommands",
      },
      {
        "<leader>hk",
        function()
          Snacks.picker.keymaps()
        end,
        desc = "[H]elp [k]eymaps",
      },
      {
        "<leader>hm",
        function()
          Snacks.picker.man()
        end,
        desc = "[H]elp [m]an pages",
      },
      {
        "<leader>hs",
        function()
          Snacks.picker.search_history()
        end,
        desc = "[H]elp [s]earch history",
      },

      -- Buffer / UI
      {
        "<leader>bb",
        function()
          Snacks.picker.buffers()
        end,
        desc = "[B]uffers",
      },
      {
        "<leader>,",
        function()
          Snacks.picker.buffers()
        end,
        desc = "[B]uffers",
      },
      {
        "<leader>uc",
        function()
          Snacks.picker.colorschemes()
        end,
        desc = "[U]I [c]olorschemes",
      },
      {
        "<leader>uh",
        function()
          Snacks.picker.highlights()
        end,
        desc = "[U]I [h]ighlights",
      },

      -- Search
      {
        "<leader>ss",
        function()
          Snacks.picker.lines()
        end,
        desc = "[S]earch buffer lines",
      },
      {
        "<leader>sj",
        function()
          Snacks.picker.jumps()
        end,
        desc = "[S]earch [j]umplist",
      },
      {
        "<leader>sd",
        function()
          Snacks.picker.diagnostics()
        end,
        desc = "[S]earch [d]iagnostics",
      },
      {
        "<leader>sD",
        function()
          Snacks.picker.diagnostics_buffer()
        end,
        desc = "[S]earch buffer [D]iagnostics",
      },
      {
        "<leader>sq",
        function()
          Snacks.picker.qflist()
        end,
        desc = "[S]earch [q]uickfix",
      },
      {
        "<leader>sR",
        function()
          Snacks.picker.resume()
        end,
        desc = "[S]earch [R]esume",
      },
      {
        "<leader>su",
        function()
          Snacks.picker.undo()
        end,
        desc = "[S]earch [u]ndo history",
      },
      {
        "<leader>sm",
        function()
          Snacks.picker.marks()
        end,
        desc = "[S]earch [m]arks",
      },

      -- Git
      {
        "<leader>gc",
        function()
          Snacks.picker.git_log()
        end,
        desc = "[G]it [c]ommits",
      },
      {
        "<leader>gC",
        function()
          Snacks.picker.git_log_file()
        end,
        desc = "[G]it [C]ommits (buffer)",
      },
      {
        "<leader>gL",
        function()
          Snacks.picker.git_log_line()
        end,
        desc = "[G]it [L]og line",
      },
      {
        "<leader>gb",
        function()
          Snacks.picker.git_branches()
        end,
        desc = "[G]it [b]ranches",
      },
      {
        "<leader>gs",
        function()
          Snacks.picker.git_status()
        end,
        desc = "[G]it [s]tatus",
      },
      {
        "<leader>gf",
        function()
          Snacks.picker.git_files()
        end,
        desc = "[G]it [f]iles",
      },
    },
  },
}
