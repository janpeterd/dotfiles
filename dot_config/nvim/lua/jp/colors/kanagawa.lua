require("kanagawa").setup {
  compile = true,   -- enable compiling the colorscheme
  undercurl = true, -- enable undercurls
  commentStyle = { fg = "#8b8f8b", italic = false },
  functionStyle = { bold = true },
  keywordStyle = { fg = "#7d8eb0" },
  statementStyle = {},
  typeStyle = {},
  transparent = false,   -- do not set background color
  dimInactive = false,   -- dim inactive window `:h hl-NormalNC`
  terminalColors = true, -- define vim.g.terminal_color_{0,17}
  colors = {
    palette = {
      dragonRed = "#eb584d",
      dragonYellow = "#e6ba5a",
      dragonGreen2 = "#a6c985",
      dragonGray2 = "#b0aca0",
    },
    theme = {
      -- change specific usages for a certain theme, or for all of them
      dragon = {
        syn = {},
      },
      all = {
        ui = {
          bg_gutter = "none",
        },
      },
    },
  },
  overrides = function(colors) -- add/modify highlights
    local palette = colors.palette
    return {
      Special = { fg = "#6ab2de" },
      Comment = { fg = "#8b8f8b" },

      FloatBorder = { bg = "none" },
      NormalFloat = { bg = "none" },
      FloatTitle = { bg = "none" },

      TabLineSel = { bg = palette.dragonBlue, fg = palette.dragonBlack2, bold = true },

      -- express line
      ELNormal = { bg = palette.dragonBlack0, fg = palette.dragonRed, bold = true },
      ElInsert = { bg = palette.dragonBlack0, fg = palette.dragonGreen2, bold = true },
      ElReplace = { bg = palette.dragonBlack0, fg = palette.dragonYellow, bold = true },
      ElVisual = { bg = palette.dragonBlack0, fg = palette.dragonViolet, bold = true },
      ElVisualLine = { bg = palette.dragonBlack0, fg = palette.dragonTeal, bold = true },
      ElVisualBlock = { bg = palette.dragonBlack0, fg = palette.dragonOrange2, bold = true },
      ElCommand = { bg = palette.dragonBlack0, fg = palette.Pink, bold = true },
      ElTerm = { bg = palette.dragonBlack0, fg = palette.lightBlue, bold = true },

      -- mini status line
      MiniStatuslineModeNormal = { bg = palette.dragonBlue, fg = palette.dragonBlack2, bold = true, standout = true },
      MiniStatuslineModeInsert = { bg = palette.dragonYellow, fg = palette.dragonBlack2, bold = true, standout = true },
      MiniStatuslineModeReplace = { bg = palette.dragonRed, fg = palette.dragonBlack2, bold = true, standout = true },
      MiniStatuslineModeVisual = { bg = palette.dragonViolet, fg = palette.dragonBlack2, bold = true, standout = true },
      MiniStatuslineModeCommand = { bg = palette.dragonGreen, fg = palette.dragonBlack2, bold = true, standout = true },
      MiniStatuslineModeOther = { bg = palette.lotusGreen, fg = palette.dragonBlack2, bold = true, standout = true },

      -- mini starter
      MiniStarterHeader = { fg = palette.dragonGreen, bold = true, italic = true },
      MiniStarterFooter = { fg = "#8b8f8b", italic = true, bold = true },

      -- mini notify
      MiniNotifyNormal = { bg = palette.dragonBlack4 },
      MiniNotifyBorder = { bg = palette.dragonBlack4, fg = palette.dragonBlue },
    }
  end,
  theme = "dragon", -- Load "wave" theme when 'background' option is not set
}

-- load the colorscheme
-- vim.cmd "colorscheme kanagawa-dragon"

-- All colors
-- autumnGreen   = "#76946A",
-- autumnRed     = "#C34043",
-- autumnYellow  = "#DCA561",
-- boatYellow1   = "#938056",
-- boatYellow2   = "#C0A36E",
-- carpYellow    = "#E6C384",
-- crystalBlue   = "#7E9CD8",
-- dragonAqua    = "#8ea4a2",
-- dragonAsh     = "#737c73",
-- dragonBlack0  = "#0d0c0c",
-- dragonBlack1  = "#12120f",
-- dragonBlack2  = "#1D1C19",
-- dragonBlack3  = "#181616",
-- dragonBlack4  = "#282727",
-- dragonBlack5  = "#393836",
-- dragonBlack6  = "#625e5a",
-- dragonBlue    = "#658594",
-- dragonBlue2   = "#8ba4b0",
-- dragonGray    = "#a6a69c",
-- dragonGray2   = "#b0aca0",
-- dragonGray3   = "#7a8382",
-- dragonGreen   = "#87a987",
-- dragonGreen2  = "#a6c985",
-- dragonOrange  = "#b6927b",
-- dragonOrange2 = "#b98d7b",
-- dragonPink    = "#a292a3",
-- dragonRed     = "#eb584d",
-- dragonTeal    = "#949fb5",
-- dragonViolet  = "#8992a7",
-- dragonWhite   = "#c5c9c5",
-- dragonYellow  = "#e6ba5a",
-- fujiGray      = "#727169",
-- fujiWhite     = "#DCD7BA",
-- katanaGray    = "#717C7C",
-- lightBlue     = "#A3D4D5",
-- lotusAqua     = "#597b75",
-- lotusAqua2    = "#5e857a",
-- lotusBlue1    = "#c7d7e0",
-- lotusBlue2    = "#b5cbd2",
-- lotusBlue3    = "#9fb5c9",
-- lotusBlue4    = "#4d699b",
-- lotusBlue5    = "#5d57a3",
-- lotusCyan     = "#d7e3d8",
-- lotusGray     = "#dcd7ba",
-- lotusGray2    = "#716e61",
-- lotusGray3    = "#8a8980",
-- lotusGreen    = "#6f894e",
-- lotusGreen2   = "#6e915f",
-- lotusGreen3   = "#b7d0ae",
-- lotusInk1     = "#545464",
-- lotusInk2     = "#43436c",
-- lotusOrange   = "#cc6d00",
-- lotusOrange2  = "#e98a00",
-- lotusPink     = "#b35b79",
-- lotusRed      = "#c84053",
-- lotusRed2     = "#d7474b",
-- lotusRed3     = "#e82424",
-- lotusRed4     = "#d9a594",
-- lotusTeal1    = "#4e8ca2",
-- lotusTeal2    = "#6693bf",
-- lotusTeal3    = "#5a7785",
-- lotusViolet1  = "#a09cac",
-- lotusViolet2  = "#766b90",
-- lotusViolet3  = "#c9cbd1",
-- lotusViolet4  = "#624c83",
-- lotusWhite0   = "#d5cea3",
-- lotusWhite1   = "#dcd5ac",
-- lotusWhite2   = "#e5ddb0",
-- lotusWhite3   = "#f2ecbc",
-- lotusWhite4   = "#e7dba0",
-- lotusWhite5   = "#e4d794",
-- lotusYellow   = "#77713f",
-- lotusYellow2  = "#836f4a",
-- lotusYellow3  = "#de9800",
-- lotusYellow4  = "#f9d791",
-- oldWhite      = "#C8C093",
-- oniViolet     = "#957FB8",
-- oniViolet2    = "#b8b4d0",
-- peachRed      = "#FF5D62",
-- roninYellow   = "#FF9E3B",
-- sakuraPink    = "#D27E99",
-- samuraiRed    = "#E82424",
-- springBlue    = "#7FB4CA",
-- springGreen   = "#98BB6C",
-- springViolet1 = "#938AA9",
-- springViolet2 = "#9CABCA",
-- sumiInk0      = "#16161D",
-- sumiInk1      = "#181820",
-- sumiInk2      = "#1a1a22",
-- sumiInk3      = "#1F1F28",
-- sumiInk4      = "#2A2A37",
-- sumiInk5      = "#363646",
-- sumiInk6      = "#54546D",
-- surimiOrange  = "#FFA066",
-- waveAqua1     = "#6A9589",
-- waveAqua2     = "#7AA89F",
-- waveBlue1     = "#223249",
-- waveBlue2     = "#2D4F67",
-- waveRed       = "#E46876",
-- winterBlue    = "#252535",
-- winterGreen   = "#2B3328",
-- winterRed     = "#43242B",
-- winterYellow  = "#49443C"
