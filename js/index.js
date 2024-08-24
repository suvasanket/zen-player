import { HeaderGenerator } from "./common.js"
import { piped_fetch } from "./thumbnails.js"
import {
    modal_detector_loader,
    notification_detector_loader,
} from "./helper.js"
import { LoadApi } from "./Instances.js"

LoadApi()

// header load
HeaderGenerator()

// Get initial query parameter
const inputField = document.querySelector("#input")
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");
if (query) {
    inputField.value = query
}

//initial page load
piped_fetch(query)

// load some loader
document.addEventListener('DOMContentLoaded', () => {
    modal_detector_loader()
    notification_detector_loader()
})
