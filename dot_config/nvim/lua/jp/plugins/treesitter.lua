return {
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    priority = 100,
    branch = "master", -- TODO: switch to main branch if ready
    dependencies = {
      -- NOTE: using mini.ai for the same purpose
      {
        "nvim-treesitter/nvim-treesitter-textobjects",
        dependencies = { "nvim-treesitter/nvim-treesitter" },
        lazy = true,
        event = { "BufReadPre", "BufNewFile" },
      },
      {
        "JoosepAlviste/nvim-ts-context-commentstring",
        lazy = true,
        dependencies = { "nvim-treesitter/nvim-treesitter" },
        event = "VeryLazy",
      },
      -- {
      --   "nvim-treesitter/playground",
      --   dependencies = { "nvim-treesitter/nvim-treesitter" },
      --   lazy = true,
      --   event = "VeryLazy",
      -- },
    },
    config = function()
      ---@diagnostic disable: missing-fields
      if vim.fn.has "win32" == 1 then
        -- On windows make sure to install gcc with mingw: `choco install mingw`
        require("nvim-treesitter.install").prefer_git = false -- use tar or curl instead of git
      end

      require("nvim-treesitter.configs").setup {
        ensure_installed = {
          "arduino",
          "c",
          "cpp",
          "css",
          "go",
          "html",
          "http",
          "java",
          "javascript",
          "jsdoc",
          "lua",
          "markdown",
          "markdown_inline",
          "php",
          "python",
          "query",
          "ruby",
          "rust",
          "scss",
          "sql",
          "toml",
          "tsx",
          "typescript",
          "vim",
          "vimdoc",
          "yaml",
        },

        -- Install parsers synchronously ()
        sync_install = false,

        -- Automatically install missing parsers when entering buffer
        -- Recommendation: set to false if you don't have `tree-sitter` CLI installed locally
        auto_install = true,

        -- List of parsers to ignore installing (for "all")
        -- ignore_install = {},

        ---- If you need to change the installation directory of the parsers (see -> Advanced Setup)
        -- parser_install_dir = "/some/path/to/store/parsers", -- Remember to run vim.opt.runtimepath:append("/some/path/to/store/parsers")!

        highlight = {
          enable = true,

          -- Setting this to true will run `:h syntax` and tree-sitter at the same time.
          -- Set this to `true` if you depend on 'syntax' being enabled (like for indentation).
          -- Using this option may slow down your editor, and you may see some duplicate highlights.
          -- Instead of true it can also be a list of languages
          additional_vim_regex_highlighting = { "org" },
        },

        indent = { enable = true },
        context = { enable = false },
        context_commentstring = { enabled = false },
        autotag = {
          enable = true,
        },
        textobjects = {
          select = {
            enable = true,
            lookahead = true,
            keymaps = {
              ["ak"] = "@block.outer",
              ["ik"] = "@block.inner",
              ["ac"] = "@class.outer",
              ["ic"] = "@class.inner",
              ["aC"] = "@comment.outer",
              ["iC"] = "@comment.inner",
              ["a?"] = "@conditional.outer",
              ["i?"] = "@conditional.inner",
              ["af"] = "@function.outer",
              ["if"] = "@function.inner",
              ["al"] = "@loop.outer",
              ["il"] = "@loop.inner",
              ["aa"] = "@parameter.outer",
              ["ia"] = "@parameter.inner",
            },
          },
          move = {
            enable = true,
            set_jumps = true,
            goto_next_start = {
              ["]k"] = { query = "@block.outer", desc = "Next block start" },
              ["]c"] = { query = "@class.outer", desc = "Next class start" },
              ["]C"] = { query = "@comment.outer", desc = "Next comment start" },
              ["]f"] = { query = "@function.outer", desc = "Next function start" },
              ["]a"] = { query = "@parameter.outer", desc = "Next parameter start" },
            },
            -- goto_next_end = {
            --     ["]k"] = { query = "@block.outer", desc = "Next block end" },
            --     ["]c"] = { query = "@class.outer", desc = "Next class end" },
            --     ["]C"] = { query = "@comment.outer", desc = "Next comment end" },
            --     ["]f"] = { query = "@function.outer", desc = "Next function end" },
            --     ["]a"] = { query = "@parameter.outer", desc = "Next parameter end" },
            -- },
            goto_previous_start = {
              ["[k"] = { query = "@block.outer", desc = "Previous block start" },
              ["[c"] = { query = "@class.outer", desc = "Previous class start" },
              ["[C"] = { query = "@comment.outer", desc = "Previous comment start" },
              ["[f"] = { query = "@function.outer", desc = "Previous function start" },
              ["[a"] = { query = "@parameter.outer", desc = "Previous parameter start" },
            },
            -- goto_previous_end = {
            --     ["[K"] = { query = "@block.outer", desc = "Previous block end" },
            --     ["[C"] = { query = "@class.outer", desc = "Previous class end" },
            --     ["[F"] = { query = "@function.outer", desc = "Previous function end" },
            --     ["[A"] = { query = "@parameter.outer", desc = "Previous parameter end" },
            -- },
          },
          swap = {
            enable = false,
            -- swap_next = {
            --     ["<leader>Sk"] = { query = "@block.outer", desc = "Swap next block" },
            --     ["<leader>Sf"] = { query = "@function.outer", desc = "Swap next function" },
            --     ["<leader>Sa"] = { query = "@parameter.inner", desc = "Swap next parameter" },
            -- },
            -- swap_previous = {
            --     ["<leader>SK"] = { query = "@block.outer", desc = "Swap previous block" },
            --     ["<leader>SF"] = { query = "@function.outer", desc = "Swap previous function" },
            --     ["<leader>SA"] = { query = "@parameter.inner", desc = "Swap previous parameter" },
            -- },
          },
        },
      }

      local parser_config = require("nvim-treesitter.parsers").get_parser_configs()

      parser_config.blade = {
        install_info = {
          url = "https://github.com/EmranMR/tree-sitter-blade",
          files = { "src/parser.c" },
          branch = "main",
        },
        filetype = "blade",
      }

      vim.filetype.add {
        pattern = {
          [".*%.blade%.php"] = "blade",
          [".*/hypr/.*%.conf"] = "hyprlang",
        },
      }

      vim.keymap.set("n", "<leader>uH", "<CMD>TSHighlightCapturesUnderCursor<CR>", { desc = "View TS highlight" })
    end,
  },

  -- { "nvim-treesitter/nvim-treesitter-context",     dependencies = { "nvim-treesitter/nvim-treesitter" } },
}
