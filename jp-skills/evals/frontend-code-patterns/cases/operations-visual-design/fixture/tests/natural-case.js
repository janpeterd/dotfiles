(() => {
  const hasLetter = (value) =>
    Array.from(value).some((character) => character.toLowerCase() !== character.toUpperCase())

  const visibleLeaves = Array.from(document.body.querySelectorAll("*"))
    .filter((element) => element.children.length === 0)
    .filter((element) => {
      const style = getComputedStyle(element)
      return style.display !== "none" && style.visibility !== "hidden"
    })

  return visibleLeaves.every((element) => {
    const value = element.textContent?.trim() ?? ""
    if (!hasLetter(value)) {
      return true
    }
    const style = getComputedStyle(element)
    return style.textTransform !== "uppercase" && value !== value.toUpperCase()
  })
})()
