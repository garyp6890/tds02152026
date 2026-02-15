const { Core, Events } = Global;

customElements.define('posted-popup', class extends Core {
    propTypes = {
        'newsletter-msg': String,
        'contact-msg': String
    }

    alerts = {
        contact_posted: this.prop('contact-msg'),
        customer_posted: this.prop('newsletter-msg')
    }

    render() {
        this.URLSearchParams = new URL(window.location.href).searchParams;
        Object.keys(this.alerts).map(this._checkAndAlert.bind(this));
    }
        
    _checkAndAlert(type) {
        if (this.URLSearchParams.get(type)) {
            this._alert(this.alerts[type]);
            this._removeURLParam(type);
        }
    }

    async _alert(msg) {
        await customElements.whenDefined('toast-notification');
        this.pub(Events.TOAST_NOTIFICATION, {
            title: msg, 
            type: 'success' 
        })
    }

    _removeURLParam(paramName) {
        this.URLSearchParams.delete(paramName);
        window.history.replaceState(window.history.state, '', this.currentURL.href);
    }
});