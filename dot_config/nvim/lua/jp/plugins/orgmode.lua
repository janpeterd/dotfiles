return {
  {
    "nvim-orgmode/orgmode",
    lazy = true,
    ft = "org",
    dependencies = {
      { "nvim-treesitter/nvim-treesitter", lazy = true },
    },
    config = function()
      require "jp.orgmode"
    end,
  },
}
