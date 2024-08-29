import { GetApi } from "./Instances.js"
import {
    unhandeledRejection,
    printSourceLink
} from "./helper.js"
import {
    video,
    videoFetch,
} from "./Watch.js"

const UrlParams = new URLSearchParams(window.location.search)
let id = UrlParams.get("v")

document.addEventListener('DOMContentLoaded', () => {
    printSourceLink()
    video.addClass('vjs-waiting')
    const api = GetApi()

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

    unhandeledRejection()
})
