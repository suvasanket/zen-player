const gh_domain = "suvasanket.github.io"

const individous_instance = [
    "https://yewtu.be",
    "https://iv.ggtyler.dev",
    "https://invidious.perennialte.ch",
]
export const yt_domain = "https://www.youtube.com"
export const piped_domain = 'https://piped.video'
export const invidious_domain = individous_instance[0]

export const cobalt_api = "https://api.cobalt.tools/api/json"
export const piped_api = 'https://pipedapi.kavin.rocks/'

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

    const notification = gen("div").attr("class", `notification is-family-monospace is-${getTheme()} ` + Class)
    const botton = gen("button").attr("class", "delete")
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

export function ifDev(fun) {
    if (window.location.hostname !== gh_domain)
        fun()
}
export function unhandeledRejection() {
    window.addEventListener('unhandledrejection', event => {
        notification(
            `${event.reason}<br>If you think you can fix it, open the console`,
            `is-danger`,
            100000
        )
    })
}
