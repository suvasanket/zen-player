const video_base = 'https://piped.video'
let video_opt = '&playerAutoPlay=true'

const gen = (element) => document.createElement(element)

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
    return hDisplay + mDisplay + sDisplay;
}

function views_format(views) {
    let bil = 1000000000
    let mil = 1000000
    let thousand = 1000

    if (views > bil) {
        return Math.round(views / bil)+ "B"
    }
    else if (views > mil) {
        return Math.round(views / mil)+ "M"
    }
    else if (views > thousand) {
        return Math.round(views / thousand) + "K"
    }
    else {
        return views.toString()
    }
}

//light mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    video_opt += '&theme=light'
}
else {
    video_opt += '&theme=dark'
}

// it takes each element and then append them to the main columns
function grid_loader(e) {
    const type = e.type

    const cell = gen("div");
    cell.setAttribute("class", "cell");

    const card = gen("div");
    card.setAttribute("class", "card");

    const card_image = gen("div");
    card_image.setAttribute("class", "card-image");

    const figure = gen("figure");
    figure.setAttribute("class", "image is-16by9");
    figure.setAttribute("style", "overflow: hidden;")

    const img = gen("img");
    img.setAttribute("id", "thumbnail");
    img.setAttribute("style", "object-fit: cover; object-position: center; width: 100%; height: 100%;")

    const footer = gen("div");
    footer.setAttribute("class", "m-2 pb-2");
    footer.setAttribute("style", "display: flex; align-items: center")

    const channel_logo = gen("img")
    channel_logo.setAttribute("style", "height: 24; width: 24px; margin-right: 7px;")

    const title = gen("span")
    title.setAttribute("class", "is-size-7 has-text-weight-bold")

    const subtitle = gen("span")
    subtitle.setAttribute("class", "is-size-7 has-text-weight-normal")

    const title_subtitle = gen("div")
    title_subtitle.setAttribute("style", "line-height: 1;")

    const video_opener = gen("a");
    const channel_opener = gen("a")
    channel_opener.setAttribute("style", "display: flex; align-items: center; margin-right: 7px;")

    const duration = gen("div");
    duration.setAttribute("class", "duration");

    const corner_icon = gen("div")
    corner_icon.setAttribute("class", "icon-container")

    const corner_img = gen("img")
    corner_img.setAttribute("style", "height: 24px; width: 24px;")

    const corner_content = gen("div")
    corner_content.setAttribute("class", "hover-content")

    // show accroding to type
    if (type === "stream") {
        if (e.isShort) {
            return;
        }
        const v_url = video_base + e.url + video_opt

        video_opener.setAttribute("href", v_url);
        channel_opener.setAttribute("href", video_base + e.uploaderUrl + video_opt);
        title.innerHTML = `${stringLimit(e.title, 37)}`;
        if (e.uploadedDate){
            subtitle.innerHTML = `${views_format(e.views)} views • ${e.uploadedDate}`
        }
        else {
            subtitle.innerHTML = `${views_format(e.views)} watching`
        }
        channel_logo.src = e.uploaderAvatar
        channel_logo.alt = e.uploaderName
        img.src = e.thumbnail;
        duration.innerHTML = timeFormat(e.duration);
        ['144', '360', '720', '1080'].forEach(el => {
            const a = gen("a")
            a.setAttribute("href", v_url + "&quality=" + el)
            a.innerHTML = el + "p"
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
    else if (type === "playlist"){
        video_opener.setAttribute("href", v_url);
        footer.innerHTML = `${stringLimit(e.name, 40)}`;
        img.src = e.thumbnail;
        duration.innerHTML = e.type

        corner_img.src = "assets/video-library-svgrepo-com.svg"
        corner_icon.appendChild(corner_img)

    }
    else if (type === "music"){

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
export { grid_loader }
