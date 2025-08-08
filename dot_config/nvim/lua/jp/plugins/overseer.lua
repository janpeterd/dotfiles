return {
  {
    enabled = vim.g.jp_profile == 'dev',
    "stevearc/overseer.nvim",
    config = function()
      require("overseer").setup()
      vim.keymap.set("n", "<F2>", "<cmd>OverseerToggle<cr>", { desc = "Toggle overseer interface" })
      vim.keymap.set("n", "<F3>", "<cmd>OverseerBuild<cr>", { desc = "Build program with overseer" })
      vim.keymap.set("n", "<F4>", "<cmd>OverseerRun<cr>", { desc = "Run a task with overseer" })
    end,
  },
}
