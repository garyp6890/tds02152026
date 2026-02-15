const { Core, Events, Utils, MediaQueries } = Global;

function isElementIndexEquals(index) {
    return (el) => +el.dataset.index === index;
}

const INTERSECTION_THRESHOLD = [0.75, 1];
const DEBOUNCE_INTERVAL = 150;

customElements.define('product-gallery-scrollable', class extends Core {
    propTypes = {
        'listen-variants': Boolean
    }

    elements = {
        $: [['media']]
    }

    scrollIndex = null;

    render() {
        if(MediaQueries.MOBILE.matches) {
            return;
        }

        this._initObs();
        this.$('media').map(this._observeMediaScroll.bind(this));
        if (this.prop('listen-variants')) {
            this.sub(Events.VARIANT_UPDATE, this._onVariantChange);
        }
        this.sub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, this._scrollToSlide);
    }
    
    _onVariantChange({ imageIndex }) {
        if(imageIndex >= 0) {
            this._publishScrollEvent(imageIndex);
            this._scrollToSlide(imageIndex);
        }
    }

    _initObs() {
        this.observer = new IntersectionObserver(Utils.debounce(this._handleScroll.bind(this), DEBOUNCE_INTERVAL).bind(this), { threshold: INTERSECTION_THRESHOLD }); 
    }

    _observeMediaScroll(media) {
        this.observer.observe(media);
    }

    _handleScroll(entries) {
        entries.map((entry) => {
            const index = +entry.target.dataset.index;
            if(entry.isIntersecting) {
                if(this.scrollIndex === null) {
                    this._publishScrollEvent(index);
                }
                if(index === this.scrollIndex) {
                    this.scrollIndex = null;
                }
            }
        });
    }
    _publishScrollEvent(index) {
        this.pub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, index)
    }

     _scrollToSlide(index) {
        this.scrollIndex = index;
        
       this.$('media')
            .find(isElementIndexEquals(index))
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});