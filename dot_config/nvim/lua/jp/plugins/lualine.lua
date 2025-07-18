return {
  "nvim-lualine/lualine.nvim",
  event = "VeryLazy",
  opts = function()
    -- Change the background of lualine_c section for normal mode
    return {
      options = {
        component_separators = { left = " ", right = " " },
        section_separators = { left = " ", right = " " },
        theme = "auto",
        -- theme = custom_vivendi,
        globalstatus = true,
        disabled_filetypes = { statusline = { "dashboard", "alpha" } },
      },
      sections = {
        lualine_a = {
          {
            "mode",
            color = {
              color = "blend",
              gui = "bold",
            },
          },
        },
        lualine_b = {
          {
            "branch",
            icon = "",
            -- color = "blend",
            -- color = {
            --   bg = "black",
            -- },
          },
          {
            "diagnostics",
            symbols = {
              error = " ",
              warn = " ",
              info = " ",
              hint = " ",
            },
            -- color = "blend",
            -- color = {
            --   bg = "black",
            -- },
          },
        },
        lualine_c = {
          {
            "filetype",
            icon_only = true,
            separator = "",
            padding = { left = 4, right = 0 },
            -- color = 'blend',
            -- color = {
            --   bg = "black",
            -- },
          },
          {
            "filename",
            file_status = true,     -- Displays file status (readonly status, modified status)
            newfile_status = false, -- Display new file status (new file means no write after created)
            path = 1,               -- 0: Just the filename
            -- 1: Relative path
            -- 2: Absolute path
            -- 3: Absolute path, with tilde as the home directory
            -- 4: Filename and parent dir, with tilde as the home directory

            shorting_target = 0, -- Shortens path to leave 40 spaces in the window for other components. (terrible name, any suggestions?)
            -- color = 'blend',

            symbols = {
              modified = "[+]",      -- Text to show when the file is modified.
              readonly = "[-]",      -- Text to show when the file is non-modifiable or readonly.
              unnamed = "[No Name]", -- Text to show for unnamed buffers.
              newfile = "[New]",     -- Text to show for newly created file before first write
            },
          },
        },
        lualine_x = {
          { "lsp_status" },
          {
            require("lazy.status").updates,
            cond = require("lazy.status").has_updates,
          },
          {
            "diff",
          },
        },
        lualine_y = {
          {
            "encoding",
            cond = function()
              return vim.opt.columns:get() > 80
            end,
          },
          {
            "location",
            padding = { left = 1, right = 0 },
            -- color = "blend",
            -- color = {
            --   bg = "black",
            -- },
          },
        },
        lualine_z = {
          {
            "progress",
            -- color = "blend",
            -- color = {
            --   bg = "black",
            -- },
          },
        },
      },

      extensions = {
        "lazy",
        "man",
        "mason",
        "nvim-dap-ui",
        "oil",
        "overseer",
        "quickfix",
        "trouble",
      },
    }
  end,
}
