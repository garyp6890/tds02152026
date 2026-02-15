function isFunction(x) {
    return Object.prototype.toString.call(x) == '[object Function]';
}

export const debounce = (fn, wait) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    }
}

export const scrollLock = (lock = true) => {
    document.body.classList.toggle('scroll-lock', lock);
}

export const parseHTML = (text) => {
    return new DOMParser().parseFromString(text, 'text/html');
}

export const fetchHTML = (URL) => fetch(URL)
    .then(res => res.text())
    .then(text => parseHTML(text))
    .catch(e => console.error(e));

export const $fetch = async (URL, options) => {
    try {
        if(isFunction(options?.before)) {
            options.before();
        }
        const res = await fetch(options?.params ? `${URL}?${new URLSearchParams(options.params)}` : URL);
        if(options?.nullOn404 && res.status === 404) {
            if(isFunction(options?.after)) {
                options.after();
            }
            return null;
        }
        const doc = await res.text();
        if(isFunction(options?.after)) {
            options.after();
        }
        const $doc = parseHTML(doc); 
        return options?.selectAll ? 
            Array.from($doc.querySelectorAll(options.selectAll)) : 
            options?.select ? $doc.querySelector(options.select) : $doc;

    } catch (error) {
        console.error(error);
        if(isFunction(options?.after)) {
            options.after();
        }
    }
}

export const loadScript = (name) => {
    const src = window.theme.scripts[name];
    const existedScript = document.querySelector(`script[src="${src}"]`);
    return new Promise((res, rej) => {
        if(existedScript) {
            if(existedScript.hasAttribute('loaded')) {
                res();
            } else {
                const observer = new MutationObserver((mList, obs) => {
                    for(const m of mList) {
                        if(m.attributeName === 'loaded') {
                            obs.disconnect();   
                            res();
                        }
                    }
                });
                observer.observe(existedScript, { attributes: true, childList: false, subtree: false });
            }            
        } else {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            document.body.appendChild(script);
            script.onload = () => {
                script.setAttribute('loaded', '');
                res();
            }
        }
    })
}

export const $hide = (element) => {
    element.setAttribute('hidden', '');
}

export const $show = (element) => {
    element.removeAttribute('hidden', '');
}

export const $classListTemp = (element, className, time = 1000) => {
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), time)
}

export const $isEmpty = (element) => {
    if(element.content) {
        element = element.content;
    }
    return element.textContent.trim() === "";
}

export const $isHidden = (element) => element.hasAttribute('hidden');

export const $clone = (element) => element.content.cloneNode(true);

export const $isEqual = (el1, el2) => el1.isEqualNode(el2);

export const $toggleDisplay = (el, state) => {
    if(state === undefined) {
        $isHidden(el) ? $show(el) : $hide(el);
        return;
    }

    state ? $show(el) : $hide(el);
}

export const $replaceContent = (from, to) => {
    const target = to.content || to;
    if (/Firefox|FxiOS/.test(navigator.userAgent)) { // If Firefox
        Array.from(target.querySelectorAll('script'))
            .map(script => {
                const src = script.getAttribute('src');
                if(!!src && !document.querySelector(`script[src="${src}"]`)) {
                    const newScript = document.createElement('script');
                    newScript.src = src;
                    from.appendChild(newScript);
                }
            })
    }
   
    if(!$isEqual(from, target)) {
        from.replaceChildren(...target.cloneNode(true).childNodes);
    }
}

export const $hover = (el, callback) => {
    el.addEventListener('mouseover', (e) => {
        callback(e, true);
    });
    el.addEventListener('mouseleave', (e) => {
        callback(e, false);
    });
}

export const arrEq = (arr1, arr2) => arr1.toString() === arr2.toString();

export const $JSON = (el) => JSON.parse(el.textContent);


const chacheStore = {};

export const cache = {
    get: (item) => {
        return chacheStore[item];
    },
    set: (item, value) => {
        return chacheStore[item] = value;
    },
    list: chacheStore
};

export const Routes = (name) => {
    return window.dynamicURLs[name]
}

export const publishEvent = (eventName, data, sectionId) => {
    const event = new CustomEvent(eventName, {
    	bubbles: false,
        cancelable: true,
        composed: true,
        detail: {
            sectionId,
            data
        }
    })
    document.dispatchEvent(event);
}