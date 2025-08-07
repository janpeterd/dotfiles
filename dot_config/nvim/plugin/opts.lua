local opt = vim.opt
local global = vim.g

opt.nu = true             -- Show line numbers
opt.relativenumber = true -- Relative numbers
opt.termguicolors = true
opt.signcolumn = "yes"    -- use sign column (left of line numbers) for git gutter
opt.winborder = "rounded"
opt.list = true           -- Show characters for space, tabs, etc.
opt.listchars = { trail = "-", tab = "- " }
opt.spelllang = "en,nl"   -- Spell check languages
opt.tabstop = 2           -- Number of spaces that tab counts for
opt.softtabstop = 2
opt.shiftwidth = 2        -- Nuber of spaces to use for indent
opt.shiftround = true
opt.expandtab = true      -- Use spaces instead of tabs
opt.smartindent = true    -- Auto indent
opt.splitright = true     -- Prefer windows splitting to the right
opt.splitbelow = true     -- Prefer windows splitting to the bottom
opt.wrap = false          -- wrap
opt.breakindent = true
opt.backup = false
opt.undofile = true
opt.swapfile = false            -- fully disable swap
opt.hlsearch = false            -- highlight search results after search
opt.incsearch = true            -- update search as you type
opt.inccommand = "split"        -- update search as you type
opt.guicursor = "a:blinkon1"    -- blink the cursor
opt.cursorline = true           -- highlight current line
opt.scrolloff = 1
opt.mousescroll = "ver:2,hor:6" -- scroll 2 lines pervertical scroll
opt.isfname:append "@-@"
opt.updatetime = 50
opt.colorcolumn = "" -- Disable the vertical line
opt.completeopt = { "menu", "menuone", "noselect" }
opt.completeopt:append "noselect"

opt.cmdheight = 1     -- height of the commandline
opt.formatoptions = opt.formatoptions
    - "a"             -- Auto formatting is BAD.
    - "t"             -- Don't auto format my code. I got linters for that.
    + "c"             -- In general, I like it when comments respect textwidth
    + "q"             -- Allow formatting comments w/ gq
    - "o"             -- O and o, don't continue comments
    - "r"             -- Also don't continue when pressing enter.
    + "n"             -- Indent past the formatlistpat, not underneath it.
    + "j"             -- Auto-remove comments if possible.
    - "2"             -- I'm not in gradeschool anymore
opt.ignorecase = true -- Ignore cases in query
opt.smartcase = true  -- unless query contains capital letters
opt.clipboard = "unnamedplus"
opt.grepprg = [[rg --vimgrep]]

if vim.fn.has "win32" == 1 then
  opt.shell = "bash"
  opt.shellcmdflag = "-c"
  opt.shellxquote = "("
end

vim.g.disable_autoformat = false
vim.g.disable_completion = false
vim.g.current_diagnostic_mode = 1 -- See lsp_lines.lua for code, used to toggle diagnostics (1 = default, 2 = lines, 3 = off)

function Fd(file_pattern, _)
  -- if first char is * then fuzzy search
  if file_pattern:sub(1, 1) == "*" then
    file_pattern = file_pattern:gsub(".", ".*%0") .. ".*"
  end
  local cmd = 'fd  --color=never --full-path --type file --hidden --exclude=".git" --exclude="deps" "'
      .. file_pattern
      .. '"'
  local result = vim.fn.systemlist(cmd)
  return result
end

vim.opt.findfunc = "v:lua.Fd"

function GitStatus()
  local dict = vim.b.gitsigns_status_dict
  if not dict or not dict.head or dict.head == '' then
    return ''
  end

  local branch = ' ' .. dict.head

  local hunks_parts = {}
  if dict.added and dict.added > 0 then
    table.insert(hunks_parts, '+' .. dict.added)
  end
  if dict.changed and dict.changed > 0 then
    table.insert(hunks_parts, '~' .. dict.changed)
  end
  if dict.removed and dict.removed > 0 then
    table.insert(hunks_parts, '-' .. dict.removed)
  end

  local hunks = table.concat(hunks_parts, ' ')
  if hunks == '' then
    return branch
  else
    return branch .. ' [' .. hunks .. ']'
  end
end

opt.statusline = "%#StatusLine# %f %y%=%{v:lua.GitStatus()} %l:%c "
