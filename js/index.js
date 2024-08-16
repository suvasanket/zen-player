import { grid_loader } from "./thumbnails.js"
import {
    gen,
    piped_api,
    getTheme,
    modal_detector_loader,
    notification_detector_loader,
} from "./helper.js"

let NextPageUrl = "";
let totalNumberOfVideos = []

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

// Home clicking the logo
document.querySelector(".logo").addEventListener("click", event => {
    event.preventDefault();

    const copy_url = new URL(window.location.href)
    copy_url.searchParams.delete('q')
    history.pushState({}, '', copy_url)
    inputField.value = ""
    piped_fetch(null)
    window.location.reload()
})

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

        totalNumberOfVideos = []
    } else {
        columns.innerHTML = ""
        newURL.searchParams.delete('q');
        history.pushState({}, '', newURL)
        piped_fetch(null)
    }
})

function spiner_start() {
    if (!document.getElementById("spiner")) {
        const spiner_fg = getTheme() === "dark" ? "white" : "black"
        const spin_container = gen("div")
            .attr("class", "container is-flex is-justify-content-center is-align-items-center")
            .attr("id", "spiner")
            .attr("style", "height: 200px;")
        const spin_button = gen("button")
            .attr("class", "button is-large is-loading ")
            .attr("style", `border: none; background: transparent; box-shadow: none; color: ${spiner_fg}`)
        spin_container.appendChild(spin_button)
        container.prepend(spin_container)
    }
}
function spiner_stop() {
    if (document.getElementById("spiner")) {
        document.querySelector("#spiner").remove()
    }
}

async function piped_fetch(query, nextPageUrl, filter = "videos") {
    let url = query == null ? `${piped_api}trending?region=IN` : `${piped_api}search?q=${query}&filter=${filter}`

    if (nextPageUrl !== undefined) {
        url = `${piped_api}nextpage/search?q=${query}&filter=videos&nextpage=${encodeURIComponent(nextPageUrl)}`;
    }
    else {
        spiner_start()
    }
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (document.querySelector("#spiner")) spiner_stop()
        //console.log(data)

        if (data.items) {
            data.items.forEach((e, index) => grid_loader(e, index))
        } else if (data.error) {
            console.error(data.error);
            const notify = document.createElement("p")
            notify.innerHTML = data.message
            container.appendChild(notify)
            return;
        } else {
            data.forEach((e, index) => grid_loader(e, index))
        }

        // Got the next page URL
        NextPageUrl = data.nextpage;
        if (NextPageUrl) {
            // if less than 20 results then do a nextpage reload
            const total = totalNumberOfVideos.reduce((prev, cur) => prev + cur, 0)
            if (total < 30) {
                piped_fetch(query, NextPageUrl)
                const len = data.items.length || data.length
                totalNumberOfVideos.push(len)
            }
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
        modal_detector_loader()
    } catch (err) {
        console.log(err);
    }
}

// load some loader
document.addEventListener('DOMContentLoaded', () => {
    modal_detector_loader()
    notification_detector_loader()
})
