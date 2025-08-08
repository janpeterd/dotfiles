return {
  -- Record programming time
  { enabled = vim.g.jp_profile == 'dev', "wakatime/vim-wakatime", lazy = true, event = { "BufReadPost", "BufNewFile" } },
}
