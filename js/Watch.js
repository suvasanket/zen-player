import {
    notification,
    ifDep,
    numberFormat,
    yt_domain,
} from "./helper.js";

export const video = videojs('video-player', {
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

function video_audioSeparator(arr) {
    let video_adaptiveFormats = []
    let audio_adaptiveFormats = []
    const regex = /(audio\/|video\/)/;

    arr.forEach(e => {
        const type = (e.type).match(regex)
        if (type[0] === "audio/")
            audio_adaptiveFormats.push(e)
        if (type[0] === "video/")
            video_adaptiveFormats.push(e)
    })
    return [audio_adaptiveFormats, video_adaptiveFormats]
}
function webm_mp4Separator(arr) {
    let webm = []
    let mp4 = []
    const regex = /(audio|video)\/([^;]+)/;
    arr.forEach(e => {
        const type = (e.type).match(regex)
        if (type[2] === "webm")
            webm.push(e)
        if (type[2] === "mp4")
            mp4.push(e)
    })
    return [webm, mp4]
}

function qualityExtract(arr, def, dash) {
    let res = []
    if (dash) res.push({
        src: dash,
        type: "application/dash+xml",
        label: "DASH"
    })
    arr.forEach(e => {
        const obj = {}
        const qualityLabel = e.qualityLabel
        const url = e.url

        if (def === qualityLabel) obj.selected = true
        if (url) obj.src = url
        if (qualityLabel) obj.label = qualityLabel
        obj.type = "video/webm"
        res.push(obj)
    })
    return res
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
function BottomLayoutGen(data, dis_data, vid) {
    const title = document.querySelector("#title")
    removeSkele(title)
    title.innerHTML = data.title

    const views_time = document.querySelector("#views-timeago")
    removeSkele(views_time)
    views_time.innerHTML = numberFormat(data.viewCount) + " views • " + data.publishedText

    // nav left elements
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
    const formatted = data.descriptionHtml.replace(/\n/g, '<br>')
    description.insertAdjacentHTML('beforeend', formatted)

    title.addEventListener("click", () => {
        description.classList.toggle("is-open")
    })
    views_time.addEventListener("click", () => {
        description.classList.toggle("is-open")
    })

    // nav right elements
    const dislike_count = document.querySelector("#dislike-count")
    const like_count = document.querySelector("#like-count")
    if (dis_data) {
        dislike_count.innerHTML = numberFormat(dis_data.dislikes)
        like_count.innerHTML = numberFormat(dis_data.likes)
    }
    else {
        like_count.innerHTML = numberFormat(data.likeCount)
    }
    const youtube_link = document.querySelector("#youtube-link")
    youtube_link.href = `${yt_domain}/watch?v=${vid}`
}

export async function videoFetch(vid, api, default_quality) {
    const ret = () => {
        video.removeClass('vjs-waiting')
        return
    }
    if (!api.length)
        api = ["https://invidious.perennialte.ch"]

    const video_param = "/api/v1/videos/"
    let currentIndex = 0

    // dislike fetching
    const fetched_dislike = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${vid}`)
    const dis_data = await fetched_dislike.json()

    // video fetching
    while (currentIndex < api.length) {
        try {
            const fetched = await fetch(api[currentIndex] + video_param + vid)
            const data = await fetched.json()
            if (!ifDep())
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
                BottomLayoutGen(data, dis_data, vid)
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
                `is-warning`,
                5000
            )
        }
    }

    notification(
        `All server are exhausted, Please try again later`,
        `is-danger`,
        7000
    )
}
