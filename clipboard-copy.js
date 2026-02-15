const { Core, Events } = Global;

customElements.define('clipboard-copy', class extends Core {
    propTypes = {
        'clipboard-text': String,
        'success-title': String,
        'success-msg': String
    }

    render() {
        this.$({click: this._setClipboard});
    }

    _setClipboard() {
        navigator.clipboard.writeText(this.prop('clipboard-text'));
        this.pub(Events.TOAST_NOTIFICATION, {  
            type: 'success',
            msg: this.prop('success-title') || '', 
            title: this.prop('success-msg') || ''
        })
    }
})