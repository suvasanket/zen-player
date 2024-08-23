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

export function notification(content, duration, Class) {
    const notification = gen("div").attr("class", "notification is-family-monospace " + Class)
    const botton = gen("button").attr("class", "delete")
    const cont = gen("p")
    cont.innerHTML = content
    notification.appendChild(botton)
    notification.appendChild(cont)

    notification.style.position = 'fixed'
    notification.style.top = '10px'
    notification.style.right = '10px'
    notification.style.zIndex = '1000'
    notification.style.maxWidth = '500px'

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.remove()
    }, duration)
    notification_detector_loader()
}

