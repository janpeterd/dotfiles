local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd
local usercmd = vim.api.nvim_create_user_command

usercmd("Redir", function(ctx)
  local lines = vim.split(vim.api.nvim_exec2(ctx.args, { output = true })["output"], "\n", { plain = true })
  vim.cmd "new"
  vim.api.nvim_buf_set_lines(0, 0, -1, false, lines)
  vim.opt_local.modified = false
end, { nargs = "+", complete = "command" })

usercmd("CenterCursor", function(ctx)
  local large_scrolloff = 99999
  local arg = string.lower(ctx.fargs[1])
  local function reset_scrolloff()
    vim.opt_local.scrolloff = vim.opt_global.scrolloff:get()
  end
  local function set_scrolloff(scrolloff)
    vim.opt_local.scrolloff = large_scrolloff
  end
  if arg == "on" then
    set_scrolloff(large_scrolloff)
  elseif arg == "off" then
    reset_scrolloff()
  elseif arg == "toggle" then
    if vim.opt_local.scrolloff ~= vim.opt_global.scrolloff:get() then
      reset_scrolloff()
    else
      set_scrolloff(large_scrolloff)
    end
  end
end, {
  nargs = 1,
  complete = function()
    return { "On", "Off" }
  end,
  desc = "Always keep the cursor centered",
})

local attach_to_buffer = function(output_bufnr, pattern, command)
  autocmd("BufWritePost", {
    group = augroup("JP-commands", { clear = true }),
    pattern = pattern,
    callback = function()
      local append_data = function(_, data)
        if data then
          vim.api.nvim_buf_set_lines(output_bufnr, -1, -1, false, data)
        end
      end

      vim.api.nvim_buf_set_lines(
        output_bufnr,
        0,
        -1,
        false,
        { "AutoRun output (update by saving pattern-matched file):" }
      )

      vim.fn.jobstart(command, {
        stdout_buffered = true,
        on_stdout = append_data,
        on_stderr = append_data,
      })
    end,
  })
end

local attach_to_terminal_buffer = function(pattern, command)
  autocmd("BufWritePost", {
    group = augroup("JP-commands", { clear = true }),
    pattern = pattern,
    callback = function()
      for _, buf in ipairs(vim.api.nvim_list_bufs()) do
        if string.find(vim.api.nvim_buf_get_name(buf), "*AutoRunTerminal*") then
          vim.api.nvim_buf_delete(buf, { force = true })
        end
      end

      vim.cmd "below new"

      vim.api.nvim_win_set_height(0, 10)

      vim.api.nvim_command("terminal " .. command .. ";zsh")
      local bufnr = vim.api.nvim_get_current_buf()
      vim.api.nvim_buf_set_name(bufnr, "*AutoRunTerminal*")
    end,
  })
end

usercmd("AutoRun", function()
  local pattern = vim.fn.input "Pattern (to match file): "
  local command = vim.fn.input "Compile/Run command: "
  local split_command = vim.split(command, " ")
  local term = vim.fn.input "Execute in terminal buffer? (needed for user input) y (default no):"
  if term == "y" then
    attach_to_terminal_buffer(pattern, command)
  else
    vim.cmd "below new"

    vim.api.nvim_win_set_height(0, 10)

    vim.cmd "setlocal buftype=nofile"
    vim.cmd "setlocal bufhidden=hide"
    vim.cmd "setlocal noswapfile"
    local bufnr = vim.api.nvim_get_current_buf()

    vim.cmd "wincmd w"

    vim.api.nvim_buf_set_name(bufnr, "*AutoRun: " .. vim.inspect(command) .. "*")
    vim.api.nvim_buf_set_lines(
      bufnr,
      0,
      -1,
      false,
      { "  Save a file that matches " .. vim.inspect(pattern) .. " to see AutoRun output here." }
    )

    attach_to_buffer(bufnr, pattern, split_command)
  end
end, {})

usercmd("Format", function(args)
  if not pcall(require, "conform") then
    vim.notify("conform.nvim is not installed. Please install it to use this command.", vim.log.levels.WARN)
    return
  end
  local range = nil
  if args.count ~= -1 then
    local end_line = vim.api.nvim_buf_get_lines(0, args.line2 - 1, args.line2, true)[1]
    range = {
      start = { args.line1, 0 },
      ["end"] = { args.line2, end_line:len() },
    }
  end
  require("conform").format { async = true, lsp_fallback = true, range = range }
end, { range = true })

vim.api.nvim_create_user_command("FormatDisable", function(args)
  if args.bang then
    vim.b.disable_autoformat = true
  else
    vim.g.disable_autoformat = true
  end
end, {
  desc = "Disable autoformat-on-save",
  bang = true,
})
vim.api.nvim_create_user_command("FormatEnable", function()
  vim.b.disable_autoformat = false
  vim.g.disable_autoformat = false
end, {
  desc = "Re-enable autoformat-on-save",
})

usercmd("ToggleDistractions", function()
  local enableDistractions = function()
    vim.g.disable_autoformat = false
    vim.g.current_diagnostic_mode = 1
    SetDiagnosticsOptions()
    vim.g.disable_completion = false
    if pcall(require, "mini.notify") then
      vim.g.mininotify_disable = false
    end
  end

  local disableDistractions = function()
    vim.g.disable_autoformat = true
    vim.g.current_diagnostic_mode = 3
    SetDiagnosticsOptions()
    vim.g.disable_completion = true
    if pcall(require, "mini.notify") then
      vim.g.mininotify_disable = true
    end
  end

  if vim.g.disable_completion then
    enableDistractions()
  else
    disableDistractions()
  end
end, {
  desc = "Toggle (often useful) distractions (completion, diagnostics, autoformatting, notify popup)",
})

DEFAULT_DIAGNOSTIC_CONFIG = {
  virtual_text = true,
  warden = false,
  virtual_lines = false,
  underline = true,
  signs = false,
  severity_sort = true,
  float = {
    header = false,
    source = "always",
  },
}
local Mode = {
  "Default",
  "Lines",
  "None",
}

SetDiagnosticsOptions = function()
  if Mode[vim.g.current_diagnostic_mode] == "Default" then
    vim.diagnostic.config(DEFAULT_DIAGNOSTIC_CONFIG)
  elseif Mode[vim.g.current_diagnostic_mode] == "Lines" then
    vim.diagnostic.config {
      virtual_lines = true,
      virtual_text = false,
    }
  elseif Mode[vim.g.current_diagnostic_mode] == "None" then
    vim.diagnostic.config {
      signs = false,
      underline = false,
      line_highlight = false,
      virtual_lines = false,
      virtual_text = false,
      severity_sort = false,
    }
  end
end

SetDiagnosticsOptions()

vim.keymap.set("n", "<F12>", function()
  vim.g.current_diagnostic_mode = (vim.g.current_diagnostic_mode % #Mode) + 1
  SetDiagnosticsOptions()
end, { desc = "Toggle lsp_lines mode" })

local RemoveComments = function(opts)
  local ts = vim.treesitter
  local bufnr = vim.api.nvim_get_current_buf()
  local ft = vim.bo[bufnr].filetype
  local lang = ts.language.get_lang(ft) or ft

  local ok, parser = pcall(ts.get_parser, bufnr, lang)
  if not ok then
    return vim.notify("No Treesitter parser for " .. ft, vim.log.levels.WARN)
  end
  local start_row = opts.line1 - 1
  local end_row = opts.line2
  local tree = parser:parse()[1]
  local root = tree:root()
  local query = ts.query.parse(lang, "(comment) @comment")
  if not query then
    return vim.notify("Failed to parse Treesitter query for comments.", vim.log.levels.ERROR)
  end
  local ranges = {}
  for _, node in query:iter_captures(root, bufnr, start_row, end_row) do
    table.insert(ranges, { node:range() })
  end
  if #ranges == 0 then
    vim.notify("No comments found.", vim.log.levels.INFO)
    return
  end
  table.sort(ranges, function(a, b)
    if a[1] == b[1] then
      return a[2] > b[2]
    end
    return a[1] > b[1]
  end)
  vim.api.nvim_buf_call(bufnr, function()
    for _, r in ipairs(ranges) do
      vim.api.nvim_buf_set_text(bufnr, r[1], r[2], r[3], r[4], {})
    end
  end)
end
vim.api.nvim_create_user_command("RemoveComments", RemoveComments, {
  range = "%",
  desc = "Remove comment nodes within a range (default: whole file)",
})

vim.api.nvim_create_user_command("RemoveTrailing", function(args)
  local bufnr = 0
  local view = vim.fn.winsaveview()

  -- figure out target range
  local start_line, end_line
  if args.count ~= -1 then
    start_line = args.line1
    end_line = args.line2
  else
    start_line = 1
    end_line = vim.api.nvim_buf_line_count(bufnr)
  end

  -- remove trailing whitespace in range
  vim.api.nvim_buf_call(bufnr, function()
    vim.cmd(string.format("%d,%ds/\\s\\+$//e", start_line, end_line))
  end)

  -- with bang: also trim blank lines at end of file
  if args.bang then
    local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, true)
    local i = #lines
    while i > 1 and (lines[i] == "" or lines[i]:match "^%s*$") do
      i = i - 1
    end
    -- only update if there are trailing empties to drop
    if i < #lines then
      vim.api.nvim_buf_set_lines(bufnr, i, -1, true, {})
    end
  end

  vim.fn.winrestview(view)
end, {
  range = "%",
  bang = true,
  desc = "Remove trailing whitespace in range; use ! to also trim blank lines at EOF",
})
