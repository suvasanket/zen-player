import { GetApi } from "./Instances.js"
import { watch } from "./Watch.js"
import {
    unhandeledRejection,
    printSourceLink,
    ifOnline,
} from "./helper.js"

const UrlParams = new URLSearchParams(window.location.search)
let id = UrlParams.get("v")

document.addEventListener('DOMContentLoaded', () => {
    printSourceLink()

    ifOnline(() => {
        const api = GetApi()
        watch(id, api)
    })
    //unhandeledRejection()
})
