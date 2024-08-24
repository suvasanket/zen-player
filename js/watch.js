import { HeaderGenerator } from "./common.js"
import {
    video_audioSeparator,
    webm_mp4Separator,
    qualityExtract,
} from "./watch_helper.js"

// generate header
HeaderGenerator()

const video = videojs('video-player')
video.controlBar.addChild('QualitySelector')
const api = [
    "https://invidious.perennialte.ch",
    "https://yewtu.be",
    "https://iv.ggtyler.dev",
]

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
    const extractedFormats = video_audioSeparator(adaptiveFormats)
    const audio_arr = extractedFormats[0]
    const video_arr = extractedFormats[1]

    const webm_vid = webm_mp4Separator(video_arr)[0]
    const webm_aud = webm_mp4Separator(audio_arr)[0]

    if (default_quality === 1)
        default_quality = video_arr[0].qualityLabel
    else if (default_quality === 2)
        default_quality = video_arr[video_arr.length - 1].qualityLabel
    else
        default_quality = formatStreams[0].qualityLabel


    let audio = new Audio(webm_aud[0].url)
    const videoSrc = qualityExtract(webm_vid, default_quality)
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
    video.on('playing', () => {
        audio.play()
        syncAudioVideo()
    })
    video.on('qualitySelected', () => audio.currentTime = video.currentTime())
}

async function videoFetch(vid, api, default_quality) {
    const video_param = "/api/v1/videos/"
    let currentIndex = 0

    while (currentIndex < api.length) {
        try {
            const fetched = await fetch(api[currentIndex] + video_param + vid)
            const data = await fetched.json()
            //console.log(data)

            try {
                PlayVideo(data.adaptiveFormats, data.formatStreams, default_quality)
                return
            }
            catch (err) {
                console.error("Error Playing Video: ", err)
                return
            }
        }
        catch (err) {
            currentIndex++
        }
    }

    console.error("All available instance exhausted")
}
