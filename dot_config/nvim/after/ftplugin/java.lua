local jdtls = require "jdtls"
local project_name = vim.fn.fnamemodify(vim.fn.getcwd(), ":p:h:t")
local workspace_dir = vim.env.HOME .. "/.jdtls-workspace/" .. project_name
-- Needed for debugging
local bundles = {
  vim.fn.stdpath "data" .. "/mason/share/java-debug-adapter/com.microsoft.java.debug.plugin.jar",
}

-- Needed for running/debugging unit tests
vim.list_extend(bundles, vim.split(vim.fn.glob(vim.fn.stdpath "data" .. "/mason/share/java-test/*.jar", 1), "\n"))

-- Add spring-boot jdtls extension jars
vim.list_extend(bundles, require("spring_boot").java_extensions())

local config = {
  cmd = {
    "java",
    "-Declipse.application=org.eclipse.jdt.ls.core.id1",
    "-Dosgi.bundles.defaultStartLevel=4",
    "-Declipse.product=org.eclipse.jdt.ls.core.product",
    "-Dlog.protocol=true",
    "-Dlog.level=ALL",
    "-javaagent:" .. vim.fn.stdpath "data" .. "/mason/share/jdtls/lombok.jar",
    "-Xmx4g",
    "--add-modules=ALL-SYSTEM",
    "--add-opens",
    "java.base/java.util=ALL-UNNAMED",
    "--add-opens",
    "java.base/java.lang=ALL-UNNAMED",

    -- Eclipse jdtls location
    "-jar",
    vim.fn.stdpath "data" .. "/mason/share/jdtls/plugins/org.eclipse.equinox.launcher.jar",
    "-configuration",
    vim.fn.stdpath "data" .. "/mason/packages/jdtls/config_linux",
    "-data",
    workspace_dir,
  },
  handlers = {
    ["$/progress"] = function(_, result, ctx) end,
    ["language/status"] = function() end,
  },
  settings = {
    contentProvider = {
      preferred = "fernflower",
    },
    java = {
      sources = {
        organizeImports = {
          starThreshold = 5,
          staticStarThreshold = 5,
        },
      },
      saveActions = {
        organizeImports = true,
        removeUnused = true,
      },
      configuration = {
        runtimes = {
          {
            name = "JavaSE-17",
            path = "/usr/lib/jvm/java-17-openjdk",
          },
          {
            name = "JavaSE-21",
            path = "/usr/lib/jvm/java-21-openjdk",
            default = true,
          },
        },
      },
      import = {
        maven = {
          enabled = true,
        },
      },
      maven = {
        downloadSources = true,
      },
      implementationsCodeLens = {
        enabled = true,
      },
      referencesCodeLens = {
        enabled = true,
      },
      references = {
        includeDecompiledSources = true,
      },
      inlayHints = {
        enabled = "all",
      },
      format = {
        enabled = true,
      },
    },
    signatureHelp = { enabled = true },
    completion = {
      favoriteStaticMembers = {
        "org.hamcrest.MatcherAssert.assertThat",
        "org.hamcrest.Matchers.*",
        "org.hamcrest.CoreMatchers.*",
        "org.junit.jupiter.api.Assertions.*",
        "java.util.Objects.requireNonNull",
        "java.util.Objects.requireNonNullElse",
        "org.mockito.Mockito.*",
      },
      importOrder = {
        "java",
        "javax",
        "com",
        "org",
      },
    },
    extendedClientCapabilities = jdtls.extendedClientCapabilities,
    codeGeneration = {
      toString = {
        template = "${object.className}{${member.name()}=${member.value}, ${otherMembers}}",
      },
      useBlocks = true,
    },
  },
  root_dir = vim.fs.dirname(vim.fs.find({ "gradlew", ".git", "mvnw" }, { upward = true })[1]),

  capabilities = require("blink.cmp").get_lsp_capabilities(),
  flags = {
    allow_incremental_sync = true,
  },
  init_options = {
    bundles = bundles,
  },
}

config["on_attach"] = function(client, bufnr)
  jdtls.setup_dap { hotcodereplace = "auto" }
  require("jdtls.dap").setup_dap_main_class_configs()
end

jdtls.start_or_attach(config)

-- options
vim.opt_local.tabstop = 4
vim.opt_local.shiftwidth = 4

vim.keymap.set({ "n", "v" }, "<leader>Ev", function()
  jdtls.extract_variable()
end, { buffer = true, desc = "Extract variable" })
vim.keymap.set({ "n", "v" }, "<leader>EV", function()
  jdtls.extract_variable()
end, { buffer = true, desc = "Extract variable all" })
vim.keymap.set({ "n", "v" }, "<leader>Em", function()
  jdtls.extract_method()
end, { buffer = true, desc = "Extract method" })

-- TODO: fix this
vim.keymap.set("n", "<leader>Et", function()
  jdtls.pick_test()
end, { buffer = true, desc = "Execute test" })
