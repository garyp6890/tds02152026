const { Core, Utils, DOMEvents, Events, TopLayerStack } = Global;
const { $fetch, $replaceContent, $active } = Utils;

const ENTER_KEYCODE = 13;

const animationsComplete = element =>
  Promise.allSettled(
    element.getAnimations().map(animation => 
      animation.finished))

customElements.define('modal-container', class extends Core {
    elements = {
        $: ['dialog', 'content', 'spinner']
    }

    propTypes = {
        'remote-url': String,
        'remote-target': String,
        'remote-detach': Boolean,
        // 'top-layer': Boolean,
    }

    render() {
        this.$('dialog', {
            click: this._handleBackdropClick
        })

        this.$({
            'modal-close': this._close,
            'modal-open': this._open
        })
    }

    open() {
        // this.dispatchEvent(DOMEvents[this.prop('top-layer') ? 'MODAL_OPEN' : 'MODAL_SHOW']);
        this.dispatchEvent(DOMEvents.MODAL_OPEN);
    }

    close() {
        this.dispatchEvent(DOMEvents.MODAL_CLOSE);
    }

    refreshLayer() {
        this.$('dialog').close();
        this.$('dialog').showModal();
    }

    _handleBackdropClick({ target }) {
        if(target === this.$('dialog')) {
            this.dispatchEvent(DOMEvents.MODAL_CLOSE);
        }
    }
    
    async _loadRemoteContent() {
        // TODO: handle errors for user
        try {
            this.$remoteContent = await $fetch(this.prop('remote-url'), {
                before: this._loading(true),
                after: this._loading(false),
                select: this.prop('remote-target')
            });
        } catch(err) {
            console.error(err);
        }
    }

    _loading(state) {
        return () => {
            $active(this.$('spinner'), state);
        }
    }

    _attachRemoteContent() {
        if(this.$remoteContent) {
            this.$('content').append(this.$remoteContent);
        }
    }

    _detachRemoteContent() {
        if(this.$remoteContent && this.prop('remote-detach')) {
            this.$remoteContent.remove();
        }
    }

    async _handleRemoteContent() {
        if(this.prop('remote-url') && this.prop('remote-target') && !this.$remoteContent) {
            await this._loadRemoteContent();
        }

        this._attachRemoteContent();
    }
    
    _onClose(cb) {
        this.addEventListener('modal-close', cb, {once: true});
    }

    async _open(e) {
        if(this.$('dialog').open) {
            return;
        }
        TopLayerStack.add(this.$('dialog'), this._onClose.bind(this));        
        // this.$('dialog')[e.type === 'modal-open' ? 'showModal': 'show']();
        this.$('dialog').showModal();

        await this._handleRemoteContent();
        this.setAttribute('opening', '');

        await animationsComplete(this.$('content')); 
        this.removeAttribute('opening');

        this.$('dialog').dispatchEvent(new CustomEvent('modal-open', {
            bubbles: true
        }))
    }

    async _close(e) {
        e?.preventDefault();
        if(!this.$('dialog').open) {
            return;
        }
        TopLayerStack.remove();
        this.setAttribute('closing', '');
        await animationsComplete(this.$('content'));
        this.$('dialog').close();
        this.removeAttribute('closing');

        this._detachRemoteContent();
    }
})

customElements.define('modal-open', class extends Core {
    propTypes = {
        target: String,
        fallback: String
    }

    render() {
        this.$target = document
            .getElementById(this.prop('target'))

        this._handleClick();
    }

    async _handleClick() {
        await customElements.whenDefined('modal-container');

        this.$({
            click: this._openTargetModal,
            keydown: this._openOnEnterPressed
        })
    }

    _openOnEnterPressed(e) {
        if(e.keyCode === ENTER_KEYCODE) {
            this._openTargetModal()
        }
    }

    _openTargetModal() {
        if(!this.$target) {
            if(this.prop('fallback')) {
                window.location.href = this.prop('fallback');
            }
            return;
        }
        this.$target.dispatchEvent(DOMEvents.MODAL_OPEN);
    }
})

customElements.define('modal-close', class extends Core {
    render() {
        this.$({
            click: this._emitClose
        })
    }

    _emitClose() {
        this.dispatchEvent(DOMEvents.MODAL_CLOSE);
    }
})