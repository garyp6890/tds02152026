const { Core, Utils, Events, onBlazeLoad } = Global;
const { $fetch, $clone } = Utils;

const REQ_TEMPLATE_SELECTOR = '[data-req-content]';

customElements.define('product-recommendations-slider', class extends Core {
    propTypes = {
        'ref-product-id': String,
        'req-url': String,
        'req-section': String,
        'limit': Number
    };

    elements = {
        'slider': 'slideshow-inline-blaze'
    };

    render() {
        onBlazeLoad(this._handleRecommendations.bind(this));
    }

    async _handleRecommendations() {
        await customElements.whenDefined(this.elements.slider);
        try {
            const $content = await $fetch(this.prop('req-url'), {
                params: {
                    product_id: this.prop('ref-product-id'),
                    section_id: this.prop('req-section'),
                    limit: this.prop('limit')
                },
                select: REQ_TEMPLATE_SELECTOR
            });

            if($content) {
                this._injectSlides($clone($content));
                this.pub(Events.RECOMMENDATIONS_LOADED);
            } else {
                throw new Error('Missing template from request section');
            }
        } catch(e) {
            console.error(e);
            this.pub(Events.RECOMMENDATIONS_LOADED, {error: e});
            this.remove();
        }
    }

    _injectSlides($content) {
        this.$('slider').replaceSlides($content.childNodes);
    }
})