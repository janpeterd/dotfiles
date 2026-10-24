return {
  {
    -- Fast, frecency-ranked file and content search. Keeps an index resident,
    -- so repeated searches are much cheaper than spawning fzf/rg per query.
    "dmtrKovalenko/fff",
    lazy = false, -- the plugin lazy-initialises its own index
    build = function()
      require("fff.download").download_or_build_binary()
    end,
    keys = {
      {
        "<leader>ff",
        function()
          require("fff").find_files()
        end,
        desc = "[F]ind [f]iles (fff)",
      },
      {
        "<leader>fg",
        function()
          require("fff").live_grep()
        end,
        desc = "[F]ind [g]rep (fff)",
      },
      {
        "<leader>fw",
        function()
          require("fff").live_grep_under_cursor()
        end,
        mode = { "n", "x" },
        desc = "[F]ind [w]ord / selection (fff)",
      },
      -- Keep the old Telescope-era muscle memory working.
      {
        "<leader>sg",
        function()
          require("fff").live_grep()
        end,
        desc = "[S]earch [g]rep (fff)",
      },
      {
        "<leader>sg",
        function()
          require("fff").live_grep_under_cursor()
        end,
        mode = "x",
        desc = "[S]earch [g]rep selection (fff)",
      },
    },
    opts = {
      -- Allow fff to index $HOME when Neovim is started there.
      enable_home_dir_scanning = true,
    },
  },
}
