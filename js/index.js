import { piped_fetch } from "./Home_Search.js"
import { LoadApi } from "./Instances.js"
import {
    modal_detector_loader,
    notification_detector_loader,
} from "./helper.js"

const inputField = document.querySelector("#input")
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");
if (query) {
    inputField.value = query
}

document.addEventListener('DOMContentLoaded', () => {
    LoadApi()
    modal_detector_loader()
    notification_detector_loader()

    piped_fetch(query)
})
