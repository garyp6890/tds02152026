const { Core, Store, Events } = Global;

const STORE_KEY = 'dark-mode';
const DARK_MODE_CN = 'glob--theme-dark-mode';

function transitionControl() {
    const styleElement = document.createElement("style");
    const transitionCSSRule = document.createTextNode(`
        * {
            transition: 0s !important;
        }`
    );
    
    styleElement.appendChild(transitionCSSRule);

    return function(disableTransitions = true) {
        if (disableTransitions) {
            document.head.appendChild(styleElement);
            return;
        }

        // Sanity check to avoid NotFoundError if 'styleElement' already removed
        if (document.head.contains(styleElement)) {
            document.head.removeChild(styleElement);
        }
    }
}

const disableTransitions = transitionControl();

customElements.define('dark-mode-switch', class extends Core {
    propTypes = {
        'main-color-scheme-cn': String,
        'dark-color-scheme-cn': String
    }

    elements = {
        $: ['switch']
    }

    MAIN_COLOR_SCHEME_CN = this.prop('main-color-scheme-cn');
    DARK_COLOR_SCHEME_CN = this.prop('dark-color-scheme-cn');

    render() {
        this.sub(Events.DARK_MODE_CHANGE, this._syncSwitchers);
        this.$('switch', {
            change: this._handleChange
        })
        this._init();
    }

    _init() {
        if ((this.darkModeState === null && this.isOSDarkMode) || Boolean(this.darkModeState)) {
            this.$('switch').checked = true;
            this._toggleDarkMode();
        }
    }

    _handleChange({ target }) {
        this._toggleDarkMode(target.checked);
        this.pub(Events.DARK_MODE_CHANGE, target.checked);
    }

    _toggleDarkMode(state = true) {
        requestAnimationFrame(() => {
            disableTransitions();
            setTimeout(() => {
                this._toggleClassNames(state);
                setTimeout(() => {
                    disableTransitions(false);
                }, 0)
            }, 0);
        });

        Store.set(STORE_KEY, state ? 1 : 0);
    }

    _toggleClassNames(state) {
        document.body.classList.replace(
            state ? this.MAIN_COLOR_SCHEME_CN : this.DARK_COLOR_SCHEME_CN,
            state ? this.DARK_COLOR_SCHEME_CN : this.MAIN_COLOR_SCHEME_CN
        );
        document.body.classList.toggle(DARK_MODE_CN, state);
    }

    _syncSwitchers(state) {
        if (this.$('switch').checked !== state) {
            this.$('switch').checked = state;
        }
    }

    get darkModeState() {
        return Store.get(STORE_KEY);
    }

    get isOSDarkMode() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
});