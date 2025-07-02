return {
  -- tpope plugins
  -- Readline movement for insert and command mode
  { "tpope/vim-rsi", lazy = false },

  -- Add common unix commands to vim and improve them (ex. delete buffers on delete file, etc.)
  {
    "tpope/vim-eunuch",
    cmd = {
      "Copy",
      "Move",
      "Wall",
      "Cfind",
      "Chmod",
      "Lfind",
      "Mkdir",
      "Delete",
      "Remove",
      "Rename",
      "Unlink",
      "Clocate",
      "Llocate",
      "SudoEdit",
      "Duplicate",
      "SudoWrite",
    },
  },

  -- Repeat plugin actions
  { "tpope/vim-repeat" },

  { "tpope/vim-unimpaired", lazy = true, event = "VeryLazy" },

  -- Provides :S command for case aware substitution and Abbreviations
  {
    "tpope/vim-abolish",
    lazy = true,
    cmd = { "S", "Subvert", "Abolish" },
    -- I like the preview the normal substitution command gives, me but I often use the :S command, because it preserves the capitalization, This keybind changes the :s to :S
    keys = {
      {
        "<C-s>",
        "<End><C-f>0fs~<End><C-c>",
        mode = "c",
        desc = "Change regular substitution for case case aware one (using Subvert command)",
      },
    },
  },
}
