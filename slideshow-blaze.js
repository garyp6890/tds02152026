const { Core, onBlazeLoad, Utils } = Global;
const { $toggleDisplay } = Utils;

const ACTIVE_CLASSNAME = 'blaze-active';

customElements.define('slideshow-blaze', class extends Core {
    elements = {
        $: ['blaze', ['nav']]
    }

    propTypes = {
        loop: Boolean,
        'autoplay-speed': Number,
        'initial-index': Number,
        'swipe-on-desktop': Boolean,
        'ignore-resize': Boolean
    }

    render() {
        this.options = {
            slideGap: '0px',
            loop: this.prop('loop'),
            slidesToShow: 1,
            draggable: this.prop('swipe-on-desktop')
        }
        this._setAutoplay();

        onBlazeLoad(this._initBlaze.bind(this));
    }

    destroy() {
        if(this.slider) {
            this.slider.destroy();
        }
    }

    _setAutoplay() {
        if(!!this.prop('autoplay-speed')) {
            this.options = {
                ...this.options,
                enableAutoplay: true,
                autoplayInterval: this.prop('autoplay-speed'),
            }
        }
    }

    _initBlaze() {
        if(!window.BlazeSlider) {
            // sanity check
            return;
        }
        
        this.slider = new window.BlazeSlider(this.$('blaze'), {
            all: this.options,
            '(max-width: 992px)': {
                draggable: true
            }
        })


        if(this.prop('ignore-resize')) {
            this.slider.refresh = () => {};
        }
        if(this.prop('initial-index')) {
            this.slideTo(this.prop('initial-index'));
        }

        this._handleActiveSlideChange();
        this._toggleNavigation();
    }

    _handleActiveSlideChange() {
        this._updateActiveSlide();
        this.slider.onSlide(this._updateActiveSlide.bind(this))
    }

    
    _updateActiveSlide() {
        // since blaze slides are dyamic, active one is always 0
        const currentSlide = this.slider.slides.item(0);

        if(currentSlide === this._activeSlide) {
            return;
        }

        if(this._activeSlide) {
            this._activeSlide.classList.remove(ACTIVE_CLASSNAME);
        }

        this._activeSlide = currentSlide;
        this._activeSlide.classList.add(ACTIVE_CLASSNAME);
    }

    _toggleNavigation() {
        this.$('nav')?.map(item => $toggleDisplay(item, this.slider.totalSlides > 1));
    }

    slideTo(index) {
        // implemented based on https://github.com/blaze-slider/blaze-slider/blob/main/blaze-slider/src/utils/autoplay.ts
        // this is not ideal, but it's working
        // will use it untill official update
        // as far as I know there is no way to move it to an index. stateIndex is not a setter
        const target = this.slider.stateIndex - index;
        const dir = target > 0 ? 'prev': 'next';
        this.slider[dir](Math.abs(target));
    }
})