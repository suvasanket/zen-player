const API_KEY = "AIzaSyAa9dio50KnJTMQ4exK9l3df_VdOZI8b6I";
let NextpageToken = "";

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

// Get the query parameter
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");

//initial page load
yt_call(query, vid_limit, "");

async function yt_call(query, length = 10, pageToken) {
    let nextPage = "";
    if (pageToken !== "") nextPage = `&pageToken=${pageToken}`;

    try {
        const url =
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                query,
            )}&type=video&key=${API_KEY}&maxResults=${length}` + nextPage;

        const response = await fetch(url);
        const data = await response.json();
        console.log(data.items)

        if (data.items) {
            data.items.forEach((e) => {
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
                title.setAttribute("class", "p-2 has-text-white");

                const opener = document.createElement("a");
                const id = "https://piped.video/watch?v=" + e.id.videoId;
                opener.setAttribute("href", id);

                let vid_title = string_limit(e.snippet.title, 30);
                title.innerHTML = `${vid_title}`;
                img.src = e.snippet.thumbnails.high.url;

                figure.appendChild(img);
                card_image.appendChild(figure);
                card_image.appendChild(title);
                opener.appendChild(card_image);

                card.appendChild(opener);
                cell.appendChild(card);

                columns.appendChild(cell);
            });
        } else {
            console.error(data.error.message);
        }

        // load more button
        NextpageToken = data.nextPageToken;
        if (NextpageToken && !button) {
            button = document.createElement("button");
            button.setAttribute("class", "button is-rounded");
            button.setAttribute("id", "button");
            button.innerHTML = "Load More";
            container.appendChild(button);
            button.addEventListener("click", (event) => {
                yt_call(query, vid_limit, NextpageToken);
            });
        } else {
            button.addEventListener("click", (event) => {
                yt_call(query, vid_limit, NextpageToken);
            });
        }
    } catch (err) {
        console.log(err);
    }
}
