import {
    notification,
    ifDep,
    numberFormat,
    yt_domain,
    gen,
    spinnerToggle,
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
    loadingSpinner: true,
    bigPlayButton: false
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

    video.play()
    syncAudioVideo()
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

class Comment {
    comment_box = gen("div").class("container is-fluid m-3")
    level = gen("div").class("level")

    channel_logo = gen("a").class("level-item")
        .attr("id", "channel-logo")
        .sty("display: flex; align-items: center; margin-right: 7px; max-width: 35px")
    channel_logo_fig = gen("figure").class("image")
        .sty("height: 35px; width:35px")
    channel_logo_img = gen("img").class("is-rounded")

    right_stuff = gen("div").class("level-item is-flex is-flex-direction-column is-align-items-flex-start")
        .sty("max-width: 100%;")

    comment_header = gen("span").class("icon-text")
    comment_author = gen("span").class("has-text-weight-bold has-text-primary-100")
    badges = gen("span").class("icon")
    verified_icon = gen("i").class("fa-solid fa-circle-check fa-xs mr-1")
    pinned_icon = gen("i").class("fa-solid fa-thumbtack fa-xs").sty("color: #B197FC;")

    comment_content = gen("div")
        .sty("word-break: break-word;")

    comment_footer = gen("span")
    replies = gen("a").class("has-text-weight-bold")
    like_icon = gen("span").class("icon ml-2").inner(`<i class="fa-solid fa-thumbs-up fa-sm"></i>`)
    likes = gen("span").sty("font-size: 13px;")

    source = "source-youtube"

    adder(arg) {
        this.channel_logo_fig.appendChild(this.channel_logo_img)
        this.channel_logo.appendChild(this.channel_logo_fig)

        //top
        if (arg.verified)
            this.badges.appendChild(this.verified_icon)
        if (arg.isPinned)
            this.badges.appendChild(this.pinned_icon)
        this.comment_header.appendChild(this.comment_author)
        this.comment_header.appendChild(this.badges)

        //bottom
        this.comment_footer.appendChild(this.replies)
        this.comment_footer.appendChild(this.like_icon)
        this.comment_footer.appendChild(this.likes)

        // body
        this.right_stuff.appendChild(this.comment_header)
        this.right_stuff.appendChild(this.comment_content)
        this.right_stuff.appendChild(this.comment_footer)

        if (this.channel_logo_img.src)
            this.level.appendChild(this.channel_logo)
        this.level.appendChild(this.right_stuff)

        this.comment_box.appendChild(this.level)
    }
    constructor(arg) {
        let decodedString
        if (arg.kind) {
            if (arg.kind !== "t1")
                return
            decodedString = arg.data.body_html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            this.source = "source-reddit"
        }
        else {
            this.source = "source-youtube"
        }

        if (arg.authorThumbnails)
            this.channel_logo_img.src = arg.authorThumbnails[0].url

        if (this.source === "source-youtube") {
            this.comment_author.innerHTML = arg.author
            this.comment_content.innerHTML = arg.contentHtml
            this.likes.innerHTML = numberFormat(arg.likeCount)
        } else {
            this.comment_author.innerHTML = arg.data.author
            this.comment_content.innerHTML = decodedString
            this.likes.innerHTML = numberFormat(arg.data.score)
        }

        //this.replies.innerHTML = `${arg.replies.replyCount} replies`
        this.replies.innerHTML = `replies`

        this.adder(arg)

        document.getElementById(this.source).appendChild(this.comment_box)
    }

    addToParent(parent) {
        parent.appendChild(this.comment_box)
    }
}
function CommentSectionGen(data) {
    data.comments.forEach(e => {
        const comment = new Comment(e)
        //comment.addToParent(document.querySelector("#comments"))
    })
}

async function videoFetch(vid, api) {
    video.addClass('vjs-waiting')
    if (!api.length)
        api = ["https://invidious.perennialte.ch"]

    const video_param = "/api/v1/videos/"
    let currentIndex = 0

    while (currentIndex < api.length) {
        try {
            const fetched = await fetch(api[currentIndex] + video_param + vid, { signal: AbortSignal.timeout(5000) })
            if (fetched.ok)
                return fetched.json()
            else
                notification(
                    `Internal server issue,<br>Dont't worry we have other servers<br>Attempt: ${currentIndex}`,
                    `is-warning is-size-6`,
                    5000
                )
            currentIndex++
        }
        catch (err) {
            currentIndex++
            notification(
                `Error fetching,<br>Dont't worry we have other servers<br>Attempt: ${currentIndex}`,
                `is-warning is-size-6`,
                5000
            )
        }
    }

    notification(
        `All server are exhausted, Please try again later`,
        `is-danger`,
        7000
    )
    return
}

async function dislikeFetch(vid) {
    const fetched_dislike = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${vid}`)
    return fetched_dislike.json()
}

async function commentsFetch(vid, api, source = "youtube", sort_by = "top", cont) {
    spinnerToggle(document.querySelector("#comments"))
    let i = 0
    while (i < vid.length) {
        try {
            const url = new URL(`${api[i]}/api/v1/comments/${vid}`)
            url.searchParams.append('source', source)
            url.searchParams.append('sort_by', sort_by)
            if (cont)
                url.searchParams.append('source', cont)

            const fetched = await fetch(url)
            if (fetched.ok) {
                spinnerToggle(document.querySelector("#comments"))
                return fetched.json()
            } else {
                spinnerToggle(document.querySelector("#comments"))
                return false
            }
        }
        catch (e) {
            i++
        }
    }
    return
}

function CommentButtons(api, vid) {
    const commentYTButton = document.querySelector("#youtube-comment")
    const commentRedditButton = document.querySelector("#reddit-comment")
    const source_reddit = document.querySelector("#source-reddit")
    const source_youtube = document.querySelector("#source-youtube")

    commentYTButton.addEventListener("click", async () => {
        if (!commentYTButton.classList.contains("is-inverted")) {
            commentYTButton.classList.toggle("is-inverted");
            commentRedditButton.classList.toggle("is-inverted");
        }
        source_reddit.classList.add("is-hidden")
        source_reddit.classList.remove("is-block")
        source_youtube.classList.remove("is-hidden")
        source_youtube.classList.add("is-block")
    });
    commentRedditButton.addEventListener("click", async () => {
        let avail = true
        if (source_reddit.childNodes.length <= 1) {
            const comment_data = await commentsFetch(vid, api, "reddit")
            if (comment_data) {
                source_youtube.classList.add("is-hidden")
                source_reddit.classList.remove("is-hidden")
                source_reddit.classList.add("is-block")
                CommentSectionGen(comment_data)
            }
            else {
                avail = false
                notification(`Sorry, 😢<br>No reddit thread found for this video`, "is-warning is-size-6", 4000)
            }
        }
        else {
            source_youtube.classList.remove("is-block")
            source_youtube.classList.add("is-hidden")
            source_reddit.classList.remove("is-hidden")
            source_reddit.classList.add("is-block")
        }
        if (avail && commentYTButton.classList.contains("is-inverted")) {
            commentYTButton.classList.toggle("is-inverted");
            commentRedditButton.classList.toggle("is-inverted");
        }
    });
}

export async function watch(vid, api) {
    const def_quality = parseInt(vid.charAt(vid.length - 1))
    vid = vid.slice(0, -1)

    const ret = () => {
        video.removeClass('vjs-waiting')
        return
    }

    const vid_data = await videoFetch(vid, api)
    const dis_data = await dislikeFetch(vid)
    const comment_data = await commentsFetch(vid, api)

    if (!ifDep()) {
        console.log(comment_data)
    }

    document.title = vid_data.title
    try {
        PlayVideo(vid_data.adaptiveFormats, vid_data.formatStreams, def_quality)
        ret()
    }
    catch (err) {
        console.error("Error Playing Video: ", err)
        ret()
    }

    try {
        BottomLayoutGen(vid_data, dis_data, vid)
        ret()
    }
    catch (err) {
        console.error("Error Bottom Layout Generation: ", err)
        ret()
    }
    CommentSectionGen(comment_data)
    CommentButtons(api, vid);

    return
}
