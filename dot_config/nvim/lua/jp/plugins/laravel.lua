return {
  {
    enabled = vim.g.jp_profile == 'dev',
    "noahfrederick/vim-laravel",
    lazy = true,
    ft = { "php", "blade" },
  },
  {
    enabled = vim.g.jp_profile == 'dev',
    "jwalton512/vim-blade",
    lazy = true,
    ft = "blade",
  },
}
