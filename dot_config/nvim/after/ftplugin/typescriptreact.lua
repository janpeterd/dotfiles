vim.opt_local.makeprg = "yarn tsc"

vim.api.nvim_create_autocmd("BufWritePre", {
  group = vim.api.nvim_create_augroup("typescript", { clear = true }),
  pattern = { "*.ts", "*.tsx" },
  callback = function()
    pcall(function()
      vim.cmd "TSToolsAddMissingImports sync"
      vim.cmd "TSToolsOrganizeImports sync"
    end)
  end,
})
