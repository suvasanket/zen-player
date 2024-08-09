import { grid_loader } from "./thumbnails.js"

let NextPageUrl = "";
const api_base = 'https://pipedapi.kavin.rocks/'
//const video_base = 'https://piped.video'

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
    let url = query == null ? `${api_base}trending?region=IN` : `${api_base}search?q=${query}&filter=${filter}`

    if (nextPageUrl !== undefined) {
        url = `${api_base}nextpage/search?q=${query}&filter=videos&nextpage=${encodeURIComponent(nextPageUrl)}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
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

//const tabs = ["Pictures", "Music", "Videos", "Documents"];
//const tabList = document.getElementById('tab-list');
//
//// Dynamically create and append tabs
//tabs.forEach((tab, index) => {
//    const li = document.createElement('li');
//    const a = document.createElement('a');
//    const span = document.createElement('span');
//    span.textContent = tab;
//    a.appendChild(span);
//    li.appendChild(a);
//
//    // Make the first tab active by default
//    if (index === 0) {
//        li.classList.add('is-active');
//    }
//
//    // Add click event to handle active state
//    li.addEventListener('click', function() {
//        document.querySelector('#tab-list li.is-active').classList.remove('is-active');
//        this.classList.add('is-active');
//    });
//
//    tabList.appendChild(li);
//});

const modal_detector_loader = () => {
    console.log("modal loaded")
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
