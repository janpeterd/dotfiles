local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd
local usercmd = vim.api.nvim_create_user_command

-- Display output of command in buffer
usercmd("Redir", function(ctx)
  local lines = vim.split(vim.api.nvim_exec2(ctx.args, { output = true })["output"], "\n", { plain = true })
  vim.cmd "new"
  vim.api.nvim_buf_set_lines(0, 0, -1, false, lines)
  vim.opt_local.modified = false
end, { nargs = "+", complete = "command" })

-- Center the cursor, handy for reading text or writing non code
usercmd("CenterCursor", function(ctx)
  -- check argument
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
  -- Now create an autocommand, on event: BufWritePost (after writing file to disk)
  autocmd("BufWritePost", {
    group = augroup("JP-commands", { clear = true }),
    pattern = pattern,
    --     -- this function will be called when the event happens
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
      -- As an example I am running the ls command, In practice you would want to use this to for example compile code, or lint it or do something useful.
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
      -- Create new window and buffer below
      vim.cmd "below new"
      -- Set height of new window
      vim.api.nvim_win_set_height(0, 10)
      -- Run command and start shell session after (otherwise it exits)
      vim.api.nvim_command("terminal " .. command .. ";zsh")
      local bufnr = vim.api.nvim_get_current_buf()
      vim.api.nvim_buf_set_name(bufnr, "*AutoRunTerminal*")
    end,
  })
end

-- Compile on save
usercmd("AutoRun", function()
  -- Prompt for information
  local pattern = vim.fn.input "Pattern (to match file): "
  local command = vim.fn.input "Compile/Run command: "
  local split_command = vim.split(command, " ")
  local term = vim.fn.input "Execute in terminal buffer? (needed for user input) y (default no):"
  if term == "y" then
    attach_to_terminal_buffer(pattern, command)
  else
    -- Create new window and buffer below
    vim.cmd "below new"
    -- Set height of new window
    vim.api.nvim_win_set_height(0, 10)
    -- Make it a scratch buffer
    vim.cmd "setlocal buftype=nofile"
    vim.cmd "setlocal bufhidden=hide"
    vim.cmd "setlocal noswapfile"
    local bufnr = vim.api.nvim_get_current_buf()
    -- Set focus back on original window
    vim.cmd "wincmd w"
    -- Set name of autorun buffer
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

-- Enable copilot on command
-- usercmd('CopilotEnable',
--     function()
--         require("copilot").setup({
--             suggestions = { enabled = false },
--             panel = { enabled = false },
--         })
--         require('copilot_cmp').setup()
--     end, {}
--
-- )

usercmd("TelescopeLocate", function()
  local pickers = require "telescope.pickers"
  local finders = require "telescope.finders"
  local conf = require("telescope.config").values
  local locate = function(input, opts)
    opts = opts or {}
    pickers
        .new(opts, {
          prompt_title = "Locate a file",
          finder = finders.new_oneshot_job({ "locate", input }, opts),
          sorter = conf.generic_sorter(opts),
        })
        :find()
  end
  local input = vim.fn.input "Locate a file: "
  locate(input)
end, {})

usercmd("Format", function(args)
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
    -- FormatDisable! will disable formatting just for this buffer
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
    vim.g.disable_autoformat = false  -- enable autoformat
    vim.g.current_diagnostic_mode = 1 -- enable diagnostic highlights
    SetDiagnosticsOptions()
    vim.g.disable_completion = false  -- enable completion
    vim.g.mininotify_disable = false  -- enable notification popups
  end

  local disableDistractions = function()
    vim.g.disable_autoformat = true   -- disable autoformat
    vim.g.current_diagnostic_mode = 3 -- disable diagnostic highlights
    SetDiagnosticsOptions()
    vim.g.disable_completion = true   -- disable completion
    vim.g.mininotify_disable = true   -- disable notification popups
  end

  -- check completion to as reference
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
