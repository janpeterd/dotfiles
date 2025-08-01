vim.g.mapleader = " "

local lazypath = vim.fn.stdpath "data" .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system {
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  }
end
vim.opt.rtp:prepend(lazypath)

if vim.g.vscode then
  require("lazy").setup {
    concurrency = 8,
    spec = {
      { import = "vscode-nvim/plugins" },
    },
    change_detection = {
      notify = false,
    },
  }
else
  require("lazy").setup {
    concurrency = 8,
    spec = {
      { import = "jp/plugins" },
    },
    change_detection = {
      notify = false,
    },
  }
end
