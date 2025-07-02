local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd

-- Highlight on yank
autocmd("TextYankPost", {
  desc = "Highlight yanked text",
  group = augroup("highlightyank", { clear = true }),
  pattern = "*",
  callback = function()
    vim.highlight.on_yank {
      -- set color
      higroup = "IncSearch",
      timeout = 300,
    }
  end,
})

-- DADBOT-UI dont fold
vim.cmd [[
  autocmd FileType dbout setlocal nofoldenable
]]

-- Skeletons (new file templates)
vim.cmd [[
  autocmd BufNewFile readme.md 0r $XDG_CONFIG_HOME/nvim/skeletons/readme.md
  autocmd BufNewFile *.html 0r $XDG_CONFIG_HOME/nvim/skeletons/html.html
]]
