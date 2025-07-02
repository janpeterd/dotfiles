return {
  {
    "L3MON4D3/LuaSnip",
    lazy = true,
    -- follow latest release.
    version = "2.*", -- Replace <CurrentMajor> by the latest released major (first number of latest release)
    -- install jsregexp (optional!).
    build = function()
      if vim.fn.has "win32" == 1 then
        return "make install_jsregexp"
      else
        return nil
      end
    end,
    dependencies = { { "rafamadriz/friendly-snippets", lazy = true } },
    config = function()
      -- will exclude all javascript snippets
      require("luasnip.loaders.from_vscode").lazy_load()
      -- Actually get the snippets
      require("luasnip.loaders.from_lua").lazy_load { paths = { "~/.config/nvim/lua/jp/snippets" } }
      local ls = require "luasnip"
      local types = require "luasnip.util.types"
      ls.config.set_config {
        -- Remember jump positions (if true) even if you move outside
        history = false,
        -- Autocommands on which luasnip updates
        updateevents = "TextChanged,TextChangedI",
        enable_autosnippets = true,
      }

      -- <c-s> is my expansion key
      -- this will expand the current item or jump to the next item within the snippet.
      vim.keymap.set({ "i", "s" }, "<c-k>", function()
        if ls.expand_or_jumpable() then
          ls.expand_or_jump()
        end
      end, { silent = true })

      -- <c-l> is selecting within a list of options.
      -- This is useful for choice nodes
      vim.keymap.set("i", "<c-l>", function()
        if ls.choice_active() then
          ls.change_choice(1)
        end
      end)
    end,
  },
}
