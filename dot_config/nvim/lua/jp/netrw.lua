local g = vim.g

if vim.o.columns < 90 then
  -- If the screen is small, occupy half
  g.netrw_winsize = 50
else
  -- else take 30%
  g.netrw_winsize = 30
end

-- A better copy command
g.netrw_localcopydircmd = "cp -r"
g.netrw_use_errorwindow = 0
g.netrw_browsex_viewer = "xdg-open"

g.netrw_list_hide = [[\(^\|\s\s\)\zs\.\S\+]]

-- global.netrw_keepdir         = 0 -- NOTE: I don't prefer this, but copying and stuff break otherwise when not in vim root dir
