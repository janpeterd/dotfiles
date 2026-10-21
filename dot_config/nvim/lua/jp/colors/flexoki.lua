local palette = require("flexoki.palette").palette()
local blend = require("flexoki.util").blend

-- Diff viewers preserve syntax colors, so keep their backgrounds muted.
local add = blend(palette.gr, palette.bg, 0.18)
local add_highlight = blend(palette.gr, palette.bg, 0.28)
local add_inline = blend(palette.gr, palette.bg, 0.4)
local delete = blend(palette.re, palette.bg, 0.18)
local delete_highlight = blend(palette.re, palette.bg, 0.28)
local delete_inline = blend(palette.re, palette.bg, 0.4)

require("flexoki").setup {
  highlight_groups = {
    -- CodeDiff derives its line and character backgrounds from these groups.
    DiffAdd = { fg = palette.tx, bg = add },
    DiffDelete = { fg = palette.tx, bg = delete },

    NeogitDiffAdd = { fg = palette.tx, bg = add },
    NeogitDiffAddHighlight = { fg = palette.tx, bg = add_highlight },
    NeogitDiffAddCursor = { fg = palette.tx, bg = add_highlight },
    NeogitDiffAddInline = { fg = palette.tx, bg = add_inline, bold = true },
    NeogitDiffDelete = { fg = palette.tx, bg = delete },
    NeogitDiffDeleteHighlight = { fg = palette.tx, bg = delete_highlight },
    NeogitDiffDeleteCursor = { fg = palette.tx, bg = delete_highlight },
    NeogitDiffDeleteInline = { fg = palette.tx, bg = delete_inline, bold = true },

    NeogitDiffContext = { bg = palette.bg },
    NeogitDiffContextHighlight = { bg = palette["bg-2"] },
    NeogitDiffContextCursor = { bg = palette["bg-2"] },
    NeogitHunkHeader = { fg = palette.tx, bg = palette.ui, bold = true },
    NeogitHunkHeaderHighlight = { fg = palette.tx, bg = palette["ui-2"], bold = true },
    NeogitHunkHeaderCursor = { fg = palette.tx, bg = palette["ui-2"], bold = true },
  },
}
