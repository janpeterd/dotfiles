local Job = require "plenary.job"

local function get_os_command_output(cmd, cwd)
  if type(cmd) ~= "table" then return {} end
  local command = table.remove(cmd, 1)
  local stderr = {}
  local stdout, ret = Job:new({
    command = command,
    args = cmd,
    cwd = cwd,
    on_stderr = function(_, data) table.insert(stderr, data) end,
  }):sync()
  return stdout, ret, stderr
end

return {
  {
    "ThePrimeagen/harpoon",
    lazy = true,
    event = "VeryLazy",
    branch = "harpoon2",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local set = vim.keymap.set
      local harpoon = require "harpoon"
      harpoon:setup({
        settings = {
          key = function()
            local branch = get_os_command_output({
              "git",
              "rev-parse",
              "--abbrev-ref",
              "HEAD",
            })[1]

            if branch then
              return vim.loop.cwd() .. "-" .. branch
            else
              return vim.loop.cwd()
            end
          end,
        }
      })

      -- @stylua: ignore
      set("n", "<leader>a", function()
        harpoon:list():add()
      end, { desc = "[A]dd file to harpoon" })
      set("n", "<leader>H", function()
        harpoon.ui:toggle_quick_menu(harpoon:list())
      end, { desc = "Harpoon" })
      set("n", "<M-1>", function()
        harpoon:list():select(1)
      end)
      set("n", "<M-2>", function()
        harpoon:list():select(2)
      end)
      set("n", "<M-3>", function()
        harpoon:list():select(3)
      end)
      set("n", "<M-4>", function()
        harpoon:list():select(4)
      end)
      set("n", "<M-5>", function()
        harpoon:list():select(5)
      end)
      set("n", "<M-6>", function()
        harpoon:list():select(6)
      end)

      -- Toggle previous & next buffers stored within Harpoon list
      set("n", "<C-S-P>", function()
        harpoon:list():prev()
      end)
      set("n", "<C-S-N>", function()
        harpoon:list():next()
      end)
    end,
  },
}
