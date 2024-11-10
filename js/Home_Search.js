import { modal_loader } from "./downloader.js"
import {
    gen,
    yt_domain,
    piped_domain,
    piped_api,
    modal_detector_loader,
    stringLimit,
    timeFormat,
    numberFormat,
    getUrl,
    spinnerToggle,
    notification,
    invidious_api
} from "./helper.js"

let NextPageUrl = "";
let totalNumberOfVideos = []

const columns = document.querySelector("#columns");
const container = document.querySelector("#container");
let isAtBottom = false;

const quality = ['lowest', 'highest']
quality.push('Download')

function thumbnailQuality(speed) {
    if (sessionStorage.getItem('thumbnailFetchingSpeed') !== null)
        speed = sessionStorage.getItem('thumbnailFetchingSpeed')
    if (speed <= 0.5) return 'default'
    else if (0.5 < speed < 2) return 'mqdefault'
    else if (speed > 2) return 'hqdefault'
    else return '1'
}


// it takes each element and then append them to the main columns
function grid_loader(e, speed) {
    const type = e.type

    const cell = gen("div")
        .class("cell")

    const card = gen("div")
        .class("card");

    const card_image = gen("div")
        .class("card-image");

    const figure = gen("figure")
        .class("image is-16by9")
        .sty("overflow: hidden;")

    const img = gen("img")
        .attr("id", "thumbnail")
        .sty("object-fit: cover; object-position: center; width: 100%; height: 100%;")

    const footer = gen("div")
        .class("m-2 pb-2")
        .sty("display: flex; align-items: center")

    const subtitle = gen("span")
        .class("is-size-7 has-text-weight-normal")

    const title_subtitle = gen("div")
        .sty("line-height: 1;")

    const duration = gen("div")
        .class("duration");

    const corner_icon = gen("div")
        .class("icon-container")

    const corner_img = gen("img")
        .sty("height: 24px; width: 24px;")

    const corner_content = gen("div")
        .class("hover-content")

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
            .sty("display: flex; align-items: center; margin-right: 7px;")
            .attr("href", piped_domain + e.uploaderUrl);

        const title = gen("span")
            .class("is-size-7 has-text-weight-bold")
            .inner(`${e.title}`)
        //.inner(`${stringLimit(e.title, 37)}`)

        if (e.uploadedDate) {
            subtitle.innerHTML = `${numberFormat(e.views)} views • ${e.uploadedDate}`
        }
        else {
            subtitle.innerHTML = `${numberFormat(e.views)} watching`
        }

        const channel_logo = gen("img")
            .sty("height: 24px; width: 24px; margin-right: 7px;")
        channel_logo.src = e.uploaderAvatar
        channel_logo.alt = e.uploaderName

        //img.src = e.thumbnail;
        img.src = `${invidious_api[0]}/vi/${e.url.match(/(?<==).*/)}/${thumbnailQuality(speed)}.jpg`

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

document.addEventListener("SearchSubmit", e => {
    e.preventDefault();

    totalNumberOfVideos = []
})

function detectSpeed(start, end, size) {
    const durationSec = (end - start) / 1000
    const loadedBits = size * 8
    const inBps = (loadedBits / durationSec).toFixed(2)
    const inKbps = (inBps / 1024).toFixed(2)
    const inMbps = (inKbps / 1024).toFixed(2)

    //const storedSpeed = sessionStorage.getItem('thumbnailFetchingSpeed');
    //if (storedSpeed === null)
    //    sessionStorage.setItem('thumbnailFetchingSpeed', String(inMbps))
    //
    //if (storedSpeed !== null)
    //    return storedSpeed
    return inMbps
}

async function piped_fetch(query, nextPageUrl, filter = "videos") {
    let currentindex = 0
    if (query && !nextPageUrl)
        spinnerToggle(container)

    while (currentindex < piped_api.length) {
        const endpoint = new URL(`${piped_api[currentindex]}`)
        let url = ""
        try {
            if (query)
                url = `${endpoint}/search?q=${query}&filter=${filter}`
            else {
                spinnerToggle(container)
                url = `${endpoint}/trending?region=IN`
            }

            if (nextPageUrl)
                url = `${endpoint}/nextpage/search?q=${query}&filter=videos&nextpage=${encodeURIComponent(nextPageUrl)}`;

            console.log(url)
            const beforeFetch = new Date().getTime()
            const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
            const afterFetch = new Date().getTime()

            if (response.ok) {
                spinnerToggle(container)
                const data = await response.clone().json()
                const dataSize = new TextEncoder().encode(data).length
                const speed = detectSpeed(beforeFetch, afterFetch, dataSize)
                return { data, speed }
            }
            else {
                currentindex++
            }

            return
        } catch (err) {
            currentindex++
        }
    }
    notification(
        `All the available instances are exhuasted<br>Try later 😢`,
        'is-danger',
        3000
    )
    return
}

export async function SearchLoad(query, nextPageUrl, filter) {
    const { data, speed } = await piped_fetch(query, nextPageUrl, filter)
    console.log(data)

    if (data && data.items) {
        data.items.forEach(e => grid_loader(e, speed))
    } else {
        data.forEach(e => grid_loader(e, speed))
    }

    NextPageUrl = data.nextpage;
    if (NextPageUrl) {
        // if less than 20 results then do a nextpage reload
        const total = totalNumberOfVideos.reduce((prev, cur) => prev + cur, 0)
        if (total < 30) {
            SearchLoad(query, NextPageUrl)
            const len = data.items.length || data.length
            totalNumberOfVideos.push(len)
        }
        window.addEventListener('scroll', function() {
            const scrollPosition = window.innerHeight + window.scrollY;
            const bodyHeight = document.body.offsetHeight;

            if (scrollPosition >= bodyHeight - 5 && !isAtBottom) {
                isAtBottom = true;
                SearchLoad(query, NextPageUrl);
            } else if (scrollPosition < bodyHeight - 5) {
                isAtBottom = false;
            }
        });
    }
    modal_detector_loader()
}
