const { Core, Utils } = Global;
const { $active } = Utils;

customElements.define('floating-contact-popup', class extends Core {
    elements = {
        $: ['trigger', 'button']
    }
    
    propTypes = {
        'observe': Boolean
    }

    render() {
        if (!this.prop('observe')) return;
        this._handleObserver();
    }

    _handleObserver() {
        const observer = new IntersectionObserver((entries) => {
            this.active = !entries[0].isIntersecting;
        });
        observer.observe(this.$('trigger'));
    }

    set active(state) {
        $active(this.$('button'), state);
    }
});