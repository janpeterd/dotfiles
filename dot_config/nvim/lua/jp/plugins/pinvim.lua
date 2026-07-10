return {
  {
    url = "git@github.com:janpeterd/pinvim.git",
    name = "pinvim",
    lazy = false,
    config = function()
      require("pi-nvim").setup()
    end,
  },
}
