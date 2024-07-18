function string_limit(str, maxLength = 10) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + "..";
    }
    return str;
}
function timeFormat(sec) {
    sec = Number(sec);
    var h = Math.floor(sec / 3600);
    var m = Math.floor(sec % 3600 / 60);
    var s = Math.floor(sec % 3600 % 60);

    var hDisplay = h > 0 ? (h < 10 ? "0" + h + ":" : h + ":") : "";
    var mDisplay = m > 0 ? (m < 10 ? "0" + m + ":" : m + ":") : "";
    var sDisplay = s >= 0 ? (s < 10 ? "0" + s : s) : "";
    return hDisplay + mDisplay + sDisplay;
}

// it takes each element and then append them to the main columns
function grid_loader(e) {
    const type = e.type

    const cell = document.createElement("div");
    cell.setAttribute("class", "cell");

    const card = document.createElement("div");
    card.setAttribute("class", "card");

    const card_image = document.createElement("div");
    card_image.setAttribute("class", "card-image");

    const figure = document.createElement("figure");
    figure.setAttribute("class", "image is-16by9");
    figure.setAttribute("style", "overflow: hidden;")

    const img = document.createElement("img");
    img.setAttribute("id", "thumbnail");
    img.setAttribute("style", "object-fit: cover; object-position: center; width: 100%; height: 100%;")

    const footer = document.createElement("div");
    footer.setAttribute("class", "m-2 pb-2");
    footer.setAttribute("style", "display: flex; align-items: center")

    const channel_logo = document.createElement("img")
    channel_logo.setAttribute("style", "height: 24; width: 24px; margin-right: 7px;")

    const title = document.createElement("span")
    title.setAttribute("class", "has-text-grey-lighter is-size-7 has-text-weight-bold")

    const subtitle = document.createElement("span")
    subtitle.setAttribute("class", "is-size-7 has-text-weight-normal")

    const title_subtitle = document.createElement("div")
    title_subtitle.setAttribute("style", "line-height: 1;")

    const video_opener = document.createElement("a");
    const channel_opener = document.createElement("a")
    channel_opener.setAttribute("style", "display: flex; align-items: center; margin-right: 7px;")

    const duration = document.createElement("div");
    duration.setAttribute("class", "duration");

    // show accroding to type
    if (type === "stream") {
        if (e.isShort) {
            return;
        }
        video_opener.setAttribute("href", "https://piped.video" + e.url);
        channel_opener.setAttribute("href", "https://piped.video" + e.uploaderUrl);
        title.innerHTML = `${string_limit(e.title, 37)}`;
        subtitle.innerHTML = `${e.views} • ${e.uploadedDate}`
        channel_logo.src = e.uploaderAvatar
        img.src = e.thumbnail;
        duration.innerHTML = timeFormat(e.duration);

        channel_opener.appendChild(channel_logo)
        footer.appendChild(channel_opener)
        title_subtitle.appendChild(title)
        title_subtitle.appendChild(document.createElement("br"))
        title_subtitle.appendChild(subtitle)
        footer.appendChild(title_subtitle)
    }
    else if (type === "playlist"){
        video_opener.setAttribute("href", "https://piped.video" + e.url);
        footer.innerHTML = `${string_limit(e.name, 40)}`;
        img.src = e.thumbnail;
        duration.innerHTML = e.type

    }
    else if (type === "channel"){

    }
    else {
        //alert("no type")
    }

    // add to html
    figure.appendChild(img);
    figure.appendChild(duration)
    video_opener.appendChild(figure);
    card_image.appendChild(video_opener);
    card_image.appendChild(footer);

    card.appendChild(card_image);
    cell.appendChild(card);

    columns.appendChild(cell);
}
export { grid_loader }

