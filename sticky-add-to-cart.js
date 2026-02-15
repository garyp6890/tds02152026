const {Core, Events, Utils} = Global;
const { $toggleDisplay } = Utils;
const CN_ACTIVE = '!active';
const CN_LOADING = '!loading';

customElements.define('sticky-add-to-cart', class extends Core {

    elements = {
        $: ['observer-trigger', 'wrapper']
    }

    propTypes = {
        'sticky-bottom': Boolean
    }

    render() {
        this.sub(Events.VARIANT_CHANGE, this._toggleLoading(true));
        this.sub(Events.VARIANT_UPDATE, this._toggleLoading(false));
        this.sub(Events.VARIANT_UNAVAILABLE, this._handleVariantUnavailability);

        if (this.prop('sticky-bottom')) {
            this._setBodyOffset();
        }
        
        this._handleTrigger();
    }

    _handleTrigger() {
        this.observer = new IntersectionObserver(([entry]) => { 
            this.active = !entry.isIntersecting && entry.boundingClientRect.top <= 0;
        });
        this.observer.observe(this.$('observer-trigger'));
    }

    _setBodyOffset() {
        document.body.style.setProperty('--bottom-offset', `${this.$('wrapper').offsetHeight}px`);
    }

    _toggleLoading(state) {
        return () => {
            this.classList.toggle(CN_LOADING, state);
        }
    }

    _handleVariantUnavailability(state) {
        $toggleDisplay(this, !state);
    }

    set active(state) {
        this.classList.toggle(CN_ACTIVE, state);
    }
})