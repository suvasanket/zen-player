import { GetApi } from "./Instances.js"
import { watch } from "./Watch.js"
import {
    unhandeledRejection,
    printSourceLink,
    ifDep
} from "./helper.js"

const UrlParams = new URLSearchParams(window.location.search)
let id = UrlParams.get("v")

document.addEventListener('DOMContentLoaded', () => {
    printSourceLink()
    const api = GetApi()

    watch(id, api)
    unhandeledRejection()
    // trap
    if (!ifDep)
        document.querySelector("#video-player").addEventListener('error', e => {
            console.log("this is me" + e.target.error.message)
        })
})
