import {
    gen,
    yt_domain,
    cobalt_api,
    notification,
    getTheme,
} from './helper.js'

async function Cobalt(vurl, audio, quality, codec, filestyle, dub, metadata) {
    const url = yt_domain + vurl

    try {
        const fetched = await fetch(cobalt_api, {
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
                dubLang: dub,
                disableMetadata: metadata,
            }),

        })
        const data = await fetched.json()

        if (data)
            return data
    }
    catch (err) {
        console.log(err);
    }
}

const audio_opts = ["video", "audio"]
const quality_opts = ["144", "240", "360", "480", "720", "1080", "4K", "8K+"]
const codec_opts = ["h264", "av1", "vp9"]
const filestyle_opts = ["basic", "pretty", "classic", "nerdy"]

let audio_val = false
let quality_val = '144'
let codec_val = 'h264'
let filestyle_val = 'basic'
let dub_val = false
let metadata_val = false

function option_generator(unique_id, parent, opts, callback) {
    opts.forEach((opt, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const span = document.createElement('span');
        span.textContent = String(opt);
        a.appendChild(span);
        li.appendChild(a);

        // first button by-default active
        if (index === 0) {
            li.classList.add('is-active');
        }

        parent.appendChild(li);

        // click to active
        li.addEventListener('click', function() {
            parent.querySelector('li.is-active').classList.remove('is-active');
            this.classList.add('is-active');
            download_btn_refresh("#", "generate", document.querySelector(`#download_btn${unique_id}`))
            callback(opt)
        });
    });
}

function download_btn_refresh(link, inner, download_btn) {
    if (link === "#") {
        download_btn.removeAttribute('href')
    }
    else {
        download_btn.href = link;
    }
    download_btn.className = "button is-primary is-dark"
    download_btn.innerText = inner;
}


export function modal_loader(title, url) {
    const downloader_modals = document.createDocumentFragment()
    const unique_id = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/) //[v=asdas, asdas]

    const modal = gen("div")
        .class("modal")
        .attr("id", "downloader-modal" + unique_id[1])
    const modal_bg = gen("div").class("modal-background")
    const modal_cont = gen("div").class("modal-content m-3")
    const box = gen("div").class("box is-family-monospace")
    const H = gen("p")
        .class("title is-family-primary	")
        .inner("Download")
    const vtitle = gen("p")
        .class("subtitle is-6 mt-3 mb-3")
        .inner(title)

    const quality_title = gen("div").class("title is-6 mb-1").inner("Quality")
    const codec_title = gen("div").class("title is-6 mb-1").inner("Codec")
    const filestyle_title = gen("div").class("title is-6 mb-1").inner("FileName")

    const quality_subtitle = gen("p").class("is-size-7")
        .inner(`If the selected quality is not available, the closest quality will be used`)
    const codec_subtitle = gen("p").class("is-size-7")
    codec_subtitle.innerHTML = `
        h264: supported in all platforms, avg. details, max quality 1080.<br>
        av1: best quality, small file, supports 4k & HDR.<br>
        vp9: best quality, double file size, supports 4k & HDR.
        `
    const filestyle_subtitle = gen("p").class("is-size-7")
        .inner(`How the file should be named`)

    //opts
    const audio = gen("div").class("tabs is-toggle is-centered is-fullwidth mt-4 mb-4")
    let audio_selector = gen("ul").attr("id", "audio_selector")
    audio_val = option_generator(unique_id[1], audio_selector, audio_opts, (e) => { audio_val = e })

    const quality = gen("div").class("tabs is-toggle is-centered is-fullwidth mt-4 mb-4")
    const quality_selector = gen("ul").attr("id", "quality_selector")
    option_generator(unique_id[1], quality_selector, quality_opts, (e) => { quality_val = e })

    const codec = gen("div").class("tabs is-toggle is-centered is-fullwidth mt-4 mb-4")
    let codec_selector = gen("ul").attr("id", "codec_selector")
    option_generator(unique_id[1], codec_selector, codec_opts, (e) => { codec_val = e })

    const filestyle = gen("div").class("tabs is-small is-toggle is-centered is-fullwidth mt-4 mb-4")
    const filestyle_selector = gen("ul").attr("id", "filestyle_selector")
    option_generator(unique_id[1], filestyle_selector, filestyle_opts, (e) => { filestyle_val = e })

    const dub_l = gen("label")
        .class("is-size-7")
        .inner(` Dub-Audio (Browser language)`)
    const dub_selector = gen("input").attr("type", "checkbox")
    dub_l.prepend(dub_selector)
    const dub = gen("div")
        .class("card p-2 mb-1")
        .sty("display: inline-block; width: auto; max - width: 100 %; position: relative")
    dub.appendChild(dub_l)

    const metadata_l = gen("label")
        .class("is-size-7")
        .inner(` Disable metadata`)
    const metadata_selector = gen("input").attr("type", "checkbox")
    metadata_l.prepend(metadata_selector)
    const metadata = gen("div")
        .class("card p-2 mt-0")
        .sty("display: inline-block; width: auto; max - width: 100 %; ")
    metadata.appendChild(metadata_l)
    //opts

    const footer = gen("footer")
    let download_btn = gen("a")
        .attr("id", `download_btn${unique_id[1]}`)
        .class("button is-primary is-dark")
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
    box.appendChild(quality_title)
    box.appendChild(quality_subtitle)
    box.appendChild(quality)
    box.appendChild(codec_title)
    box.appendChild(codec_subtitle)
    box.appendChild(codec)
    box.appendChild(filestyle_title)
    box.appendChild(filestyle_subtitle)
    box.appendChild(filestyle)
    box.appendChild(dub)
    box.appendChild(document.createElement("div"))
    box.appendChild(metadata)

    box.appendChild(footer)

    modal_cont.appendChild(box)

    modal.appendChild(modal_bg)
    modal.appendChild(modal_cont)

    downloader_modals.appendChild(modal)
    document.body.appendChild(downloader_modals)

    dub_selector.addEventListener('change', () => {
        download_btn_refresh("#", "generate", download_btn);
        if (dub_selector.checked) {
            dub_val = true
        }
        else {
            dub_val = false
        }
    })
    metadata_selector.addEventListener('change', () => {
        download_btn_refresh("#", "generate", download_btn);
        if (metadata_selector.checked) {
            metadata_val = true
        }
        else {
            metadata_val = false
        }
    })

    download_btn.addEventListener('click', async function() {
        const b_text = download_btn.innerText
        if (b_text === "generate") {
            console.log("download generation initiated")
            download_btn.className = "button is-primary is-dark is-loading"

            audio_val = audio_val === "audio" ? true : false
            if(quality_val === "4K") quality_val = 2160
            if(quality_val === "8K+") quality_val = "max"

            const response = await Cobalt(url, audio_val, quality_val, codec_val, filestyle_val, dub_val);
            if (response.status === "error"){
                notification(response.text, `is-danger is-${getTheme()}`, 5000)
                download_btn_refresh("#", "generate", download_btn);
            }
            else {
                download_btn_refresh(response.url, "Download", download_btn);
            }
        }
        if (b_text === "Download") {
            const modal = document.querySelectorAll('.modal') || [];
            setTimeout(function() {
                modal.forEach(mod => {
                    mod.classList.remove('is-active');
                })
            }, 1500)
        }
    })
}
