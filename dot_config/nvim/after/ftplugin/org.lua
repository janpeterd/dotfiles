vim.opt_local.wrap = true
vim.opt_local.linebreak = true
vim.opt_local.spell = true
vim.opt_local.tabstop = 2
vim.opt_local.softtabstop = 2
vim.opt_local.shiftwidth = 2

-- Conceil
vim.opt_local.conceallevel = 2
vim.opt_local.concealcursor:append "nc"

-- very scuffed Handy orgmode keybinds
vim.keymap.set("i", "<M-CR>", function()
  local current_line = vim.api.nvim_get_current_line()
  local first_char = string.match(current_line, "%S") -- first non whitespace char
  if first_char == "-" or first_char == "+" then
    vim.api.nvim_input [[<ESC>yypWC]]
    return
  elseif first_char ~= nil and tonumber(first_char) ~= nil then
    vim.api.nvim_input [[<ESC>yypf.C+1<ESC>^C<C-r>=<C-r>"<CR>. ]]
    return
  end
end, { buffer = true })

vim.keymap.set("n", "<C-CR>", "Go<CR>*<C-d><C-d> ", { buffer = true })
