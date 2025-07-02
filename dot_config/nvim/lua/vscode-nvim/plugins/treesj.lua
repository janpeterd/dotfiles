return {
  {
    "Wansmer/treesj",
    dependencies = { "nvim-treesitter/nvim-treesitter" },
    lazy = true,
    keys = {
      { "<leader>j", "<cmd>TSJToggle<cr>", desc = "Join Toggle" },
    },
    config = function()
      local langs = {
        cs = {
          array = {--[[ preset ]]},
          object = {--[[ preset ]]},
          ["function"] = {
            target_nodes = {--[[ targets ]]},
          },
        },
      }
      require("treesj").setup {
        use_default_keymaps = false,
        max_join_length = 500, -- don't joint blocks larger than 500 characters
      }
    end,
  },
}
