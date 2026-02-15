const { Core, Utils } = Global;
const { $active } = Utils;

customElements.define('scroll-to-top-button', class extends Core {
    elements = {
        $: ['trigger', 'button']
    }

    propTypes = {
        observe: Boolean
    }

    render() {
        this.$({
            click: this._handleClick
        })

        if(this.prop('observe')) {
            this._handleObserver();
        }
    }

    _handleObserver() {
        const observer = new IntersectionObserver((entries) => {
            this.active = !entries[0].isIntersecting;
        });
        observer.observe(this.$('trigger'));
    }

    _handleClick() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    set active(state) {
        $active(this.$('button'), state);
    }
});