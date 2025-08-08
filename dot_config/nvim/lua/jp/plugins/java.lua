return {
  {
    enabled = vim.g.jp_profile == 'dev',
    "JavaHello/spring-boot.nvim",
    ft = { "java", "yaml", "jproperties" },
    dependencies = {
      "mfussenegger/nvim-jdtls",
    },
    ---@type bootls.Config
    opts = {},
  },
  {
    enabled = vim.g.jp_profile == 'dev',
    "mfussenegger/nvim-jdtls",
    lazy = true,
    ft = "java",
  },
}
