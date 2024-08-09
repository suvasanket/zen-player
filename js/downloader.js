import { gen } from './thumbnails.js'
const yt_domain = "https://www.youtube.com"

async function Cobalt(vurl, audio, quality, codec, filestyle) {
    const url = yt_domain + vurl
    //console.log(vurl)
    //console.log(audio)
    //console.log(quality)
    //console.log(codec)
    //console.log(filestyle)

    try {
        const fetched = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                "Cache-Control": "no-cache",
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: encodeURI(url),
                vQuality: quality,
                vCodec: codec,
                filenamePattern: filestyle,
                isAudioOnly: audio,
                disableMetadata: true,
            }),

        })
        const data = await fetched.json()
        if (data.url) {
            //console.log(data.url)
            return data.url
        }
    }
    catch (err) {
        console.log(err);
    }
}

const audio_opts = ["video", "audio"]
const quality_opts = ["144", "240", "360", "480", "720", "1080"]
const codec_opts = ["h264", "av1", "vp9"]
const filestyle_opts = ["basic", "pretty", "classic", "nerdy"]

let audio_val = false
let quality_val = '144'
let codec_val = 'h264'
let filestyle_val = 'basic'

function option_generator(inu, parent, opts, callback) {
    opts.forEach((opt, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const span = document.createElement('span');
        span.textContent = String(opt);
        a.appendChild(span);
        li.appendChild(a);

        // Make the first tab active by default
        if (index === 0) {
            li.classList.add('is-active');
        }

        parent.appendChild(li);

        // Add click event to handle active state
        li.addEventListener('click', function() {
            parent.querySelector('li.is-active').classList.remove('is-active');
            this.classList.add('is-active');
            download_btn_refresh("#", "generate", document.querySelector(`#download_btn${inu}`))
            callback(opt)
        });
    });
}

function download_btn_refresh(link, inner, download_btn) {
    download_btn.className = "button is-primary is-dark"
    download_btn.href = link;
    download_btn.innerText = inner;
}


function modal_loader(index, title, url) {
    const downloader_modals = document.createDocumentFragment()

    const modal = gen("div")
        .attr("class", "modal")
        .attr("id", "downloader-modal" + index)
    const modal_bg = gen("div").attr("class", "modal-background")
    const modal_cont = gen("div").attr("class", "modal-content m-3")
    const box = gen("div").attr("class", "box")
    const H = gen("p")
        .attr("class", "title")
        .inner("Download")
    const vtitle = gen("p").inner(title)

    //opts
    const audio = gen("div").attr("class", "tabs is-toggle is-centered is-fullwidth mt-4 mb-4")
    let audio_selector = gen("ul").attr("id", "audio_selector")
    audio_val = option_generator(index, audio_selector, audio_opts, (e) => { audio_val = e })

    const quality = gen("div").attr("class", "tabs is-toggle is-centered is-fullwidth mt-4 mb-4")
    const quality_selector = gen("ul").attr("id", "quality_selector")
    option_generator(index, quality_selector, quality_opts, (e) => { quality_val = e })

    const codec = gen("div").attr("class", "tabs is-toggle is-centered is-fullwidth mt-4 mb-4")
    let codec_selector = gen("ul").attr("id", "codec_selector")
    option_generator(index, codec_selector, codec_opts, (e) => { codec_val = e })

    const filestyle = gen("div").attr("class", "tabs is-small is-toggle is-centered is-fullwidth mt-4 mb-4")
    const filestyle_selector = gen("ul").attr("id", "filestyle_selector")
    option_generator(index, filestyle_selector, filestyle_opts, (e) => { filestyle_val = e })
    //opts

    const footer = gen("footer")
    let download_btn = gen("a")
        .attr("href", "#")
        .attr("id", `download_btn${index}`)
        .attr("class", "button is-primary is-dark")
        .inner("generate")

    // append stuffs
    footer.appendChild(download_btn)

    audio.appendChild(audio_selector)
    quality.appendChild(quality_selector)
    codec.appendChild(codec_selector)
    filestyle.appendChild(filestyle_selector)

    box.appendChild(H)
    box.appendChild(vtitle)
    box.appendChild(audio)
    box.appendChild(quality)
    box.appendChild(codec)
    box.appendChild(filestyle)
    box.appendChild(footer)

    modal_cont.appendChild(box)

    modal.appendChild(modal_bg)
    modal.appendChild(modal_cont)

    downloader_modals.appendChild(modal)
    document.body.appendChild(downloader_modals)

    download_btn.addEventListener('click', async function() {
        if (download_btn.getAttribute("href") === "#") {
            console.log("download generation initiated")
            download_btn.className = "button is-primary is-dark is-loading"

            audio_val = audio_val === "audio" ? true : false
            const cobaltLink = await Cobalt(url, audio_val, quality_val, codec_val, filestyle_val);

            download_btn_refresh(cobaltLink, "Download", download_btn);
        }
    });
}

export { modal_loader }
