return {
  {
    "mason-org/mason.nvim",
    opts = {
      ui = { border = "rounded" },
    },
  },
  {
    "folke/lazydev.nvim",
    ft = "lua",
    opts = {
      library = {
        "luvit-meta/library",
      },
      integrations = {
        lspconfig = true,
      },
    },
  },
  { "Bilal2453/luvit-meta", lazy = true },
  {
    "aznhe21/actions-preview.nvim",
    config = function()
      require("actions-preview").setup {
        backend = { "snacks" },
        snacks = {
          layout = { preset = "vertical" },
        },
      }
    end,
  },
  {
    "neovim/nvim-lspconfig",
    lazy = false,
    config = function()
      local mason_tool_installer = require "mason-tool-installer"

      local servers = {
        ty = {},
        qmlls = {},
        svelte = {},
        -- TypeScript 7 native LSP. It replaced typescript-tools.nvim, whose
        -- tsserver took seconds to answer documentSymbol in larger projects.
        tsc = {
          settings = {
            ["js/ts"] = {
              -- Keep the native server lean. Type-checking works without
              -- these extra UI features, and they cost requests on every edit.
              inlayHints = {
                parameterNames = { enabled = false },
                parameterTypes = { enabled = false },
                variableTypes = { enabled = false },
                propertyDeclarationTypes = { enabled = false },
                functionLikeReturnTypes = { enabled = false },
                enumMemberValues = { enabled = false },
              },
              referencesCodeLens = { enabled = false },
              implementationsCodeLens = { enabled = false },
            },
          },
        },
        emmet_language_server = {},
        cssls = {},
        marksman = {},
        lua_ls = {
          on_init = function(client)
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
          -- Do not use nvim-lspconfig's `.git` fallback for Tailwind roots:
          -- it can walk up into an unrelated repository and scan too much.
          root_dir = function(bufnr, on_dir)
            local fname = vim.api.nvim_buf_get_name(bufnr)
            local config_files = {
              "tailwind.config.js",
              "tailwind.config.cjs",
              "tailwind.config.mjs",
              "tailwind.config.ts",
              "postcss.config.js",
              "postcss.config.cjs",
              "postcss.config.mjs",
              "postcss.config.ts",
            }

            local config_file = vim.fs.find(config_files, { path = fname, upward = true })[1]
            if config_file then
              on_dir(vim.fs.dirname(config_file))
              return
            end

            local package_json = vim.fs.find("package.json", { path = fname, upward = true })[1]
            if not package_json then
              return
            end

            local ok, package = pcall(vim.json.decode, table.concat(vim.fn.readfile(package_json), "\n"))
            if not ok or type(package) ~= "table" then
              return
            end

            local deps = vim.tbl_extend("force", package.dependencies or {}, package.devDependencies or {})
            if deps.tailwindcss or deps["@tailwindcss/vite"] or deps["@tailwindcss/postcss"] then
              on_dir(vim.fs.dirname(package_json))
            end
          end,
        },
      }

      -- Neovim 0.11+ native LSP configuration. nvim-lspconfig still supplies
      -- the per-server defaults; these tables only override what we care about.
      for name, config in pairs(servers) do
        vim.lsp.config(name, config)
      end

      if vim.g.jp_profile == "dev" then
        local ensure_installed = vim.tbl_keys(servers)
        vim.list_extend(ensure_installed, {
          "prettier",
          "prettierd",
        })

        mason_tool_installer.setup { ensure_installed = ensure_installed }
      end

      -- mason-lspconfig auto-enables every installed server with vim.lsp.enable().
      require("mason-lspconfig").setup {}

      -- Use LspAttach autocommand to only map the following keys
      -- after the language server attaches to the current buffer
      vim.api.nvim_create_autocmd("LspAttach", {
        group = vim.api.nvim_create_augroup("UserLspConfig", {}),
        callback = function(ev)
          local client = assert(vim.lsp.get_client_by_id(ev.data.client_id), "must have valid client")

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
          -- Show function signature
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
          -- Native tsc supports source.organizeImports; addMissingImports was
          -- a typescript-tools-only feature and used to run on every save.
          vim.keymap.set("n", "<leader>co", function()
            vim.lsp.buf.code_action {
              context = { only = { "source.organizeImports" } },
              apply = true,
            }
          end, { buffer = opts.buffer, desc = "[C]ode [O]rganize imports" })
          -- code -> workspace -> add
          vim.keymap.set(
            "n",
            "<leader>cwa",
            vim.lsp.buf.add_workspace_folder,
            { buffer = opts.buffer, desc = "[C]ode [W]orkspace [A]dd" }
          )
          -- code -> workspace -> remove
          vim.keymap.set(
            "n",
            "<leader>cwr",
            vim.lsp.buf.remove_workspace_folder,
            { buffer = opts.buffer, desc = "[C]ode [W]orkspace [R]emove" }
          )
          -- code -> workspace -> list
          vim.keymap.set("n", "<leader>cwl", function()
            print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
          end, { buffer = opts.buffer, desc = "[C]ode [W]orkspace [L]ist" })

          -- NOTE: I want to use the default mappings: grn (rename) and gra (code action)

          -- Highlight references of the word under the cursor when it rests there.
          if client and client.server_capabilities.documentHighlightProvider then
            -- Only on normal-mode idle; highlighting while typing caused a
            -- request on every short pause with the old 50ms updatetime.
            vim.api.nvim_create_autocmd("CursorHold", {
              buffer = ev.buf,
              callback = vim.lsp.buf.document_highlight,
            })

            vim.api.nvim_create_autocmd("CursorMoved", {
              buffer = ev.buf,
              callback = vim.lsp.buf.clear_references,
            })
          end
        end,
      })
    end,
    dependencies = {
      "williamboman/mason-lspconfig.nvim",
      "WhoIsSethDaniel/mason-tool-installer.nvim",
      "mason-org/mason.nvim",
    },
  },

  -- Autoformatting
  {
    "stevearc/conform.nvim",
    event = { "BufWritePre" },
    cmd = { "ConformInfo" },
    opts = {
      formatters_by_ft = {
        sh = { "shfmt" },
        bash = { "shfmt" },
        markdown = { "prettierd", "prettier", stop_after_first = true },
        lua = { "stylua" },
        go = { "gofmt" },
        typescript = { "prettierd", "prettier", stop_after_first = true },
        javascript = { "prettierd", "prettier", stop_after_first = true },
        javascriptreact = { "prettierd", "prettier", stop_after_first = true },
        typescriptreact = { "prettierd", "prettier", stop_after_first = true },
        html = { "prettierd", "prettier", stop_after_first = true },
        css = { "prettierd", "prettier", stop_after_first = true },
        scss = { "prettierd", "prettier", stop_after_first = true },
        svelte = { "prettierd", "prettier", stop_after_first = true },
        c = { "clang-format" },
        cpp = { "clang-format" },
        c_sharp = { "clang-format" },
        -- Use a function here to determine the formatters dynamically
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
        if vim.g.disable_autoformat or vim.b[bufnr].disable_autoformat then
          return
        end
        return { timeout_ms = 100000, lsp_format = "fallback" }
      end,
    },
    keys = {
      {
        "<leader>cf",
        function()
          require("conform").format {
            async = true,
            lsp_format = "fallback",
          }
        end,
        desc = "[C]ode [F]ormat (conform)",
      },
    },
  },
}
