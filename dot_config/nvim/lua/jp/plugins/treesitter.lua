return {
	{
		"nvim-treesitter/nvim-treesitter",
		build = ":TSUpdate",
		priority = 100,
		branch = "main",
		dependencies = {
			-- NOTE: using mini.ai for the same purpose
			{
				"nvim-treesitter/nvim-treesitter-textobjects",
				dependencies = { "nvim-treesitter/nvim-treesitter" },
				branch = "main",
				lazy = true,
				event = { "BufReadPre", "BufNewFile" },
				config = function()
					require("nvim-treesitter-textobjects").setup({
						select = {
							enable = true,
							lookahead = true,
						},
					})
					local select = require "nvim-treesitter-textobjects.select".select_textobject
					vim.keymap.set({ "x", "o" }, "af", function()
						select("@function.outer", "textobjects")
					end, { desc = "[A]fter [F]unction" })
					vim.keymap.set({ "x", "o" }, "if", function()
						select("@function.inner", "textobjects")
					end, { desc = "[I]n [F]unction" })
					vim.keymap.set({ "x", "o" }, "ac", function()
						select("@class.outer", "textobjects")
					end, { desc = "[A]fter [C]lass" })
					vim.keymap.set({ "x", "o" }, "ic", function()
						select("@class.inner", "textobjects")
					end, { desc = "[I]n [C]lass" })
					vim.keymap.set({ "x", "o" }, "as", function()
						select("@local.scope", "locals")
					end, { desc = "[A]fter [S]cope" })
				end
			},
			{
				"JoosepAlviste/nvim-ts-context-commentstring",
				lazy = true,
				dependencies = { "nvim-treesitter/nvim-treesitter" },
				event = "VeryLazy",
			},
		},
	},
	{
		"MeanderingProgrammer/treesitter-modules.nvim",
		config = function()
			require("treesitter-modules").setup {
				ensure_installed = {
					"c",
					"cpp",
					"css",
					"go",
					"html",
					"http",
					"java",
					"javascript",
					"jsdoc",
					"lua",
					"markdown",
					"markdown_inline",
					"php",
					"python",
					"query",
					"ruby",
					"rust",
					"scss",
					"sql",
					"toml",
					"tsx",
					"typescript",
					"vim",
					"vimdoc",
					"yaml",
				},
				sync_install = false,
				auto_install = true,
				highlight = {
					enable = true,
					additional_vim_regex_highlighting = { "org" },
				},

				indent = { enable = true },
				context = { enable = true },
				context_commentstring = { enabled = false },
				autotag = { enable = true },
			}
		end
	}
}
