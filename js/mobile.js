const fixed_grid = document.querySelector("#fixed-grid")
const logo = document.querySelector(".logo");
const search_bar = document.querySelector(".search-bar")
const selector = document.querySelector("#selector")

// if a touch device
function isTouchDevice() {
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}
// if device width < 700
function isSmallWidthDevice() {
    const win_width = window.innerWidth
    return win_width < 700
}

if (isSmallWidthDevice() || isTouchDevice()) {
    fixed_grid.className = "fixed-grid has-1-cols";

    logo.children[1].remove()
    logo.children[0].style.height = "90px"
    search_bar.style.width = "250px"
    selector.style.width = "55px"
}

