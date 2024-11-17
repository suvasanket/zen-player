import { SearchLoad } from "./Home_Search.js"
import { GetApi, LoadApi, CookieGetItem } from "./Instances.js"
import {
    modal_detector_loader,
    notification_detector_loader,
    unhandeledRejection,
    printSourceLink,
} from "./helper.js"

const inputField = document.querySelector("#input")
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");
if (query) {
    inputField.value = query
}

document.addEventListener('DOMContentLoaded', () => {
    printSourceLink()
    if (CookieGetItem('endpoint_urls') === null)
        LoadApi()
    //console.log(GetApi())

    modal_detector_loader()
    notification_detector_loader()

    SearchLoad(query)
    unhandeledRejection()
})
