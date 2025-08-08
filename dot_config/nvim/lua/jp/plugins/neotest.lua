return {
  {
    enabled = vim.g.jp_profile == 'dev',
    "rcasia/neotest-java",
    -- ft = "java", -- This can be useful, but making it a direct dependency of neotest is more critical for adapter loading.
    -- You can keep ft = "java" if neotest-java has other setup it does on filetype.
    dependencies = {
      "mfussenegger/nvim-jdtls",
      "mfussenegger/nvim-dap",
      "rcarriga/nvim-dap-ui",
      "theHamsta/nvim-dap-virtual-text",
    },
    -- If you have specific `opts` for neotest-java itself (not its adapter config), put them here.
    -- Otherwise, its configuration will primarily be within neotest's adapter section.
  },
  {
    enabled = vim.g.jp_profile == 'dev',
    "nvim-neotest/neotest",
    dependencies = {
      "nvim-neotest/nvim-nio",
      "nvim-lua/plenary.nvim",
      "antoinemadec/FixCursorHold.nvim",
      "nvim-treesitter/nvim-treesitter",
      "rcasia/neotest-java", -- <<< MAKE SURE neotest-java is a dependency
    },
    opts = {
      adapters = {
        -- Provide the adapter configuration as a table, keyed by the adapter's name
        ["neotest-java"] = { -- <<< CORRECT WAY
          junit_jar = nil,   -- default: stdpath("data") .. /nvim/neotest-java/junit-platform-console-standalone-[version].jar
          incremental_build = true
          -- any other neotest-java specific adapter options
        },
      },
      -- other neotest general options here if you have them
      -- e.g., status = { virtual_text = true },
      --       output = { open_on_run = true },
    },
    -- You might want to add config or init functions here if needed, for keymaps for example.
    -- The example from neotest-java readme for keymaps could go here:
    -- config = function(_, opts)
    --   require("neotest").setup(opts) -- If you use opts above, neotest usually handles this.
    --                                  -- But if you have more complex setup:
    --   -- Keymaps example:
    --   local neotest_ns = vim.api.nvim_create_namespace("neotest")
    --   vim.diagnostic.config({
    --     virtual_text = {
    --       namespace = neotest_ns,
    --     },
    --     signs = {
    --       namespace = neotest_ns,
    --     },
    --   }, neotest_ns)

    --   vim.keymap.set("n", "<leader>tt", function() require("neotest").run.run(vim.fn.expand("%")) end, { desc = "Neotest: Run File" })
    --   vim.keymap.set("n", "<leader>tr", function() require("neotest").run.run() end, { desc = "Neotest: Run Nearest" })
    --   vim.keymap.set("n", "<leader>tS", function() require("neotest").summary.toggle() end, { desc = "Neotest: Toggle Summary" })
    --   vim.keymap.set("n", "<leader>to", function() require("neotest").output.open({ enter = true }) end, { desc = "Neotest: Show Output" })
    --   vim.keymap.set("n", "<leader>tD", function() require("neotest").run.run({ strategy = "dap" }) end, { desc = "Neotest: Debug Nearest" })
    --   vim.keymap.set("n", "<leader>tF", function() require("neotest").run.run({vim.fn.expand("%"), strategy = "dap" }) end, {desc = "Neotest: Debug File"})

    -- end,
  },
}
