---@diagnostic disable: missing-fields
Colorscheme = "kanagawa"

local function colorschemes()
  return {
    {
      "rebelot/kanagawa.nvim",
      name = "kanagawa",
      colorscheme = "kanagawa-wave",
      config = function()
        require "jp.colors.kanagawa"
      end,
    },
    {
      "projekt0n/github-nvim-theme",
      name = "github-theme",
      colorscheme = "github_dark",
      config = function()
        require "jp.colors.github-theme"
      end,
    },
    {
      "ellisonleao/gruvbox.nvim",
      name = "gruvbox",
      config = function()
        require "jp.colors.gruvbox"
      end,
    },
    {
      "savq/melange-nvim",
      name = "melange",
      colorscheme = "melange",
    },
    {
      "blazkowolf/gruber-darker.nvim",
      name = "gruber-darker",
      colorscheme = "gruber-darker",
    },
    {
      "bluz71/vim-moonfly-colors",
      name = "moonfly",
      colorscheme = "moonfly",
    },
    {
      "loctvl842/monokai-pro.nvim",
      name = "monokai-pro",
      colorscheme = "monokai-pro-octagon",
      config = function()
        require("monokai-pro").setup()
      end,
    },
    {
      "sainnhe/sonokai",
      name = "sonokai",
      config = function()
        require "jp.colors.sonokai"
      end,
    },
    {
      "https://git.sr.ht/~p00f/alabaster.nvim",
      name = "alabaster",
      config = function()
        vim.g.alabaster_floatborder = true
      end,
    },
    { "navarasu/onedark.nvim",          name = "onedark" },
    { "Mofiqul/vscode.nvim",            name = "vscode" },
    { "rockerBOO/boo-colorscheme-nvim", name = "boo-colorscheme", colorscheme = "radioactive_waste" },
    { "Shatur/neovim-ayu",              name = "neovim-ayu" },
    { "lifepillar/vim-solarized8",      name = "solarized8",      branch = "neovim" },
    { "dasupradyumna/midnight.nvim",    name = "midnight" },
    {
      "vague2k/vague.nvim",
      name = "vague",
      colorscheme = "vague",
      config = function()
        require("vague").setup { transparent = true }
      end,
    },
  }
end

local SetupSpec = function()
  if vim.g.jp_profile == "native" then
    return {}
  end

  LazySpec = {}
  for _, plugin in ipairs(colorschemes()) do -- Filter selected colors
    if vim.g.jp_profile == "minimal" then
      if plugin.name == "kanagawa" then
        plugin.lazy = false
        plugin.priority = 1000
        local original_config = plugin.config
        local colorscheme = (plugin.colorscheme or plugin.name)
        if type(original_config) == "function" then
          plugin.config = function()
            original_config()
            vim.cmd("colorscheme " .. colorscheme)
          end
        else
          plugin.config = function()
            vim.cmd("colorscheme " .. colorscheme)
          end
        end
        table.insert(LazySpec, plugin)
      end
    else
      if Colorscheme == plugin.name then
        plugin.lazy = false
        plugin.priority = 1000
        local original_config = plugin.config
        local colorscheme = (plugin.colorscheme or plugin.name)
        if type(original_config) == "function" then
          plugin.config = function()
            original_config()
            vim.cmd("colorscheme " .. colorscheme)
          end
        else
          plugin.config = function()
            vim.cmd("colorscheme " .. colorscheme)
          end
        end
      else
        plugin.event = "VeryLazy"
        plugin.priority = 20
      end
      table.insert(LazySpec, plugin)
    end
  end
  return LazySpec
end

return SetupSpec()
