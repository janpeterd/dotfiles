---@diagnostic disable: missing-fields
-- Plugin: orgmode
require("orgmode").setup {
  org_agenda_files = { "~/Sync/org/**/*" },
  org_default_notes_file = "~/Sync/org/todo.org",
  org_archive_location = { "~/Sync/org/archive/%s_archive::" },
  org_startup_folded = "content",
  org_startup_indented = true,
  -- emacs_config = { executable_path = 'emacs', config_path = '$HOME/.config/doom/config.el' },
  -- org_capture_templates = {
  --     t = 'Tasks',
  --     tt = {
  --         description = 'Regular TODO',
  --         template = "* TODO %?\n %u",
  --         target = '~/Documents/doom/Notes/refile.org',
  --     },
  --     tp = {
  --         description = 'Planned TODO (with deadline)',
  --         -- template = "* TODO %?\n %u",
  --         template = "* TODO %<%Y-%m-%d>\nSCHEDULED: %t\n:LOGBOOK:\nCLOCK: %U\n:END:",
  --         target = '~/Documents/doom/Notes/refile.org',
  --     },
  --     n = {
  --         description = 'Note',
  --         template = '\n*** %<%Y-%m-%d> %<%A>\n**** %U\n\n%?',
  --         target = '~/Documents/doom/Notes/refile.org',
  --     },
  --     j = {
  --         description = 'Journal',
  --         template = '\n*** %<%Y-%m-%d> %<%A>\n**** %U\n\n%?',
  --         target = '~/Documents/doom/Notes/journal.org',
  --     },
  --     d = {
  --         description = 'Development',
  --         template = "* TODO %?\n %u",
  --         target = '~/Documents/doom/Notes/journal.org',
  --         headline = 'Development',
  --     },
  -- },
  org_agenda_skip_scheduled_if_done = nil,
  win_split_mode = "auto",
  org_todo_keywords = {
    "TODO(t)",
    "[ ](T)",
    "PROJ(p)",
    "APPOINTMENT(a)",
    "WAIT(w)",
    "SCHOOL(s)",
    "EXAM(e)",
    "HABIT(h)",
    "HEALTH(H)",
    "REMINDER(r)",
    "GROW(g)",
    "GOAL(G)",
    "|",
    "DONE(d)",
    "CANCELLED(c)",
  },
  notifications = {
    enabled = false,
    cron_enabled = true,
    repeater_reminder_time = false,
    deadline_warning_reminder_time = 0,
    reminder_time = 10,
    deadline_reminder = true,
    scheduled_reminder = true,
  },
  org_log_into_drawer = "LOGBOOK",
  win_border = "rounded",
  org_todo_keyword_faces = {
    SCHOOL = ':foreground "#A020F0" :weight bold',
    EXAM = ':foreground "#FF0000" :weight bold',
    GROW = ':foreground "#16820D" :weight bold',
    HEALTH = ':foreground "#0088EB" :weight bold',
    GOAL = ':foreground "#EB8D00" :weight bold',
    HABIT = ':foreground "##16820D" :weight bold',
  },
  org_custom_exports = {
    P = {
      label = "Export to PDF format using eisvogel template",
      action = function(exporter)
        local current_file = vim.api.nvim_buf_get_name(0)
        local target = vim.fn.fnamemodify(current_file, ":p:r") .. ".pdf"
        local command = { "pandoc", current_file, "-o", target, "--template", "eisvogel.latex" }
        local on_success = function(output)
          print "Success!"
          vim.api.nvim_echo({ { table.concat(output, "\n") } }, true, {})
        end
        local on_error = function(err)
          print "Error!"
          vim.api.nvim_echo({ { table.concat(err, "\n"), "ErrorMsg" } }, true, {})
        end
        return exporter(command, target, on_success, on_error)
      end,
    },
  },
}
