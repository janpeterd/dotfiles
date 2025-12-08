return {
  { "mason-org/mason.nvim" },
  {
    "folke/lazydev.nvim",
    ft = "lua",
    opts = {
      library = {
        "luvit-meta/library",
        integrations = {
          cmp = true,
          lspconfig = true,
        },
      },
    },
  },
  { "Bilal2453/luvit-meta", lazy = true },
  {
    "aznhe21/actions-preview.nvim",
    config = function()
      require("actions-preview").setup {
        telescope = {
          sorting_strategy = "ascending",
          layout_strategy = "vertical",
          layout_config = {
            width = 0.8,
            height = 0.9,
            prompt_position = "top",
            preview_cutoff = 20,
            preview_height = function(_, _, max_lines)
              return max_lines - 15
            end,
          },
        },
      }
    end,
  },
  {
    "neovim/nvim-lspconfig",
    lazy = false,
    config = function()
      local lspconfig = require "lspconfig"
      local mason_tool_installer = require "mason-tool-installer"
      local mason_lspconfig = require "mason-lspconfig"

      local servers = {
        -- csharp_ls = {},
        -- taplo = {},
        -- gopls = {},
        -- phpactor = {},
        -- rust_analyzer = {},
        -- ts_ls = {},
        basedpyright = {},
        qmlls = {},
        svelte = {},
        emmet_language_server = {},
        cssls = {},
        copilot = {},
        lua_ls = {
          on_init = function(client, initialization_result)
            if client.server_capabilities then
              client.server_capabilities.semanticTokensProvider = nil
            end
          end,
        },
        tailwindcss = {
          filetypes = {
            "aspnetcorerazor",
            "astro",
            "astro-markdown",
            "blade",
            "django-html",
            "htmldjango",
            "edge",
            "eelixir",
            "ejs",
            "erb",
            "eruby",
            "gohtml",
            "haml",
            "handlebars",
            "hbs",
            "html",
            "html-eex",
            "heex",
            "jade",
            "leaf",
            "liquid",
            "mdx",
            "mustache",
            "njk",
            "nunjucks",
            "razor",
            "slim",
            "twig",
            "css",
            "less",
            "postcss",
            "sass",
            "scss",
            "stylus",
            "sugarss",
            "javascript",
            "javascriptreact",
            "reason",
            "rescript",
            "typescript",
            "typescriptreact",
            "vue",
            "svelte",
            "php",
          },
        },

        -- pylsp = {
        --   plugins = {
        --     ruff = {
        --       enabled = {},
        --       extendSelect = { "I" },
        --     },
        --   },
        -- },

        -- jedi_language_server = {},

        -- marksman = {},

        -- clangd = {
        --   -- TODO: Could include cmd, but not sure those were all relevant flags.
        --   --    looks like something i would have added while i was floundering
        --   init_options = { clangdFileStatus = true },
        --   filetypes = { "c", "cpp" },
        -- },

        -- jsonls = {
        --   settings = {
        --     json = {
        --       schemas = require("schemastore").json.schemas(),
        --       validate = { enable = true },
        --     },
        --   },
        -- },

        -- yamlls = {
        --   settings = {
        --     yaml = {
        --       schemaStore = {
        --         enable = false,
        --         url = "",
        --       },
        --       schemas = require("schemastore").yaml.schemas(),
        --     },
        --   },
        -- },
      }

      -- local servers_to_install = vim.tbl_filter(function(key)
      --   local t = servers[key]
      --   if type(t) == "table" then
      --     return not t.manual_install
      --   else
      --     return t
      --   end
      -- end, vim.tbl_keys(servers))

      -- ========== MASON SETUP===========

      require("mason").setup {
        ui = {
          border = "rounded",
        },
      }
      -- =================================
      if vim.g.jp_profile == "dev" then
        local ensure_installed = vim.tbl_keys(servers or {})
        vim.list_extend(ensure_installed, {
          -- "clang-format",
          -- "debugpy", -- DAP for python
          -- "gofumpt",
          -- "goimports",
          -- "luacheck",
          -- "pint",
          "prettier",
          "prettierd",
          -- "ruff",
          -- "shellcheck",
          -- "stylua", -- Used to format Lua code
          -- "codelldb",
        })

        if vim.fn.has "win32" == 1 then
          servers = vim.tbl_filter(function(key)
            return key ~= "phpactor" and key ~= "lua_ls"
          end, servers)

          ensure_installed = vim.tbl_filter(function(tool)
            return tool ~= "luacheck"
          end, ensure_installed)
        end

        mason_tool_installer.setup { ensure_installed = ensure_installed }
      end

      -- for name, config in pairs(servers) do
      --   if config == true then
      --     config = {}
      --   end
      --
      --   config = vim.tbl_deep_extend("force", {}, {
      --     capabilities = capabilities,
      --   }, config)
      --
      --   -- rustacenvim handles this
      --   if name ~= "rust_analyzer" then
      --     lspconfig[name].setup(config)
      --   end
      -- end

      ---@diagnostic disable-next-line: missing-fields
      mason_lspconfig.setup {
        handlers = {
          function(server_name)
            local server = servers[server_name] or {}
            if server_name ~= "rust_analyzer" and server_name ~= "ts_ls" then
              lspconfig[server_name].setup(server)
            end
          end,
        },
      }

      -- Use LspAttach autocommand to only map the following keys
      -- after the language server attaches to the current buffer
      vim.api.nvim_create_autocmd("LspAttach", {
        group = vim.api.nvim_create_augroup("UserLspConfig", {}),
        callback = function(ev)
          local client = assert(vim.lsp.get_client_by_id(ev.data.client_id), "must have valid client")

          -- Enable completion triggered by <c-x><c-o>
          vim.bo[ev.buf].omnifunc = "v:lua.vim.lsp.omnifunc"
          vim.lsp.completion.enable(true, ev.data.client_id, ev.buf, {
            autotrigger = true,
          })

          -- Buffer local mappings.
          -- See `:help vim.lsp.*` for documentation on any of the below functions
          local opts = { buffer = ev.buf, desc = "LSP" }
          -- goto -> definition
          vim.keymap.set(
            "n",
            "gd",
            vim.lsp.buf.definition,
            { buffer = opts.buffer, desc = "[G]o to [D]efinition (symbol under cursor)" }
          )
          -- goto -> declaration
          vim.keymap.set(
            "n",
            "gD",
            vim.lsp.buf.declaration,
            { buffer = opts.buffer, desc = "[G]o to [D]eclaration (symbol under cursor)" }
          )
          -- Show fucntion signature!
          vim.keymap.set(
            "n",
            "<leader>cs",
            vim.lsp.buf.signature_help,
            { buffer = opts.buffer, desc = "[C]ode [S]ignature (current function)" }
          )
          vim.keymap.set(
            "i",
            "<C-s>",
            vim.lsp.buf.signature_help,
            { buffer = opts.buffer, desc = "Show Function Signature" }
          )
          -- remember with code -> workspace -> add
          vim.keymap.set(
            "n",
            "<leader>cwa",
            vim.lsp.buf.add_workspace_folder,
            { buffer = opts.buffer, desc = "[C]ode [W]orkspace [A]dd" }
          )
          -- remember with code -> workspace -> remove
          vim.keymap.set(
            "n",
            "<leader>cwr",
            vim.lsp.buf.remove_workspace_folder,
            { buffer = opts.buffer, desc = "[C]ode [W]orkspace [R]emove" }
          )
          -- remember with code -> workspace -> list
          vim.keymap.set("n", "<leader>cwl", function()
            print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
          end, { buffer = opts.buffer, desc = "[C]ode [W]orkspace [L]ist" })

          -- NOTE: I want to use the default mapping: grn
          -- vim.keymap.set("n", "<leader>cr", vim.lsp.buf.rename, { buffer = opts.buffer, desc = "[C]ode [R]ename" })
          -- remember with code -> actions
          -- NOTE: I want to use the default mapping: gra
          -- remember with goto -> references (under cursors)

          -- The following two autocommands are used to highlight references of the
          -- word under your cursor when your cursor rests there for a little while.
          --    See `:help CursorHold` for information about when this is executed
          --
          -- When you move your cursor, the highlights will be cleared (the second autocommand).
          if client and client.server_capabilities.documentHighlightProvider then
            vim.api.nvim_create_autocmd({ "CursorHold", "CursorHoldI" }, {
              buffer = ev.buf,
              callback = vim.lsp.buf.document_highlight,
            })

            vim.api.nvim_create_autocmd({ "CursorMoved", "CursorMovedI" }, {
              buffer = ev.buf,
              callback = vim.lsp.buf.clear_references,
            })
          end
        end,
      })

      -- require("fidget").setup {
      --   window = {
      --     blend = 0,
      --   },
      --   text = {
      --     spinner = "moon",
      --   },
      -- }

      require("conform").setup {
        formatters_by_ft = {
          sh = {
            "shfmt",
          },
          kotlin = {
            "ktfmt",
          },
          bash = {
            "shfmt",
          },
          markdown = {
            "prettierd",
            "prettier",
            stop_after_first = true,
          },
          lua = {
            "stylua",
          },
          -- Conform will run multiple formatters sequentially
          go = {
            "goimports",
            "gofmt",
          },
          -- Use a sub-list to run only the first available formatter
          typescript = {
            "prettierd",
            "prettier",
            stop_after_first = true,
          },
          javascript = {
            "prettierd",
            "prettier",
            stop_after_first = true,
          },
          javascriptreact = {
            "prettierd",
            "prettier",
            stop_after_first = true,
          },
          typescriptreact = {
            "prettierd",
            "prettier",
            stop_after_first = true,
          },
          html = { "prettierd", "prettier", stop_after_first = true },
          css = { "prettierd", "prettier", stop_after_first = true },
          scss = { "prettierd", "prettier", stop_after_first = true },
          svelte = {
            "prettierd",
            "prettier",
            stop_after_first = true,
          },
          blade = { "pint" },
          php = { "pint" },
          c = { "clang-format" },
          cpp = { "clang-format" },
          c_sharp = { "clang-format" },
          -- You can use a function here to determine the formatters dynamically
          python = function(bufnr)
            if require("conform").get_formatter_info("ruff_format", bufnr).available then
              return {
                "ruff_organize_imports",
                "ruff_format",
                "ruff_fix",
              }
            else
              return { "isort", "black" }
            end
          end,
        },
        -- Disable with a global or buffer-local variable
        format_on_save = function(bufnr)
          -- Disable with a global or buffer-local variable
          if vim.g.disable_autoformat or vim.b[bufnr].disable_autoformat then
            return
          end
          return { timeout_ms = 100000, lsp_format = "fallback" }
        end,
      }

      vim.keymap.set("n", "<leader>cf", function()
        require("conform").format {
          async = true,
          lsp_format = "fallback",
        }
      end, { desc = "[C]ode [F]ormat (conform)" })
    end,
    dependencies = {
      "williamboman/mason-lspconfig.nvim",
      "WhoIsSethDaniel/mason-tool-installer.nvim",
      "mason-org/mason.nvim",
    },
  },
  { "b0o/schemastore.nvim" },

  { "onsails/lspkind.nvim" },

  -- Autoformatting
  { "stevearc/conform.nvim" },
}
