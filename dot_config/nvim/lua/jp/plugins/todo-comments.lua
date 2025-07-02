return {
  {
    "folke/todo-comments.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    lazy = true,
    event = { "BufReadPost", "BufNewFile" },
    opts = {
      highlight = {
        pattern = [[.*<(KEYWORDS)\s*]], -- pattern or table of patterns, used for highlighting (vim regex)
        keyword = "bg",
      },
      search = {
        pattern = [[\b(KEYWORDS)\b]], -- match without the extra colon. You'll likely get false positives
      },
    },
    keys = {
      {
        "<leader>Tt",
        "<cmd>TodoQuickFix<cr>",
        desc = "[T]oggle [t]odos",
      },
    },
  },
}
