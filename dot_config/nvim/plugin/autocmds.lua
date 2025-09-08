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


-- compile mermaid diagrams
vim.cmd [[
  autocmd BufWritePost *.mmd,*.mmdc !mmdc -i % -o %:r.png &
]]

-- DADBOT-UI dont fold
vim.cmd [[
  autocmd FileType dbout setlocal nofoldenable
]]

-- Skeletons (new file templates)
vim.cmd [[
  autocmd BufNewFile readme.md 0r $XDG_CONFIG_HOME/nvim/skeletons/readme.md
  autocmd BufNewFile *.html 0r $XDG_CONFIG_HOME/nvim/skeletons/html.html
]]

local notify
if pcall(require, "mini.notify") then
  notify = require("mini.notify").make_notify()
else
  notify = vim.notify
end

-- Automatically apply chezmoi changes on write
local chezmoi_group = augroup("chezmoi", { clear = true })
autocmd("BufWritePost", {
  group = chezmoi_group,
  -- This pattern matches files in the default chezmoi source directory.
  pattern = os.getenv("HOME") .. "/.local/share/chezmoi/*",
  desc = "Apply chezmoi changes on write",
  callback = function(args)
    -- Get the full, absolute path of the file being saved (the source path).
    local source_path = vim.fn.fnamemodify(vim.api.nvim_buf_get_name(args.buf), ':p')
    if source_path == "" then return end

    -- 1. Ask chezmoi to convert the source path to the target (destination) path.
    local get_target_cmd = "chezmoi target-path " .. vim.fn.shellescape(source_path)
    -- Execute the command and trim the trailing newline from the output.
    local target_path = vim.trim(vim.fn.system(get_target_cmd))

    -- If the command failed or returned nothing (e.g., for an ignored file), stop.
    if vim.v.shell_error ~= 0 or target_path == "" then
      notify("chezmoi: Not a managed file: " .. source_path, vim.log.levels.WARN)
      return
    end

    -- 2. Construct the apply command with ONLY the target path. This is the fix.
    local apply_cmd = "chezmoi apply " .. vim.fn.shellescape(target_path)
    vim.fn.system(apply_cmd)

    -- If the apply command succeeded, show a confirmation.
    if vim.v.shell_error == 0 then
      notify("Applied chezmoi for " .. target_path, vim.log.levels.INFO)
    else
      notify("chezmoi apply failed for " .. target_path, vim.log.levels.ERROR)
    end
  end,
})
