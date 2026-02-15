const { Core, Store, DOMEvents, Utils } = Global;
const { $show, $hide } = Utils;

const STORE_KEY = 'newsletter';

const animationsComplete = element =>
    Promise.allSettled(
        element.getAnimations().map(animation => animation.finished)
    )

customElements.define('newsletter-popup', class extends Core {  
    propTypes = {
        'display-delay': Number,
        'timeout': Number,
        'use-popover': Boolean,
        'floating-button': Boolean
    }

    elements = {
        'modal': 'modal-container',
        $: ['popover', 'close-button', 'floating-button', 'floating-button-close']
    }

    render() {
        this._initPopup();
    }

    _initPopup() {
        if (!this.wasViewed || this.timeoutOver) { 
            this.wasViewed = Date.now();
            this._show();
        }
    }

    _show() {
        setTimeout(() => {
            this.prop('floating-button') ? this._showFloatingButton() : this._openPopup();
        }, this.prop('display-delay'));
    }

    _openPopup() {
        this.prop('use-popover') 
            ? this._showPopover()
            : this.$('modal').dispatchEvent(DOMEvents.MODAL_OPEN);
    }
    
    _showFloatingButton() {
        this.$('floating-button-close', { click: this._hideFloatingButton });
        this.$('floating-button', { click: this._onTriggerClick });
        $show(this.$('floating-button'));
    }

    _hideFloatingButton(e) {
        e.stopPropagation();
        $hide(this.$('floating-button'));
    }
    
    _onTriggerClick() {
        this._openPopup();
        $hide(this.$('floating-button'));
    }

    async _closePopover(e) {
        this.popoverClosing = true;
        await animationsComplete(this.$('popover'));
        this.popoverClosing = false;
        this.$('popover').hidePopover();
    }

    _showPopover() {
        this.$('popover').showPopover();
        this.$('close-button', { click: this._closePopover });
    }

    set popoverClosing(state) {
        this.toggleAttribute('closing', state);
    }

    get timeoutOver() {
        return Date.now() >= (this.wasViewed + this.prop('timeout'));
    }

    get wasViewed() {
        return Store.get(STORE_KEY);
    }
      
    set wasViewed(value) {
        Store.set(STORE_KEY, value);
    }
});