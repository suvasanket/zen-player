import { grid_loader } from "./script.js"

let NextPageUrl = "";
const base_url = 'https://pipedapi.kavin.rocks/'

const columns = document.querySelector("#columns");
const container = document.querySelector("#container");
const inputField = document.querySelector("#input")
const inputForm = document.querySelector("#inputForm")
const selectField = document.querySelector("#select")
let isAtBottom = false;

// Get the query parameter
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");
if (query) {
    inputField.value = query
}

//initial page load
piped_fetch(query)

// input field entry
inputForm.addEventListener("submit", e => {
    const newURL = new URL(window.location.href);
    e.preventDefault();

    if (inputField.value !== "") {
        const val = inputField.value
        const sel = selectField.value
        columns.innerHTML = ""
        piped_fetch(val, undefined, sel)

        newURL.searchParams.set('q', val);
        history.pushState({}, '', newURL)
    } else {
        columns.innerHTML = ""
        newURL.searchParams.delete('q');
        history.pushState({}, '', newURL)
        piped_fetch(null)
    }
})

async function piped_fetch(query, nextPageUrl, filter = "videos") {
    let url = query == null ? `${base_url}trending?region=IN` : `${base_url}search?q=${query}&filter=${filter}`

    if (nextPageUrl !== undefined) {
        url = `${base_url}nextpage/search?q=${query}&filter=videos&nextpage=${encodeURIComponent(nextPageUrl)}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        //console.log(data)

        if (data.items) {
            data.items.forEach(e => grid_loader(e))
        } else if (data.error) {
            console.error(data.error.message);
            const notify = document.createElement("p")
            notify.innerHTML = data.error.message
            container.appendChild(notify)
            return;
        } else {
            data.forEach(e => grid_loader(e))
        }

        // auto next page loader
        NextPageUrl = data.nextpage;
        if (NextPageUrl) {
            window.addEventListener('scroll', function() {
                const scrollPosition = window.innerHeight + window.scrollY;
                const bodyHeight = document.body.offsetHeight;

                if (scrollPosition >= bodyHeight - 5 && !isAtBottom) {
                    isAtBottom = true;
                    piped_fetch(query, NextPageUrl);
                } else if (scrollPosition < bodyHeight - 5) {
                    isAtBottom = false;
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
}
