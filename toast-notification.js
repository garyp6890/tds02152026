const { Core, Events, Utils, TopLayerStack } = Global;
const { $active } = Utils;

const AUTOCLOSE_TIMEOUT = 5000;
const ANIMATION_DURATION = 300;

const animationsComplete = element =>
    Promise.allSettled(
        element.getAnimations().map(animation => 
        animation.finished)
    )
 
customElements.define('toast-notification', class extends Core {
    elements = {
        $: ['popover', 'msg', 'title', 'close']
    }

    isClone = false;

    render() {
        this.usePopover = true;
        // Check for popover compatibility
        if (!this.showPopover) {
            this.classList.add('@toasts');
            this.usePopover = false;
        }
        this.sub(Events.TOAST_NOTIFICATION, this._handleNotification, { global: true });
        this.sub(Events.CLOSE_TOAST_NOTIFICATION, this._close, { global: true });
        this.$('close', { click: this._close });
    }

    async _handleNotification({ type, msg, title, autoclose }) {
        if (this.showing) {
            await this._close();
        }
        if (!msg && !title) {
            return;
        }
        this.title = title || '';
        this.msg = msg && msg !== title && typeof msg === 'string' ? msg : '';
        this.type = type || '';
        if (autoclose || autoclose === undefined) {
            this.autoclose = true
        } else {
            this.autoclose = false
        }
        setTimeout(() => {
            TopLayerStack.isEmpty ? this._show() : this._showInTopLayer();
        }, 20);
    }

    _showInTopLayer() {
        if (this.isClone) {
            return
        };
        const [$topLayer, onRemove] = TopLayerStack.last;
        const toastClone = $topLayer.appendChild(this.cloneNode(true));
        onRemove(() => toastClone.remove());
        toastClone.isClone = true; 
        toastClone.autoclose = this.autoclose;
        toastClone._show();
    }

    async _close() {
        this.usePopover ? await this._closePopover() : await this._closeToast();
        if (this.isClone) {
            this.remove();
        }
    }

    _show() {
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
        }
        if (this.autoclose) {
            this.showTimeout = setTimeout(() => {
                this._close();
            }, AUTOCLOSE_TIMEOUT);
        }
        this.usePopover ? this.$('popover').showPopover() : $active(this, true);
        this.showing = true;
    }

    async _closePopover() {
        this.popoverClosing = true;
        await animationsComplete(this.$('popover'));
        this.popoverClosing = false;
        this.$('popover')?.hidePopover();
        this.showing = false;
    }

    async _closeToast() {
        clearInterval(this.activeToastTimeout);
        $active(this, false);
        return new Promise(resolve => {
            setTimeout(() => {
                this.showing = false;
                resolve();
            }, ANIMATION_DURATION);
        });
    }

    set type(value) {
        this.dataset.type = value;
    }
    set msg(value) {
        this.$('msg').innerText = value;
    }
    set title(value) {
        this.$('title').innerText = value;
    }
    set popoverClosing(state) {
        this.toggleAttribute('closing', state);
    }
});