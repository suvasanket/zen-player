import { modal_loader } from "./downloader.js"
import {
    gen,
    yt_domain,
    piped_domain,
    piped_api,
    getTheme,
    modal_detector_loader,
    stringLimit,
    timeFormat,
    numberFormat,
    getUrl
} from "./helper.js"

let NextPageUrl = "";
let totalNumberOfVideos = []

const columns = document.querySelector("#columns");
const container = document.querySelector("#container");
let isAtBottom = false;

const quality = ['lowest', 'highest']
quality.push('Download')

// it takes each element and then append them to the main columns
function grid_loader(e) {
    const type = e.type

    const cell = gen("div")
        .attr("class", "cell")

    const card = gen("div")
        .attr("class", "card");

    const card_image = gen("div")
        .attr("class", "card-image");

    const figure = gen("figure")
        .attr("class", "image is-16by9")
        .attr("style", "overflow: hidden;")

    const img = gen("img")
        .attr("id", "thumbnail")
        .attr("style", "object-fit: cover; object-position: center; width: 100%; height: 100%;")

    const footer = gen("div")
        .attr("class", "m-2 pb-2")
        .attr("style", "display: flex; align-items: center")

    const subtitle = gen("span")
        .attr("class", "is-size-7 has-text-weight-normal")

    const title_subtitle = gen("div")
        .attr("style", "line-height: 1;")

    const duration = gen("div")
        .attr("class", "duration");

    const corner_icon = gen("div")
        .attr("class", "icon-container")

    const corner_img = gen("img")
        .attr("style", "height: 24px; width: 24px;")

    const corner_content = gen("div")
        .attr("class", "hover-content")

    const video_opener = gen("a")
    // show accroding to type
    if (type === "stream") {
        if (e.isShort) {
            return;
        }

        // heuristic site opener
        let v_url = getUrl(e.url.replace(/\/watch/, 'watch.html'))
        if (e.duration === -1) {
            v_url = yt_domain + e.url
        }
        video_opener.setAttribute("href", v_url + 0);

        const channel_opener = gen("a")
            .attr("style", "display: flex; align-items: center; margin-right: 7px;")
            .attr("href", piped_domain + e.uploaderUrl);

        const title = gen("span")
            .attr("class", "is-size-7 has-text-weight-bold")
            .inner(`${stringLimit(e.title, 37)}`)

        if (e.uploadedDate) {
            subtitle.innerHTML = `${numberFormat(e.views)} views • ${e.uploadedDate}`
        }
        else {
            subtitle.innerHTML = `${numberFormat(e.views)} watching`
        }

        const channel_logo = gen("img")
            .attr("style", "height: 24px; width: 24px; margin-right: 7px;")
        channel_logo.src = e.uploaderAvatar
        channel_logo.alt = e.uploaderName

        img.src = e.thumbnail;

        duration.innerHTML = timeFormat(e.duration);

        // the corner thingy
        quality.forEach(el => {
            const a = gen("a")
            if (el === 'Download') {
                const unique_id = e.url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/)
                a.setAttribute("class", "downloader-trigger")
                a.setAttribute("data-target", "downloader-modal" + unique_id[1])
                a.innerHTML = el
                modal_loader(e.title, e.url)
            }
            else if (el === 'lowest') {
                a.setAttribute("href", v_url + 1)
                a.innerHTML = el
            }
            else if (el === 'highest') {
                a.setAttribute("href", v_url + 2)
                a.innerHTML = el
            }
            corner_content.appendChild(a)
        })
        corner_img.src = "assets/play-circle-svgrepo-com.svg"

        channel_opener.appendChild(channel_logo)
        footer.appendChild(channel_opener)
        title_subtitle.appendChild(title)
        title_subtitle.appendChild(gen("br"))
        title_subtitle.appendChild(subtitle)
        footer.appendChild(title_subtitle)

        corner_icon.appendChild(corner_content)
        corner_icon.appendChild(corner_img)
    }
    else if (type === "playlist") {
        video_opener.setAttribute("href", v_url);
        footer.innerHTML = `${stringLimit(e.name, 40)}`;
        img.src = e.thumbnail;
        duration.innerHTML = e.type

        corner_img.src = "assets/video-library-svgrepo-com.svg"
        corner_icon.appendChild(corner_img)

    }
    else if (type === "music") {

    }
    else {
        //alert("no type")
    }

    // add to html
    figure.appendChild(img);
    figure.appendChild(duration)
    video_opener.appendChild(figure);
    card_image.appendChild(video_opener);
    card_image.appendChild(corner_icon);
    card_image.appendChild(footer);

    card.appendChild(card_image);
    cell.appendChild(card);

    columns.appendChild(cell);
}

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

document.addEventListener("SearchSubmit", e => {
    e.preventDefault();

    totalNumberOfVideos = []
})

export async function piped_fetch(query, nextPageUrl, filter = "videos") {
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
