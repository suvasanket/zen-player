const API_KEY = "AIzaSyAa9dio50KnJTMQ4exK9l3df_VdOZI8b6I";
let NextpageToken = "";

const columns = document.querySelector("#columns");
const button = document.querySelector("#button")

const vid_limit = 30
function string_limit(str, maxLength = 10) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + "..";
    }
    return str;
}
// Get the query parameter
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");
console.log(query);

yt_call(query, vid_limit, "");
// next page
button.addEventListener("click", (event) => {
    console.log(NextpageToken)
    yt_call(query, vid_limit, NextpageToken)
})

async function yt_call(query, length = 10, pageToken) {
    let nextPage = "";
    if (pageToken !== "") nextPage = `&pageToken=${pageToken}`;

    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            query,
        )}&type=video&key=${API_KEY}&maxResults=${length}` + nextPage;

        const response = await fetch(url);
        const data = await response.json();
        NextpageToken = data.nextPageToken;
        console.log(data);

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

                const img = document.createElement("img");
                img.setAttribute("id", "thumbnail");

                const title = document.createElement("div");
                title.setAttribute("class", "p-2 has-text-white");

                const opener = document.createElement("a");
                const id = "https://piped.video/watch?v=" + e.id.videoId;
                opener.setAttribute("href", id);

                let vid_title = string_limit(e.snippet.title, 20);
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
    } catch (err) {
        console.log(err);
    }
}
