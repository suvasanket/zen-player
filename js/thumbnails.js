import { modal_loader } from "./downloader.js"
import { gen, getTheme, yt_domain, piped_domain, invidious_domain } from "./helper.js"

let video_opt = '&autoplay=1'
video_opt += `&dark_mode=auto`

const quality = ['144', '240', '360', '720']
quality.push('Download')

function stringLimit(str, maxLength = 10) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + "..";
    }
    return str;
}

function timeFormat(sec) {
    if (sec == -1) return "live"
    sec = Number(sec);
    var h = Math.floor(sec / 3600);
    var m = Math.floor(sec % 3600 / 60);
    var s = Math.floor(sec % 3600 % 60);

    var hDisplay = h > 0 ? (h < 10 ? "0" + h + ":" : h + ":") : "";
    var mDisplay = m > 0 ? (m < 10 ? "0" + m + ":" : m + ":") : "";
    var sDisplay = s >= 0 ? (s < 10 ? "0" + s : s) : "";

    if (mDisplay === "" && sDisplay !== "") return "0:" + sDisplay

    return hDisplay + mDisplay + sDisplay;
}

function views_format(views) {
    let bil = 1000000000
    let mil = 1000000
    let thousand = 1000

    if (views > bil) {
        return Math.round(views / bil) + "B"
    }
    else if (views > mil) {
        return Math.round(views / mil) + "M"
    }
    else if (views > thousand) {
        return Math.round(views / thousand) + "K"
    }
    else {
        return views.toString()
    }
}

// it takes each element and then append them to the main columns
export function grid_loader(e) {
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
        let v_url = invidious_domain + e.url + video_opt
        if (e.duration === -1) {
            v_url = yt_domain + e.url
        }
        video_opener.setAttribute("href", v_url);

        const channel_opener = gen("a")
            .attr("style", "display: flex; align-items: center; margin-right: 7px;")
            .attr("href", piped_domain + e.uploaderUrl + video_opt);

        const title = gen("span")
            .attr("class", "is-size-7 has-text-weight-bold")
            .inner(`${stringLimit(e.title, 37)}`)

        if (e.uploadedDate) {
            subtitle.innerHTML = `${views_format(e.views)} views • ${e.uploadedDate}`
        }
        else {
            subtitle.innerHTML = `${views_format(e.views)} watching`
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
            } else {
                a.setAttribute("href", v_url + "&quality_dash=" + el)
                a.innerHTML = el + "p"
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
