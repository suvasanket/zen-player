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

    const title = document.createElement("div");
    title.setAttribute("class", "p-2 has-text-white is-size-7");

    const opener = document.createElement("a");

    const duration = document.createElement("div");
    duration.setAttribute("class", "duration");

    if (type === "stream") {
        if (e.isShort) {
            return;
        }
        opener.setAttribute("href", "https://piped.video" + e.url);
        title.innerHTML = `${string_limit(e.title, 45)}`;
        img.src = e.thumbnail;
        duration.innerHTML = timeFormat(e.duration);
    }
    else if (type === "playlist"){
        opener.setAttribute("href", "https://piped.video" + e.url);
        title.innerHTML = `${string_limit(e.name, 45)}`;
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
    card_image.appendChild(figure);
    card_image.appendChild(title);
    opener.appendChild(card_image);

    card.appendChild(opener);
    cell.appendChild(card);

    columns.appendChild(cell);
}
export { grid_loader }

