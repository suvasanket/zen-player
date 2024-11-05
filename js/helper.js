const gh_domain = "suvasanket.github.io"

export const yt_domain = "https://www.youtube.com"
export const piped_domain = 'https://piped.video'

export const cobalt_api = "https://api.cobalt.tools/api/json"
//export const piped_api = 'https://pipedapi.kavin.rocks/'
export const piped_api = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.yt',
    'https://pipedapi-libre.kavin.rocks',
    'https://pipedapi.r4fo.com',
    'https://piped-api.lunar.icu',
]
export const timeoutlen = 5000
export const ifDep = () => window.location.hostname === gh_domain
export function ifOnline(callback) {
    if (window.navigator.onLine)
        callback()
    else
        notification(`No Internet Connection available 😭`, `is-danger`, 5000)
}

export function modal_detector_loader() {
    function openModal($el) {
        document.querySelector("HTML").classList.add('is-clipped');
        $el.classList.add('is-active');
    }

    function closeModal($el) {
        document.querySelector("HTML").classList.remove('is-clipped');
        $el.classList.remove('is-active');
    }

    function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
            closeModal($modal);
        });
    }

    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.downloader-trigger') || []).forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        const $target = document.getElementById(modal);

        $trigger.addEventListener('click', () => {
            openModal($target);
        });
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');

        $close.addEventListener('click', () => {
            closeModal($target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });
}

export function notification_detector_loader() {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
        const $notification = $delete.parentNode;

        $delete.addEventListener('click', () => {
            $notification.parentNode.removeChild($notification);
            if (!document.querySelector(".notification"))
                document.querySelector('#notification-center').remove()
        });
    });
}

export function getTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light'
    }
    else {
        return 'dark'
    }
}
export function gen(tag) {
    let element = document.createElement(tag)
    element.attr = function(attr, val) {
        this.setAttribute(attr, val)
        return this
    }
    element.class = function(val) {
        this.setAttribute("class", val)
        return this
    }
    element.sty = function(val) {
        this.setAttribute("style", val)
        return this
    }
    element.inner = function(val) {
        this.innerHTML = val
        return this
    }
    return element
}

export function notification(content, Class, duration) {
    let notification_center = document.querySelector("#notification-center")
    if (!notification_center) {
        notification_center = gen("div").attr("id", "notification-center")
        document.body.appendChild(notification_center)
    }

    const notification = gen("div").class(`notification is-family-monospace is-${getTheme()} ` + Class)
    const botton = gen("button").class("delete")
    const cont = gen("p")
    cont.innerHTML = content
    notification.appendChild(botton)
    notification.appendChild(cont)

    notification_center.appendChild(notification)

    if (duration) {
        setTimeout(() => {
            notification.remove()
            if (!document.querySelector(".notification"))
                notification_center.remove()
        }, duration)
        notification_detector_loader()
    }
}

export function stringLimit(str, maxLength = 10) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + "..";
    }
    return str;
}

export function timeFormat(sec) {
    if (sec == -1) return "live"
    sec = Number(sec);
    var h = Math.floor(sec / 3600);
    var m = Math.floor(sec % 3600 / 60);
    var s = Math.floor(sec % 3600 % 60);

    var hDisplay = h > 0 ? (h < 10 ? "0" + h + ":" : h + ":") : "";
    var mDisplay = m > 0 ? (m < 10 ? "0" + m + ":" : m + ":") : "";
    var sDisplay = s >= 0 ? (s < 10 ? "0" + s : s) : "";

    if (mDisplay === "" && sDisplay !== "") return "0:" + sDisplay

    return hDisplay + mDisplay + sDisplay;
}

export function numberFormat(views) {
    let bil = 1000000000
    let mil = 1000000
    let thousand = 1000

    if (views > bil) {
        return Math.round(views / bil) + "B"
    }
    else if (views > mil) {
        return Math.round(views / mil) + "M"
    }
    else if (views > thousand) {
        return Math.round(views / thousand) + "K"
    }
    else {
        return views.toString()
    }
}

export function getUrl(src) {
    src = src[0] !== '/' ? '/' + src : src
    if (window.location.hostname === gh_domain)
        return "/zen-player" + src
    return src
}

export function printSourceLink() {
    if (ifDep())
        console.log(`
 _______________________________
/ If you want to change         \\
\\ anything, checkout the source /
 -------------------------------
   \\
    \\
     \\
                '-.
      .---._     \\ .--'
    /       \`-..__)  ,-'
   |    0           /
    --.__,   .__.,\`
     \`-.___'._\\_.'

Source: "https://github.com/suvasanket/zen-player"
`);
}

export function unhandeledRejection() {
    window.addEventListener('unhandledrejection', () => {
        notification(
            `something went wrong!`,
            `is-danger`,
            10000
        )
    })
}

export function spinnerToggle(parent) {
    const spinner = parent.querySelector(".spinner")
    if (!spinner) {
        const spinner = gen("div").class("spinner")
        parent.appendChild(spinner)
    }
    else {
        spinner.remove()
    }
}
export function spinnerStop(parent) {
    const spinner = parent.querySelector('.spinner');
    if (spinner){
        spinner.remove()
    }
}
export function getInternetSpeed(start, end) {
    const size = 62475 //error : 1039 ok : 62475

    const durationSec = (end - start) / 1000
    const loadedBits = size * 8
    const inBps = (loadedBits / durationSec).toFixed(2)
    const inKbps = (inBps / 1024).toFixed(2)
    const inMbps = (inKbps / 1024).toFixed(2)

    fetchingSpeed = inMbps
}
