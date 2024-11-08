import {
    notification,
    ifDep,
    numberFormat,
    yt_domain,
    gen,
    spinnerToggle,
} from './helper.js'
import { pushEndPoint } from './Instances.js'

const source = 'piped'
export const video = videojs('video-player', {
    controlBar: {
        children: [
            'playToggle',
            'skipBackward',
            'skipForward',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'remainingTimeDisplay',
            'volumePanel',
            'pictureInPictureToggle',
            'QualitySelector',
            'fullscreenToggle',
        ],
    },
    loadingSpinner: true,
    bigPlayButton: false,
})

function video_audioSeparator(arr) {
    let video_adaptiveFormats = []
    let audio_adaptiveFormats = []
    const regex = /(audio\/|video\/)/

    arr.forEach((e) => {
        const type = e.type.match(regex)
        if (type[0] === 'audio/') audio_adaptiveFormats.push(e)
        if (type[0] === 'video/') video_adaptiveFormats.push(e)
    })
    return [audio_adaptiveFormats, video_adaptiveFormats]
}
function webm_mp4Separator(arr) {
    let webm = []
    let mp4 = []
    const regex = /(audio|video)\/([^;]+)/
    const match = e => e.match(regex)
    arr.forEach((e) => {
        const typed = match(e.type || e.mimeType)
        if (typed[2] === 'webm') webm.push(e)
        if (typed[2] === 'mp4') mp4.push(e)
    })
    return [webm, mp4]
}
function QualitySort(arr) {
    if (arr.length <= 1) return arr
    let pivot = arr[0]

    let leftArr = []
    let rightArr = []
    const label = (el) => {
        const label = el.quality || el.qualityLabel
        const match = label.match(/\d+/);
        return Number(match)
    }

    for (let i = 1; i < arr.length; i++) {
        if (label(pivot) < label(arr[i])) rightArr.push(arr[i])
        else leftArr.push(arr[i])
    }
    const leftSort = QualitySort(leftArr)
    const rightSort = QualitySort(rightArr)
    return [...leftSort, pivot, ...rightSort]
}

function qualityExtract(arr, def) {
    let res = []
    arr = QualitySort(arr)
    def = getDefaultQuality(def, arr)
    arr.forEach((e) => {
        const obj = {}
        const qualityLabel = e.qualityLabel || e.quality
        const url = e.url

        if (qualityLabel === def) obj.selected = true
        if (url) obj.src = url
        if (qualityLabel) obj.label = qualityLabel
        obj.type = e.type || e.mimeType
        res.push(obj)
    })
    return res
}

function playVideo_sourceDefiner(video_res) {
    let audio_arr, video_arr

    if (source === 'piped') {
        audio_arr = video_res.audioStreams
        video_arr = video_res.videoStreams
    } else {
        const adaptiveFormats = video_res.adaptiveFormats
        const extractedFormats = video_audioSeparator(adaptiveFormats)
        audio_arr = extractedFormats[0]
        video_arr = extractedFormats[1]
    }

    const webm_vid = webm_mp4Separator(video_arr)[0]
    const mp4_vid = webm_mp4Separator(video_arr)[1]
    const webm_aud = webm_mp4Separator(audio_arr)[0]
    const mp4_aud = webm_mp4Separator(audio_arr)[1]

    const player_vid = webm_vid.length ? webm_vid : mp4_vid
    const player_aud = webm_aud.length ? webm_aud : mp4_aud

    return { player_aud, player_vid }
}

function getDefaultQuality(def, arr) {
    let quality, som

    if (sessionStorage.getItem('fetchingSpeed') !== null)
        fetchingSpeed = Number(sessionStorage.getItem('fetchingSpeed'))
    console.log(fetchingSpeed)
    if (def === 1 || fetchingSpeed < 0.5) return arr[0].qualityLabel || arr[0].quality
    else if (def === 2 || fetchingSpeed > 25) return arr[arr.length - 1].qualityLabel || arr[arr.length - 1].quality
    else if (fetchingSpeed < 1) quality = 240
    else if (fetchingSpeed < 2.5) quality = 360
    else if (fetchingSpeed < 5) quality = 480
    else if (fetchingSpeed < 10) quality = 720
    else if (fetchingSpeed < 20) quality = 1080
    else if (fetchingSpeed < 25) quality = 1440

    arr.forEach(e => {
        const label = e.qualityLabel || e.quality
        const match = label.match(/\d+/)
        if (match <= quality)
            som = label
    })
    return som
}

function PlayVideo(video_res, default_quality) {
    video.removeClass('vjs-waiting')
    const { player_aud, player_vid } = playVideo_sourceDefiner(video_res)

    let audio = new Audio(player_aud[0].url)
    const videoSrc = qualityExtract(player_vid, default_quality)
    console.log(videoSrc)
    video.src(videoSrc)

    // video-audio sync
    function syncAudioVideo() {
        if (Math.abs(audio.currentTime - video.currentTime) > 0.1) {
            if (audio.currentTime < video.currentTime) {
                audio.currentTime = video.currentTime
            } else {
                video.currentTime = audio.currentTime
            }
        }
        requestAnimationFrame(syncAudioVideo)
    }

    video.on('play', () => syncAudioVideo())
    video.on('pause', () => {
        video.pause()
        audio.pause()
    })
    video.on('seeking', () => (audio.currentTime = video.currentTime()))
    video.on('timeupdate', syncAudioVideo)
    video.on('loadstart', () => audio.pause())
    video.on('volumechange', () => (audio.volume = video.volume()))
    video.on('playing', () => {
        audio.play()
        syncAudioVideo()
    })
    video.on('qualitySelected', () => (audio.currentTime = video.currentTime()))
    let retries = 0
    video.on('error', function() {
        const error = video.error()
        while (retries < 3) {
            if (error && error.code === 4) {
                notification(`Retrying please wait...`, `is-warning`, 2000)
                setTimeout(() => {
                    video.load()
                    retries++
                }, 3000)
            }
        }
    })
        ; (() => {
            video.play()
            syncAudioVideo()
        })()
}

const removeSkele = (element) => element.classList.remove('has-skeleton')
function BottomLayoutGen(data, dis_data, vid) {
    const title = document.querySelector('#title')
    removeSkele(title)
    title.innerHTML = data.title

    const views_time = document.querySelector('#views-timeago')
    removeSkele(views_time)
    views_time.innerHTML =
        numberFormat(data.viewCount) + ' views • ' + data.publishedText

    // nav left elements
    const channel_logo_img = document.querySelector('#channel-logo-img')
    removeSkele(channel_logo_img)
    channel_logo_img.src = data.authorThumbnails[2].url

    const channel_name = document.querySelector('#channel-name')
    removeSkele(channel_name)
    channel_name.innerHTML = data.author

    const subs = document.querySelector('#subs')
    removeSkele(subs)
    subs.innerHTML = data.subCountText + ' subscribers'

    const description = document.querySelector('#description')
    const formatted = data.descriptionHtml.replace(/\n/g, '<br>')
    description.insertAdjacentHTML('beforeend', formatted)

    title.addEventListener('click', () => {
        description.classList.toggle('is-open')
    })
    views_time.addEventListener('click', () => {
        description.classList.toggle('is-open')
    })

    // nav right elements
    const dislike_count = document.querySelector('#dislike-count')
    const like_count = document.querySelector('#like-count')
    if (dis_data) {
        dislike_count.innerHTML = numberFormat(dis_data.dislikes)
        like_count.innerHTML = numberFormat(dis_data.likes)
    } else {
        like_count.innerHTML = numberFormat(data.likeCount)
    }
    const youtube_link = document.querySelector('#youtube-link')
    youtube_link.href = `${yt_domain}/watch?v=${vid}`
}

class Comment {
    comment_box = gen('div').class('container is-fluid m-3')
    level = gen('div').class('level')

    channel_logo = gen('a')
        .class('level-item')
        .attr('id', 'channel-logo')
        .sty(
            'display: flex; align-items: center; margin-right: 7px; max-width: 35px',
        )
    channel_logo_fig = gen('figure')
        .class('image')
        .sty('height: 35px; width:35px')
    channel_logo_img = gen('img').class('is-rounded')

    right_stuff = gen('div')
        .class(
            'level-item is-flex is-flex-direction-column is-align-items-flex-start',
        )
        .sty('max-width: 100%;')

    comment_header = gen('span').class('icon-text')
    comment_author = gen('span').class(
        'has-text-weight-bold has-text-primary-100',
    )
    badges = gen('span').class('icon')
    verified_icon = gen('i').class('fa-solid fa-circle-check fa-xs mr-1')
    pinned_icon = gen('i')
        .class('fa-solid fa-thumbtack fa-xs')
        .sty('color: #B197FC;')

    comment_content = gen('div').sty('word-break: break-word;')

    comment_footer = gen('span')
    replies = gen('a').class('has-text-weight-bold')
    like_icon = gen('span')
        .class('icon ml-2')
        .inner(`<i class="fa-solid fa-thumbs-up fa-sm"></i>`)
    likes = gen('span').sty('font-size: 13px;')

    source = 'source-youtube'

    adder(arg) {
        this.channel_logo_fig.appendChild(this.channel_logo_img)
        this.channel_logo.appendChild(this.channel_logo_fig)

        //top
        if (arg.verified) this.badges.appendChild(this.verified_icon)
        if (arg.isPinned) this.badges.appendChild(this.pinned_icon)
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

        if (this.channel_logo_img.src) this.level.appendChild(this.channel_logo)
        this.level.appendChild(this.right_stuff)

        this.comment_box.appendChild(this.level)
    }
    constructor(arg) {
        let decodedString
        if (arg.kind) {
            if (arg.kind !== 't1') return
            decodedString = arg.data.body_html
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
            this.source = 'source-reddit'
        } else {
            this.source = 'source-youtube'
        }

        if (arg.authorThumbnails)
            this.channel_logo_img.src = arg.authorThumbnails[0].url

        if (this.source === 'source-youtube') {
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
    data.comments.forEach((e) => {
        const comment = new Comment(e)
        //comment.addToParent(document.querySelector("#comments"))
    })
}

let fetchingSpeed = 0
function detectSpeed(start, end) {
    const size = 62475 //error : 1039 ok : 62475

    const durationSec = (end - start) / 1000
    const loadedBits = size * 8
    const inBps = (loadedBits / durationSec).toFixed(2)
    const inKbps = (inBps / 1024).toFixed(2)
    const inMbps = (inKbps / 1024).toFixed(2)

    if (sessionStorage.getItem('fetchingSpeed') === null)
        sessionStorage.setItem('fetchingSpeed', String(inMbps))
    fetchingSpeed = inMbps
}

async function videoFetch(vid, api) {
    video.addClass('vjs-waiting')
    if (!api.length)
        notification(
            `It seems there is no end-points available<br>go back then do a refresh`,
            `is-danger`,
            4000,
        )

    const video_param = source === 'piped' ? '/streams/' : '/api/v1/videos/'
    let currentIndex = 0

    while (currentIndex < api.length) {
        try {
            const beforeFetch = new Date().getTime()
            const fetched = await fetch(api[currentIndex] + video_param + vid, {
                signal: AbortSignal.timeout(9000),
            })
            const afterFetch = new Date().getTime()

            if (fetched.ok) {
                pushEndPoint(api[currentIndex])
                detectSpeed(beforeFetch, afterFetch)
                return fetched.json()
            } else {
                data.then((e) => console.log(e))
                notification(
                    `server error, retrying with others<br>${currentIndex}try`,
                    `is-warning is-size-6`,
                    5000,
                )
                currentIndex++
            }
        } catch (err) {
            currentIndex++
            notification(
                `Error fetching,<br>Dont't worry we have other servers<br>Attempt: ${currentIndex}`,
                `is-warning is-size-6`,
                5000,
            )
        }
    }

    notification(
        `All server are exhausted, Please try again later`,
        `is-danger`,
        7000,
    )
    return
}

async function dislikeFetch(vid) {
    const fetched_dislike = await fetch(
        `https://returnyoutubedislikeapi.com/votes?videoId=${vid}`,
    )
    return fetched_dislike.json()
}

async function commentsFetch(
    vid,
    api,
    source = 'youtube',
    sort_by = 'top',
    cont,
) {
    spinnerToggle(document.querySelector('#comments'))
    let i = 0
    while (i < vid.length) {
        try {
            const url = new URL(`${api[i]}/api/v1/comments/${vid}`)
            url.searchParams.append('source', source)
            url.searchParams.append('sort_by', sort_by)
            if (cont) url.searchParams.append('source', cont)

            const fetched = await fetch(url)
            if (fetched.ok) {
                spinnerToggle(document.querySelector('#comments'))
                return fetched.json()
            } else {
                spinnerToggle(document.querySelector('#comments'))
                return false
            }
        } catch (e) {
            i++
        }
    }
    return
}

let isAtBottom = false
function CommentHelper(api, vid) {
    const commentYTButton = document.querySelector('#youtube-comment')
    const commentRedditButton = document.querySelector('#reddit-comment')
    const topButton = document.querySelector('#top-comment')
    const newButton = document.querySelector('#new-comment')
    const source_reddit = document.querySelector('#source-reddit')
    const source_youtube = document.querySelector('#source-youtube')

    let source = 'youtube'

    const toggleInvert = (button1, button2) => {
        if (!button1.classList.contains('is-inverted')) {
            button1.classList.toggle('is-inverted')
            button2.classList.toggle('is-inverted')
        }
    }

    commentYTButton.addEventListener('click', async () => {
        source = 'youtube'
        toggleInvert(commentYTButton, commentRedditButton)

        source_reddit.classList.add('is-hidden')
        source_reddit.classList.remove('is-block')
        source_youtube.classList.remove('is-hidden')
        source_youtube.classList.add('is-block')
    })
    commentRedditButton.addEventListener('click', async () => {
        let avail = true
        if (source_reddit.childNodes.length <= 1) {
            const comment_data = await commentsFetch(vid, api, 'reddit')
            if (comment_data) {
                source = 'reddit'
                source_youtube.classList.add('is-hidden')
                source_reddit.classList.remove('is-hidden')
                source_reddit.classList.add('is-block')
                CommentSectionGen(comment_data)
            } else {
                avail = false
                notification(
                    `Sorry, 😢<br>No reddit thread found for this video`,
                    'is-warning is-size-6',
                    4000,
                )
            }
        } else {
            source_youtube.classList.remove('is-block')
            source_youtube.classList.add('is-hidden')
            source_reddit.classList.remove('is-hidden')
            source_reddit.classList.add('is-block')
        }
        if (avail && commentYTButton.classList.contains('is-inverted')) {
            commentYTButton.classList.toggle('is-inverted')
            commentRedditButton.classList.toggle('is-inverted')
        }
    })

    topButton.addEventListener('click', async () => {
        toggleInvert(topButton, newButton)
        if (source === 'youtube') {
            source_youtube.innerHTML = ''
            const comment_data = await commentsFetch(vid, api, source, 'top')
            CommentSectionGen(comment_data)
        } else {
            source_reddit.innerHTML = ''
            const comment_data = await commentsFetch(vid, api, source, 'top')
            CommentSectionGen(comment_data)
        }
    })
    newButton.addEventListener('click', async () => {
        toggleInvert(newButton, topButton)
        if (source === 'youtube') {
            source_youtube.innerHTML = ''
            const comment_data = await commentsFetch(vid, api, source, 'new')
            CommentSectionGen(comment_data)
        } else {
            source_reddit.innerHTML = ''
            const comment_data = await commentsFetch(vid, api, source, 'new')
            CommentSectionGen(comment_data)
        }
    })

    window.addEventListener('scroll', function() {
        const scrollPosition = window.innerHeight + window.scrollY
        const bodyHeight = document.body.offsetHeight

        if (scrollPosition >= bodyHeight - 5 && !isAtBottom) {
            isAtBottom = true
        } else if (scrollPosition < bodyHeight - 5) {
            isAtBottom = false
        }
    })
}

export async function watch(v_id, api) {
    const def_quality = parseInt(v_id.charAt(v_id.length - 1))
    v_id = v_id.slice(0, -1)

    const ret = () => {
        video.removeClass('vjs-waiting')
        return
    }

    const video_res = await videoFetch(v_id, api)
    //const dislike_res = await dislikeFetch(vid)
    //const comment_res = await commentsFetch(vid, api)

    if (!ifDep()) {
        //console.log(video_res)
        //console.log(fetchingSpeed)
    }

    if (video_res) {
        document.title = video_res.title
        try {
            PlayVideo(video_res, def_quality)
            ret()
        } catch (err) {
            console.error('Error Playing Video: ', err)
            ret()
        }

        //try {
        //    BottomLayoutGen(video_res, dislike_res, vid)
        //    ret()
        //}
        //catch (err) {
        //    console.error("Error Bottom Layout Generation: ", err)
        //    ret()
        //}
        //CommentSectionGen(comment_res)
        //CommentHelper(api, vid);
    }
}
