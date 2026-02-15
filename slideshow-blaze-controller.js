const { Core } = Global;


customElements.define('slideshow-blaze-controller', class extends Core {
    elements = {
        $: [['controller']],
        slider: 'slideshow-blaze'
    }

    render() {
        // async not working on render level for some reason
        this._initSlideshow();
    }

    async _initSlideshow() {
        await customElements.whenDefined(this.elements.slider);
        this.$('controller').map(c => {
            c.addEventListener('click', this._handleControlClick.bind(this))
        });
    }

    _handleControlClick({ currentTarget }) {
        this.$('slider').slideTo(+currentTarget.dataset.controlIndex);
    }
})
