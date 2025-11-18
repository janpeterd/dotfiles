local set = vim.keymap.set
local tgl = function(givenOpt)
  vim.opt[givenOpt] = not vim.opt[givenOpt]:get()
  print("[INFO] Toggled " .. givenOpt)
end

-- Pure neovim remaps. Plugin remaps are in plugin files.

-- Native find
vim.keymap.set("n", "<leader>fn", ":find ", { desc = "[F]ind [N]ative)" })

-----------
-- Open file
------------
local last_press_time = 0
local press_count = 0

set("n", "<leader>gf", ":wincmd w || e <C-r><C-f><cr>") -- open the file under the cursor in the last used window
set("i", "<C-l>", function()
  -- function that does the following:
  -- keymap is pressed once: center current line in the view
  -- keymap is pressed twice: set currentl line at the top of the view
  -- keymap is pressed for a third time: set currentl line at the bottom of the view
  local current_time = vim.loop.now()

  -- Reset count if more than 500ms have passed since last keypress
  if current_time - last_press_time > 500 then
    press_count = 0
  end

  press_count = press_count + 1
  last_press_time = current_time

  if press_count == 1 then
    -- Center current line in the view
    vim.cmd "normal! zz"
  elseif press_count == 2 then
    -- Set current line at the top of the view
    vim.cmd "normal! zt"
  elseif press_count == 3 then
    -- Set current line at the bottom of the view
    vim.cmd "normal! zb"
    -- Reset count after third press
    press_count = 0
  end
end)

-----------
-- Editing
------------

set("n", "<leader>tt", "<cmd>drop ~/Sync/org/todo.org<CR>")
set("n", "<leader>tv", "<cmd>drop ~/Sync/org/vito.org<CR>")
set("i", "<C-BS>", "<C-w>")
set("c", "<C-p>", "<Up>")
set("c", "<C-n>", "<Down>")
-- scuffed capitalize in insert mode (like emacs)
set({ "i", "c" }, "<A-c>", "<cmd>norm ~<cr><Esc>wi")

------------
-- Quickfixlist navigation
------------

set("n", "<A-j>", "<cmd>cnext<cr>")
set("n", "<A-k>", "<cmd>cprev<cr>")
-- set("v", "J", ":m '>+1<CR>gv=gv")
-- set("v", "K", ":m '<-2<CR>gv=gv")

------------
-- Locationlist navigation
------------
set("n", "<A-n>", "<cmd>lnext<cr>")
set("n", "<A-p>", "<cmd>lprev<cr>")

------------
-- Past last vim yank or delete (no external)
------------

-- use P instead
-- set("n", "<leader>p", ':set paste<CR>"+p:set nopaste<CR>', { desc = "[p]aste (keep clipboard)" })
set("x", "<leader>p", [["_dP]], { desc = "[p]aste (keep clipboard)" })
-- set("i", "<A-p>", "<Esc>:set paste<CR>\"+p:set nopaste<CR>i")    -- paste from system clipboard
-- vim.keymap.set({ "n", "v" }, "<leader>y", [["+y]])
set("c", "<C-k>", "\\(\\)<left><left>") -- insert :

------------
-- Quick Substitutions
------------

set("n", "<leader>S", ":%s///g<left><left><left>", { desc = "[S]ubstitution (entire buf)" })
set("v", "<leader>S", '"cy:%s/<C-r>c//g<left><left>', { desc = "[S]ubstitution (global file, prefill)" })
------------
-- Centering after jump
------------
-- set("n", "{", "{zz")
-- set("n", "}", "}zz")
set("v", "<leader>C", "<CMD>'<,'>center<CR>")

------------
-- Quick join and unjoin
------------

set("i", "<S-CR>", "<C-O>o")
set("i", "<C-CR>", "<C-o>O") -- In normal mode just add space without going to insert mode
set("n", "<S-CR>", "m`o<Esc>``")
set("n", "<C-CR>", "m`O<Esc>``")

------------
-- Open
------------

set("n", "<leader>oc", "<cmd>copen<cr><cmd>wincmd J<cr>", { desc = "[O]pen [q]uickfixlist" })
set("n", "<leader>ol", "<cmd>lopen<cr><cmd>wincmd J<cr>", { desc = "[O]pen [l]ocationlist" })
set("n", "<leader>od", function()
  vim.diagnostic.setqflist {}
end, { desc = "[O]pen [d]iagnostics in Quickfix List" })

------------
-- Buffer
------------

set("n", "<leader>bc", "<cmd>new<cr>", { desc = "[B]uffer [c]reate new" })
set("n", "<leader>bn", "<cmd>bnext<cr>", { desc = "[B]uffer Goto [n]ext" })
set("n", "<leader>bp", "<cmd>bprevious<cr>", { desc = "[B]uffer [p]revious" })
set("n", "<leader>bk", "<cmd>bd<cr>", { desc = "[B]uffer [k]ill" })
set("n", "<leader>bK", "<cmd>%bdelete<cr>", { desc = "[B]uffer [K]ill all" })
set("n", "<leader>bl", "<C-^>", { desc = "[B]uffer [l]ast" })

------------
-- Search
------------

set("v", "<leader>/", "y<ESC>/<c-r>0", { desc = "Search selection" })
set("n", "<leader>/", "/\\v", { desc = "Search magic" })

------------
-- Window management
------------

if not vim.g.vscode then
  set("n", "<leader>w", "<C-w>")
end

set("n", "<c-h>", "<C-w>h", { desc = "Select window to the left" })
set("n", "<c-l>", "<C-w>l", { desc = "Select window to the right" })
set("n", "<c-j>", "<C-w>j", { desc = "Select window under" })
set("n", "<c-k>", "<C-w>k", { desc = "Select window above" })
set("n", "<C-w>m", "<C-w>|<C-w>_", { desc = "[M]axmize the current window" })
set("n", "<leader>wm", "<C-w>|<C-w>_", { desc = "[M]axmize the current window" })
set("n", "<C-w>V", "<cmd>vnew<CR>", { desc = "[N]ew empty [V]ertical window" })
set("n", "<leader>wV", "<cmd>vnew<CR>", { desc = "[N]ew empty [V]ertical window" })
set("n", "<C-w>S", "<cmd>new<CR>", { desc = "[N]ew empty window" })
set("n", "<leader>wS", "<cmd>new<CR>", { desc = "[N]ew empty window" })

-- move
set("n", "<C-A-h>", "<C-w>H", { desc = "Move window to the very left" })
set("n", "<C-A-l>", "<C-w>L", { desc = "Move window to the very right" })
set("n", "<C-A-j>", "<C-w>J", { desc = "Move window to the very bottom" })
set("n", "<C-A-k>", "<C-w>K", { desc = "Move window to the very top" })

-- resize
set("n", "<A-.>", "<C-w>5<", { desc = "(<) Decrease width" })
set("n", "<A-,>", "<C-w>5>", { desc = "(>) Increase width" })

set("n", "<A-l>", "<CMD>mode<CR>", { desc = "clear and redraw screen " })

------------
-- Tabs
------------

set("n", "<leader>tk", "<cmd>tabclose<cr>", { desc = "[T]ab [k]ill" })
set("n", "<leader>tm", "<cmd>+tabmove<cr>", { desc = "[T]ab [m]ove Current Forward" })
set("n", "<leader>tM", "<cmd>-tabmove<cr>", { desc = "[T]ab [M]ove Current Backwards" })
set("n", "<leader>tc", "<cmd>tabnew<cr>", { desc = "[T]ab [c]reate" })
set("n", "<leader>tn", "gt", { desc = "[T]ab [n]ext" })
set("n", "<leader>tp", "gT", { desc = "[T]ab [p]revious" })
set("n", "<leader>tK", "<cmd>%bdelete<cr>", { desc = "[T]ab [K]ill all" })
set("n", "<leader>tl", "g<Tab>", { desc = "[T]ab [l]ast" })

------------
-- Toggle
------------

set("n", "<leader>Tw", function()
  tgl "wrap"
  tgl "linebreak"
end, { desc = "[T]oggle [w]rapping and linebreak" })
set("n", "<leader>Ts", function()
  tgl "spell"
end, { desc = "[T]oggle [s]pell" })
set("n", "<leader>Th", function()
  tgl "hlsearch"
end, { desc = "[T]oggle [h]ighlight (hlsearch)" })
set("n", "<leader>Td", function()
  vim.cmd [[ToggleDistractions]]
end, { desc = "[T]oggle [d]istractions (usercmd)" })

------------
-- Terminal
------------

set("t", "<Esc>", "<C-\\><C-n>") -- this might cause some issues. but still lot faster

set("n", "<leader>op", function()
  local term_name = "PYTHON REPL"
  local term_buf_number = vim.fn.bufnr(term_name)

  if term_buf_number ~= -1 then
    vim.cmd.split()
    vim.cmd.wincmd "J"
    vim.api.nvim_win_set_height(0, 12)
    vim.wo.winfixheight = true
    vim.api.nvim_set_current_buf(term_buf_number)
  else
    vim.cmd.new()
    vim.cmd.wincmd "J"
    vim.api.nvim_win_set_height(0, 12)
    vim.wo.winfixheight = true
    vim.cmd.term "python"
    vim.api.nvim_buf_set_name(0, term_name)
  end
  vim.cmd.norm "i"
end, { desc = "[O]pen same [p]ython (repl)" })

-- e for eval?
set("n", "<leader>oe", function()
  local term_name = "LUA REPL"
  local term_buf_number = vim.fn.bufnr(term_name)

  if term_buf_number ~= -1 then
    vim.cmd.split()
    vim.cmd.wincmd "J"
    vim.api.nvim_win_set_height(0, 12)
    vim.wo.winfixheight = true
    vim.api.nvim_set_current_buf(term_buf_number)
  else
    vim.cmd.new()
    vim.cmd.wincmd "J"
    vim.api.nvim_win_set_height(0, 12)
    vim.wo.winfixheight = true
    vim.cmd.term "lua"
    vim.api.nvim_buf_set_name(0, term_name)
  end
  vim.cmd.norm "i"
end, { desc = "[O]pen same Lua repl (to [e]val)" })

set("n", "<leader>oT", "<cmd>term<cr>", { desc = "[O]pen different [T]erminal" })

set("n", "<leader>ot", function()
  local term_name = "TERMINAL"
  local term_buf_number = vim.fn.bufnr(term_name)
  if term_buf_number ~= -1 then
    vim.api.nvim_set_current_buf(term_buf_number)
  else
    vim.cmd.term()
    vim.api.nvim_buf_set_name(0, term_name)
  end
  vim.cmd.norm "i"
end, { desc = "[O]pen same [t]erminal" })
set("n", "<leader>oT", "<cmd>term<cr>", { desc = "[O]pen different [T]erminal" })

-- Open a terminal (ALWAYS THE SAME ONE!) at the bottom of the screen with a fixed height.
set("n", "<leader>os", function()
  local term_name = "TERMINAL"
  local term_buf_number = vim.fn.bufnr(term_name)

  if term_buf_number ~= -1 then
    vim.cmd.split()
    vim.cmd.wincmd "J"
    vim.api.nvim_win_set_height(0, 12)
    vim.wo.winfixheight = true
    vim.api.nvim_set_current_buf(term_buf_number)
  else
    vim.cmd.new()
    vim.cmd.wincmd "J"
    vim.api.nvim_win_set_height(0, 12)
    vim.wo.winfixheight = true
    vim.cmd.term()
    vim.api.nvim_buf_set_name(0, term_name)
  end
  vim.cmd.norm "i"
end, { desc = "[O]pen [s]hell (bottom split, same)" })

------------
-- Code
------------

set("n", "<leader>cd", function()
  vim.diagnostic.open_float()
end, { desc = "[C]ode [d]iagnostics (in floating win)" })
set("n", "<leader>ce", "<cmd>luafile %<cr>", { desc = "[C]ode [e]xecute (luafile)" })
set("n", "<leader>cm", "<cmd>make<cr>", { desc = "[C]ode [m]ake" })
set({ "n", "i" }, "<F12>", function()
  vim.diagnostic.enable(not vim.diagnostic.is_enabled())
end, { desc = "Toggle Diagnostics" })

--
-- Reload/source

set("n", "<leader>rm", function()
  if vim.fn.has "win32" == 1 then
    vim.cmd.source(vim.env.USERPROFILE .. "/AppData/Local/nvim/plugin/remap.lua")
  else
    vim.cmd.source "~/.config/nvim/plugin/remap.lua"
  end
end, { desc = "[R]eload [m]appings" }) -- maps

if vim.g.vscode then
  local code = require "vscode"
  print "VSCODE LOADED!"
  set("n", "<leader>bb", function()
    code.action "workbench.action.quickOpen"
  end)
  set("n", "<leader>,", function()
    code.action "workbench.action.quickOpen"
  end)
  -- install the search it faster plugin in vscode!
  set("n", "<leader>ff", function()
    code.action "find-it-faster.findFiles"
  end)
  set("n", "<leader>sg", function()
    code.action "find-it-faster.findWithinFiles"
  end)

  set("n", "<leader>ot", function()
    code.action "workbench.action.terminal.toggleTerminal"
    code.action "workbench.action.toggleMaximizedPanel"
  end, { desc = "[O]pen [t]erminal" })

  set("n", "<leader>os", function()
    code.action "workbench.action.terminal.toggleTerminal"
  end, { desc = "[O]pen [s]hell" })

  set("n", "-", function()
    code.action "workbench.action.terminal.toggleTerminal"
  end, { desc = "[O]pen [t]erminal" })

  set("n", "<leader>wj", function()
    code.call "workbench.action.navigateDown"
  end)
  set("x", "<leader>wj", function()
    code.call "workbench.action.navigateDown"
  end)
  set("n", "<leader>wk", function()
    code.call "workbench.action.navigateUp"
  end)
  set("x", "<leader>wk", function()
    code.call "workbench.action.navigateUp"
  end)
  set("n", "<leader>wh", function()
    code.call "workbench.action.navigateLeft"
  end)
  set("x", "<leader>wh", function()
    code.call "workbench.action.navigateLeft"
  end)
  set("n", "<leader>wl", function()
    code.call "workbench.action.navigateRight"
  end)
  set("x", "<leader>wl", function()
    code.call "workbench.action.navigateRight"
  end)

  set("n", "<C-j>", function()
    code.call "workbench.action.navigateDown"
  end)
  set("n", "<C-k>", function()
    code.call "workbench.action.navigateUp"
  end)
  set("n", "<C-h>", function()
    code.call "workbench.action.navigateLeft"
  end)
  set("n", "<C-l>", function()
    code.call "workbench.action.navigateRight"
  end)

  set("n", "<leader>ws", function()
    code.call "workbench.action.splitEditorDown"
  end)
  set("x", "<leader>ws", function()
    code.call "workbench.action.splitEditorDown"
  end)
  set("n", "<leader>wv", function()
    code.call "workbench.action.splitEditorRight"
  end)
  set("x", "<leader>wv", function()
    code.call "workbench.action.splitEditorRight"
  end)
  set("n", "<leader>wc", function()
    code.call "workbench.action.closeActiveEditor"
  end)
  set("x", "<leader>wc", function()
    code.call "workbench.action.closeActiveEditor"
  end)

  set("n", "<leader>wo", function()
    code.call "workbench.action.closePanel"
    code.call "workbench.action.joinAllGroups"
    code.call "workbench.action.toggleMaximizeEditorGroup"
  end)

  set("n", "<C-w>o", function()
    code.call "workbench.action.closePanel"
    code.call "workbench.action.joinAllGroups"
    code.call "workbench.action.toggleMaximizeEditorGroup"
  end)
  set("x", "<C-w>o", function()
    code.call "workbench.action.closePanel"
    code.call "workbench.action.joinAllGroups"
    code.call "workbench.action.toggleMaximizeEditorGroup"
  end)

  set("n", "<C-w><C-o>", function()
    code.call "workbench.action.closePanel"
    code.call "workbench.action.joinAllGroups"
    code.call "workbench.action.toggleMaximizeEditorGroup"
  end)
  set("x", "<C-w><C-o>", function()
    code.call "workbench.action.closePanel"
    code.call "workbench.action.joinAllGroups"
    code.call "workbench.action.toggleMaximizeEditorGroup"
  end)

  set("n", "<leader>bl", function()
    code.call "workbench.action.navigateBack"
  end)

  set("n", "<leader>cf", function()
    print "formatting neovim"
    code.call "editor.action.formatDocument"
  end)

  set("n", "<leader>gg", function()
    code.action "workbench.action.terminal.toggleTerminal"
    code.action("workbench.action.terminal.sendSequence", {
      args = {
        text = { "lazygit\\u000D" },
      },
    })
  end)
end
