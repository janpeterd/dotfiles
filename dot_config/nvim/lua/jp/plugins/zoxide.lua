return {
  {
    "nanotee/zoxide.vim",
    lazy = true,
    cmd = { "Z", "Zi" },
    dependencies = {
      {
        "junegunn/fzf",
        build = ":call fzf#install()",
        lazy = true,
        cmd = { "Z", "Zi" },
      },
      {
        "junegunn/fzf.vim",
        lazy = true,
        cmd = { "Z", "Zi" },
      },
    },
  },
}
