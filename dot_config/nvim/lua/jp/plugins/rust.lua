return {
  {
    "mrcjkb/rustaceanvim",
    version = "^5", -- Recommended
    ft = "rust",
    config = function()
      vim.g.rustaceanvim = {
        tools = {
          float_win_config = {
            border = "rounded",
          },
        },
      }

      -- Overwride keybinds *only for Rust buffers*

      local bufnr = vim.api.nvim_get_current_buf()
      vim.keymap.set("n", "<leader>ca", function()
        vim.cmd.RustLsp "codeAction" -- supports rust-analyzer's grouping
        -- or vim.lsp.buf.codeAction() if you don't want grouping.
      end, { desc = "[C]ode [A]ction (rustaceanvim)", silent = true, buffer = bufnr })

      vim.keymap.set("n", "<leader>ca", function()
        vim.cmd.RustLsp "codeAction" -- supports rust-analyzer's grouping
        -- or vim.lsp.buf.codeAction() if you don't want grouping.
      end, { silent = true, buffer = bufnr })
      vim.keymap.set(
        "n",
        "K", -- Override Neovim's built-in hover keymap with rustaceanvim's hover actions
        function()
          vim.cmd.RustLsp { "hover", "actions" }
        end,
        { silent = true, buffer = bufnr }
      )
      vim.keymap.set("n", "J", function()
        vim.cmd.RustLsp "joinLines"
      end, { silent = true, buffer = bufnr })

      vim.keymap.set(
        "n",
        "K", -- Override Neovim's built-in hover keymap with rustaceanvim's hover actions
        function()
          vim.cmd.RustLsp { "hover", "actions" }
        end,
        { silent = true, buffer = bufnr }
      )

      vim.keymap.set({ "n", "i" }, "<F5>", function()
        vim.cmd.RustLsp "debug"
      end, { silent = true, buffer = bufnr, desc = "[DAP] Continue or Run" })
    end,
  },
}
