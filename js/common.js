import { gen } from "./helper.js"

export function HeaderGenerator() {
    const spacer = gen("div").attr("class", "spacer")
    const header = gen("header").attr("class", "header")
    const logo = gen("a").attr("class", "logo")
    const header_logo = gen("img")
        .attr("src", `./assets/logo${Math.floor(Math.random() * 11)}.png`)
    header_logo.id = "header-logo"
    const title = gen("span").attr("class", "title")
    title.innerText = "zen"

    logo.appendChild(header_logo)
    logo.appendChild(title)
    header.appendChild(logo)

    const search_bar = gen("div").attr("class", "search-bar")
    const inputForm = gen("form").attr("id", "inputFrom")
    inputForm.id = "inputForm"
    const input = gen("input").attr("class", "input is-rounded ml-5")
    input.id = "input"
    input.type = "text"
    input.placeholder = "Search 'cat videos' + Enter"

    inputForm.appendChild(input)
    search_bar.appendChild(inputForm)

    header.appendChild(search_bar)
    header.appendChild(spacer)

    document.body.prepend(header)

    // Home clicking the logo
    logo.addEventListener("click", event => {
        event.preventDefault();

        const url = new URL(window.location.href)
        console.log(url)
        url.searchParams.delete('q')
        history.pushState({}, '', url)
        input.value = ""
        window.location.href = '/'
    })

    // input field entry
    inputForm.addEventListener("submit", e => {
        e.preventDefault();

        if (input.value !== "") {
            const search = new URLSearchParams();
            const val = input.value
            search.set('q', val);

            window.location.href = `/?${search.toString()}`

            const event = new CustomEvent('SearchSubmit', { detail: val })
            document.dispatchEvent(event)
        }
    })
}
