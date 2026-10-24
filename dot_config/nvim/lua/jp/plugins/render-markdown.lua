return {
  {
    "MeanderingProgrammer/render-markdown.nvim",
    ft = { "markdown", "rmd" },
    dependencies = {
      "nvim-treesitter/nvim-treesitter",
      "nvim-tree/nvim-web-devicons",
    },
    opts = {
      -- Keep markdown readable: no full-width heading bars, icons, or
      -- heading background highlights. Tables, code blocks and checkboxes
      -- still render.
      heading = {
        enabled = false,
      },
    },
  },
}
