import { GetApi } from "./Instances.js"
import {
    views_format,
    notification,
    getTheme,
} from "./helper.js"
import {
    video_audioSeparator,
    webm_mp4Separator,
    qualityExtract,
} from "./watch_helper.js"


// generate all endPoint
const api = GetApi()

const video = videojs('video-player', {
    controlBar: {
        children: [
            "playToggle",
            'skipBackward',
            'skipForward',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            "progressControl",
            "remainingTimeDisplay",
            "volumePanel",
            'pictureInPictureToggle',
            'QualitySelector',
            "fullscreenToggle"
        ]
    },
})
video.addClass('vjs-waiting')

const UrlParams = new URLSearchParams(window.location.search)
let id = UrlParams.get("v")
if (id) {
    const def_qua = parseInt(id.charAt(id.length - 1))
    id = id.slice(0, -1)

    if (def_qua === 1)
        videoFetch(id, api, 1)
    else if (def_qua === 2)
        videoFetch(id, api, 2)
    else
        videoFetch(id, api)
}

function PlayVideo(adaptiveFormats, formatStreams, default_quality) {
    video.removeClass('vjs-waiting')

    const extractedFormats = video_audioSeparator(adaptiveFormats)
    const audio_arr = extractedFormats[0]
    const video_arr = extractedFormats[1]

    const webm_vid = webm_mp4Separator(video_arr)[0]
    const mp4_vid = webm_mp4Separator(video_arr)[1]
    const webm_aud = webm_mp4Separator(audio_arr)[0]
    const mp4_aud = webm_mp4Separator(audio_arr)[1]

    const player_vid = webm_vid.length ? webm_vid : mp4_vid
    const player_aud = webm_aud.length ? webm_aud : mp4_aud

    if (default_quality === 1)
        default_quality = video_arr[0].qualityLabel
    else if (default_quality === 2)
        default_quality = video_arr[video_arr.length - 1].qualityLabel
    else
        default_quality = formatStreams[0].qualityLabel

    let audio = new Audio(player_aud[0].url)
    const videoSrc = qualityExtract(player_vid, default_quality)
    video.src(videoSrc)

    // video-audio sync
    function syncAudioVideo() {
        if (Math.abs(audio.currentTime - video.currentTime) > 0.1) {
            if (audio.currentTime < video.currentTime) {
                audio.currentTime = video.currentTime;
            } else {
                video.currentTime = audio.currentTime;
            }
        }
        requestAnimationFrame(syncAudioVideo);
    }
    video.ready(() => {
        video.play()
        syncAudioVideo()
    })
    video.on('play', () => syncAudioVideo())
    video.on('pause', () => {
        video.pause()
        audio.pause()
    })
    video.on('seeking', () => audio.currentTime = video.currentTime())
    video.on('timeupdate', syncAudioVideo)
    video.on('loadstart', () => audio.pause())
    video.on('volumechange', () => audio.volume = video.volume())
    video.on('playing', () => {
        audio.play()
        syncAudioVideo()
    })
    video.on('qualitySelected', () => audio.currentTime = video.currentTime())
}

const removeSkele = (element) => element.classList.remove("has-skeleton")
function BottomLayoutGen(data) {
    const title = document.querySelector("#title")
    removeSkele(title)
    title.innerHTML = data.title

    const views_time = document.querySelector("#views-timeago")
    removeSkele(views_time)
    views_time.innerHTML = views_format(data.viewCount) + " views • " + data.publishedText

    const channel_logo_img = document.querySelector("#channel-logo-img")
    removeSkele(channel_logo_img)
    channel_logo_img.src = data.authorThumbnails[2].url

    const channel_name = document.querySelector("#channel-name")
    removeSkele(channel_name)
    channel_name.innerHTML = data.author

    const subs = document.querySelector("#subs")
    removeSkele(subs)
    subs.innerHTML = data.subCountText + " subscribers"

    const description = document.querySelector("#description")
    const formatted = data.description.replace(/\n/g, `<br>`)
    description.insertAdjacentHTML('beforeend', formatted)

    title.addEventListener("click", () => {
        description.classList.toggle("is-open")
    })
    views_time.addEventListener("click", () => {
        description.classList.toggle("is-open")
    })
}

async function videoFetch(vid, api, default_quality) {
    const ret = () => {
        video.removeClass('vjs-waiting')
        return
    }
    if (!api.length)
        api = ["https://invidious.perennialte.ch"]

    const video_param = "/api/v1/videos/"
    let currentIndex = 0

    while (currentIndex < api.length) {
        try {
            const fetched = await fetch(api[currentIndex] + video_param + vid)
            const data = await fetched.json()
            console.log(data)

            try {
                PlayVideo(data.adaptiveFormats, data.formatStreams, default_quality)
                ret()
            }
            catch (err) {
                console.error("Error Playing Video: ", err)
                ret()
            }
            try {
                BottomLayoutGen(data)
                ret()
            }
            catch (err) {
                console.error("Error Bottom Layout Generation: ", err)
                ret()
            }
            return
        }
        catch (err) {
            currentIndex++
            notification(
                `Issue feteching video, Trying other server<br>Attempt: ${currentIndex}`,
                2000,
                `is-warning is-${getTheme()}`
            )
        }
    }

    notification(
        `All server are exhausted, Please try again later`,
        7000,
        `is-danger is-${getTheme()}`
    )
}
