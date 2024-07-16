let NextPageUrl = "";
const base_url = 'https://pipedapi.kavin.rocks/'

const columns = document.querySelector("#columns");
const container = document.querySelector("#container");
let button;

const vid_limit = 30;
function string_limit(str, maxLength = 10) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + "..";
    }
    return str;
}
function time_stamp(sec){
    sec = Number(sec);
    var h = Math.floor(sec / 3600);
    var m = Math.floor(sec % 3600 / 60);
    var s = Math.floor(sec % 3600 % 60);

    var hDisplay = h > 0 ? (h < 10 ? "0" + h + ":" : h + ":") : "";
    var mDisplay = m > 0 ? (m < 10 ? "0" + m + ":" : m + ":") : "";
    var sDisplay = s > 0 ? (s < 10 ? "0" + s : s) : "";
    return hDisplay + mDisplay + sDisplay;
}
console.log(time_stamp(14571))

// Get the query parameter
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");

//initial page load
yt_call(query)

async function yt_call(query, pageToken) {
    let nextPage = "";
    if (pageToken !== "") nextPage = `&nextpage?q=${encodeURIComponent(pageToken)}`;

    try {
        const url = `${base_url}search?q=${query}&filter=videos` + nextPage

        const response = await fetch(url);
        const data = await response.json();
        console.log(data)

        if (data.items) {
            data.items.forEach((e) => {
                if (e.isShort) {
                    return;
                }
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
                const id = "https://piped.video" + e.url;
                opener.setAttribute("href", id);

                let vid_title = string_limit(e.title, 45);
                title.innerHTML = `${vid_title}`;
                img.src = e.thumbnail;

                const duration = document.createElement("div");
                duration.setAttribute("class", "duration");
                duration.innerHTML = time_stamp(e.duration);

                figure.appendChild(img);
                figure.appendChild(duration)
                card_image.appendChild(figure);
                card_image.appendChild(title);
                opener.appendChild(card_image);

                card.appendChild(opener);
                cell.appendChild(card);

                columns.appendChild(cell);
            });
        } else {
            console.error(data.error.message);
            const notify = document.createElement("p")
            notify.innerHTML = data.error.message
            container.appendChild(notify)
            return;
        }

        // load more button
        NextPageUrl = data.nextpage;
        if (NextPageUrl && !button) {
            button = document.createElement("button");
            button.setAttribute("class", "button is-rounded");
            button.setAttribute("id", "button");
            button.innerHTML = "Load More";
            container.appendChild(button);
            button.addEventListener("click", (event) => {
                yt_call(query, NextPageUrl);
            });
        } else {
            button.addEventListener("click", (event) => {
                yt_call(query, NextPageUrl);
            });
        }
    } catch (err) {
        console.log(err);
    }
}
