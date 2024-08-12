export const yt_domain = "https://www.youtube.com"
export const piped_domain = 'https://piped.video'

export const cobalt_api = "https://api.cobalt.tools/api/json"
export const piped_api = 'https://pipedapi.kavin.rocks/'

export function getTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light'
    }
    else {
        return 'dark'
    }
}
export function gen(tag) {
    let element = document.createElement(tag)
    element.attr = function(attr, val) {
        this.setAttribute(attr, val)
        return this
    }
    element.inner = function(val) {
        this.innerHTML = val
        return this
    }
    return element
}
