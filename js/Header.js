import { getUrl } from "./helper.js"

const finder = (q) => document.querySelector(q)

function randomLogo() {
    let randomIndex = Math.floor(Math.random() * 11)
    randomIndex++

    const header_logo = finder("#header-logo")
    header_logo.src = `./assets/logo${randomIndex}.webp`
    header_logo.loading = 'lazy'
    header_logo.onload = () => {
        const preloadImage = new Image()
        preloadImage.src = header_logo.src
    }
}

function HeaderGenerator() {
    randomLogo()

    // home
    finder(".logo").addEventListener("click", event => {
        event.preventDefault();

        const url = new URL(window.location.href)
        console.log(url)
        url.searchParams.delete('q')
        history.pushState({}, '', url)
        input.value = ""
        window.location.href = getUrl('/')
    })

    // input field entry
    finder("#inputForm").addEventListener("submit", e => {
        e.preventDefault();

        if (input.value !== "") {
            const search = new URLSearchParams();
            const val = input.value
            search.set('q', val);

            window.location.href = getUrl(`/?${search.toString()}`)

            const event = new CustomEvent('SearchSubmit', { detail: val })
            document.dispatchEvent(event)
        }
    })
}
HeaderGenerator()
