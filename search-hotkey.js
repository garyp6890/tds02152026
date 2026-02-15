const { Core, Utils } = Global;
const { $show } = Utils;

const SEARCH_INPUT_SELECTOR = '[data-element="search-input"]';
const SEARCH_HOTKEY_CODE = 'KeyK';
customElements.define('search-hotkey', class extends Core {
    elements = {
        $: ['content', 'cmd-icon', 'ctrl-text', 'placeholder']
    }

    propTypes = {
        'modal-search': Boolean
    }

    render() {
        if (this.isMobileDevice) {
            this.remove();
            return;
        }

        if(this.isMacOS) {
            this._showContent(this.$('cmd-icon'));
            this.controlKey = 'metaKey';
        } else {
            this._showContent(this.$('ctrl-text'));
            this.controlKey = 'ctrlKey';
        }
        this.$searchForm = this.parentNode;
        this.$searchInput = this.$searchForm.querySelector(SEARCH_INPUT_SELECTOR);
        this._handleHotkey = this._handleHotkey.bind(this);
        document.addEventListener('keydown', this._handleHotkey);
    }

    _showContent(elem) {
        this.prop('modal-search') && this.$('placeholder').remove();
        $show(elem);
        $show(this.$('content'));
    }

    _handleHotkey(e) {
        if (e[this.controlKey] && e.code === SEARCH_HOTKEY_CODE) {
            e.preventDefault();
            this.prop('modal-search')
                ? this.click() //Triggered modal-open element when search as icon enabled
                : this.$searchInput.focus();
        }
    }

    destroy() {
        document.removeEventListener('keydown', this._handleHotkey);
    }

    get isMacOS() {
        return navigator.userAgent.indexOf('Mac') !== -1;
    }

    get isMobileDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
});