import { grid_loader, gen } from "./thumbnails.js"

let NextPageUrl = "";
const api_base = 'https://pipedapi.kavin.rocks/'

const columns = document.querySelector("#columns");
const container = document.querySelector("#container");
const inputField = document.querySelector("#input")
const inputForm = document.querySelector("#inputForm")
const selectField = document.querySelector("#select")
let isAtBottom = false;
const fixed_grid = document.querySelector("#fixed-grid")

// Get the query parameter
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");
if (query) {
    inputField.value = query
}

// for mobile
const win_width = window.innerWidth
if (win_width < 700) {
    fixed_grid.className = "fixed-grid has-1-cols";
    document.querySelector("span.title").remove();
    document.querySelector(".search-bar").style.width = "250px";
    document.querySelector("#selector").style.width = "52px";
}

//
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
    } else {
        columns.innerHTML = ""
        newURL.searchParams.delete('q');
        history.pushState({}, '', newURL)
        piped_fetch(null)
    }
    window.location.reload()
})

function spiner_start() {
    const spin_container = gen("div")
        .attr("class", "container is-flex is-justify-content-center is-align-items-center")
        .attr("id", "spiner")
        .attr("style", "height: 200px;")
    const spin_button = gen("button")
        .attr("class", "button is-large is-link is-loading ")
        .attr("style", "border: none; background: transparent; box-shadow: none;")
    spin_container.appendChild(spin_button)
    container.prepend(spin_container)
}
function spiner_stop() {
    document.querySelector("#spiner").remove()
}

async function piped_fetch(query, nextPageUrl, filter = "videos") {
    let url = query == null ? `${api_base}trending?region=IN` : `${api_base}search?q=${query}&filter=${filter}`

    if (nextPageUrl !== undefined) {
        url = `${api_base}nextpage/search?q=${query}&filter=videos&nextpage=${encodeURIComponent(nextPageUrl)}`;
    }
    try {
        spiner_start()
        const response = await fetch(url);
        const data = await response.json();
        spiner_stop()
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
        modal_detector_loader()
    } catch (err) {
        console.log(err);
    }
}

const modal_detector_loader = () => {
    // Functions to open and close a modal
    function openModal($el) {
        $el.classList.add('is-active');
    }

    function closeModal($el) {
        $el.classList.remove('is-active');
    }

    function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
            closeModal($modal);
        });
    }

    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.downloader-trigger') || []).forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        const $target = document.getElementById(modal);

        $trigger.addEventListener('click', () => {
            openModal($target);
        });
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');

        $close.addEventListener('click', () => {
            closeModal($target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });
}
document.addEventListener('DOMContentLoaded', modal_detector_loader())
