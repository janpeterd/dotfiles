return {
  {
    "mbbill/undotree",
    -- lazy = false,
    config = function()
      vim.keymap.set("n", "<leader>Tu", "<cmd>UndotreeToggle<cr>", { desc = "[T]oggle [U]ndotree" })
    end,
  },
}
