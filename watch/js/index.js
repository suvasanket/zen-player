import {
    video_audioSeparator,
    webm_mp4Separator,
    qualityExtract,
    changeApi,
} from "./helper.js"

const video = videojs('video-player')
video.controlBar.addChild('QualitySelector')
let api = [
    "https://invidious.perennialte.ch",
    "https://yewtu.be",
    "https://iv.ggtyler.dev",
]
let count = api.length
const id = "iWI1blim1Vk"

function StartVideo(id, api, count, err) {
    if (err && count !== 0) {
        const { api: get_api, count: get_count } = changeApi(api, count)
        api = get_api
        count = get_count
    }
    videoPlay(id, api[0])
}
try {
    StartVideo(id, api, count)
}
catch (e) {
    StartVideo(id, api, count, e)
}

async function videoPlay(vid, s_api) {
    const video_param = "/api/v1/videos/"
    const fetched = await fetch(s_api + video_param + vid)
    const data = await fetched.json()

    const adaptiveFormats = video_audioSeparator(data.adaptiveFormats)
    const audios = adaptiveFormats[0]
    const videos = adaptiveFormats[1]

    const webm_vid = webm_mp4Separator(videos)[0]
    const webm_aud = webm_mp4Separator(audios)[0]

    let audio = new Audio(webm_aud[0].url)
    const videoSrc = qualityExtract(webm_vid, "144p")
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
