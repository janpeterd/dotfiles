return {
  {
    "nvim-neorg/neorg",
    lazy = false,
    version = "*",
    config = function()
      require("neorg").setup {
        load = {
          ["core.defaults"] = {},
          ["core.concealer"] = {},
          ["core.dirman"] = {
            config = {
              workspaces = {
                notes = "~/Sync/Notes",
              },
              default_workspace = "notes",
            },
          },
          ["core.presenter"] = {
            config = {
              zen_mode = "zen-mode",
              zen_mode_options = {
                folds = "all",
                options = {
                  conceallevel = 2,
                  foldlevel = 99,
                },
              },
            },
          },
          ["core.export"] = {},
          ["core.summary"] = {},
          ["core.text-objects"] = {},
          ["core.qol.todo_items"] = {},
        },
      }

      vim.wo.foldlevel = 99
      vim.wo.conceallevel = 2
    end,
  },
}
