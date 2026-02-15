const { Core, Utils, onBlazeLoad } = Global;
const { $hide, $replaceContent, $toggleDisplay } = Utils;

const ACTIVE_CLASSNAME = 'blaze-active';

function _activeToggle(state) {
    const action = state ? 'add' : 'remove';
    return (el) => {
        el.classList[action](ACTIVE_CLASSNAME);
    }
}

customElements.define('slideshow-inline-blaze', class extends Core {
    elements = {
        $: ['blaze', 'slides-wrapper', ['nav']]
    }

    propTypes = {
        gap: String,
        'slides-per-view': Number,
        'slides-per-view-mobile': Number,
        'slide-by-row': Boolean,
        'swipe-on-desktop': Boolean,
        'track-active': Boolean,
        'inert': Boolean
    }

    render() {
        // if slieshow is interted, it will avtivate only on reset. Handy for dynamically loaded content
        if(this.prop('inert')) {
            return;
        }

        onBlazeLoad(this._initBlaze.bind(this));
    }

    destroy() {
        if(this.slider) {
            this.slider.destroy();
        }
    }

    replaceSlides(slides) {
        this.$('slides-wrapper').replaceChildren(...slides);
        this.reset();
    }

    reset() {
        if(!this.slider) {
            this.removeAttribute('inert');
            this._initBlaze();
        }
        this.slider.totalSlides = this.slider.slides.length;
        this.slider.refresh();
        this._toggleNavigation();
    }

    _initBlaze() {
        if(!window.BlazeSlider) {
            // sanity check
            return;
        }

        this.slider = new window.BlazeSlider(this.$('blaze'), {
            all: {
                slideGap: this.prop('gap'),
                loop: false,
                slidesToShow: this.prop('slides-per-view'),
                slidesToScroll: this.prop('slide-by-row') ? this.prop('slides-per-view') : 1,
                draggable: this.prop('swipe-on-desktop')
            },
            '(max-width: 992px)': {
                slidesToShow: this.prop('slides-per-view-mobile'),
                slidesToScroll: 1,
                draggable: true
            }
        })

        if(this.prop('track-active')) {
            this._handleActiveSlides();
        }
        this._toggleNavigation();
    }

    _handleActiveSlides() {
        this.$slides = Array.from(this.slider.slides);
        this._setInitialActiveSlides();
        this.slider.onSlide(this._updateActiveSlides.bind(this));
    }

    _setInitialActiveSlides() {
        const [start, end] = this.slider.states[0].page;
        this.activeSlides = this._findSlidesInRange(start, end);
        this._toggleActiveSlides(true);
    }

    _toggleActiveSlides(state) {
        this.activeSlides.map(_activeToggle(state));
    }

    _findSlidesInRange(start, end) {
        return this.$slides.filter((_, i) => start <= i && end >= i);
    }

    _updateActiveSlides(_, start, end) {
        this._toggleActiveSlides(false);
        this.activeSlides = this._findSlidesInRange(start, end);
        this._toggleActiveSlides(true);
    }

    _toggleNavigation() {
        this.$('nav')?.map(item => $toggleDisplay(item, this.hasOffset));
    }

    get hasOffset() {
        return this.slider.totalSlides > this.prop('slides-per-view');
    }
})