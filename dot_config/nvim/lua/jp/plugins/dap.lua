return {
  {
    enabled = vim.g.jp_profile == 'dev',
    "mfussenegger/nvim-dap",
    dependencies = {
      "leoluz/nvim-dap-go",
      "mfussenegger/nvim-dap-python",
      "rcarriga/nvim-dap-ui",
      "theHamsta/nvim-dap-virtual-text",
      "nvim-neotest/nvim-nio",
      "williamboman/mason.nvim",
    },
    config = function()
      local dap = require "dap"
      local ui = require "dapui"

      ---@diagnostic disable-next-line: missing-fields
      require("dapui").setup {
        layouts = {
          {
            elements = {
              {
                id = "repl",
                size = 0.25,
              },
              {
                id = "breakpoints",
                size = 0.25,
              },
              {
                id = "stacks",
                size = 0.25,
              },
              {
                id = "watches",
                size = 0.25,
              },
            },
            position = "left",
            size = 40,
          },
          {
            elements = {
              {
                id = "console",
                size = 1.00,
              },
            },
            position = "bottom",
            size = 8,
          },
          {
            elements = {
              {
                id = "scopes",
                size = 1.00,
              },
            },
            position = "right",
            size = 80,
          },
        },
      }

      require("dap-go").setup()
      require("dap-python").setup()
      -- RUST lsp is setup with rustaceanvim (see rust.lua)

      -- Eval var under cursor
      vim.keymap.set("n", "<space>?", function()
        require("dapui").eval(nil, { enter = true })
      end)

      vim.keymap.set({ "n", "i" }, "<F5>", dap.continue, { desc = "[DAP] Continue or Run" })
      vim.keymap.set({ "n", "i" }, "<F6>", dap.toggle_breakpoint, { desc = "[DAP] Toggle Breakpoint" })
      vim.keymap.set({ "n", "i" }, "<S-F5>", dap.close, { desc = "[DAP] Stop debugging" })
      vim.keymap.set({ "n", "i" }, "<C-F5>", dap.run_to_cursor, { desc = "[DAP] Run to Cursor" })
      vim.keymap.set({ "n", "i" }, "<F7>", dap.step_into, { desc = "[DAP] Step Into" })
      vim.keymap.set({ "n", "i" }, "<F8>", dap.step_over, { desc = "[DAP] Step Over" })
      vim.keymap.set({ "n", "i" }, "<S-F8>", dap.step_out, { desc = "[DAP] Step Out" })
      vim.keymap.set({ "n", "i" }, "<F9>", function()
        dap.list_breakpoints()
        vim.cmd [[copen]]
      end, { desc = "[DAP] List breakpoints" })

      vim.keymap.set({ "n", "i" }, "<F13>", dap.restart, { desc = "[DAP] Restart debugger" })

      dap.listeners.before.attach.dapui_config = function()
        ui.open()
      end
      dap.listeners.before.launch.dapui_config = function()
        ui.open()
      end
      dap.listeners.before.event_terminated.dapui_config = function()
        ui.close()
      end
      dap.listeners.before.event_exited.dapui_config = function()
        ui.close()
      end
    end,
  },
}
