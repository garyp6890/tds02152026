const { Core, Events, MediaQueries, onBlazeLoad } = Global;

const ACTIVE_CLASSNAME = '!active';

customElements.define('product-gallery-expand', class extends Core {
    elements = {
        slider: 'slideshow-blaze'
    }

    render() {
        onBlazeLoad(this._initSlider.bind(this));

        this.sub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, this._slideToCurrent);
    
        this.$({
            'modal-open': this._handleModalOpen,
            'modal-close': this._handleModalClose
        })
    }

    _handleModalClose() {
        this.modalOpen = false;
        this.pub(Events.PRODUCT_GALLERY_EXPAND_CHANGE, this.modalOpen);
    }

    _handleModalOpen() {
        this.modalOpen = true;
        this.pub(Events.PRODUCT_GALLERY_EXPAND_CHANGE, this.modalOpen);
    }

    async _initSlider() {
        await customElements.whenDefined(this.elements.slider);
        // TEMP: parent element should have it's own onSlide method
        this.$('slider').slider.onSlide(this._handleSlide.bind(this));
    }

    _handleSlide(index) {
        if(this.modalOpen) {
            this.pub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, index);
        }
    }

    _slideToCurrent(imageIndex) {
        this.$('slider')?.slideTo(imageIndex);
    }
});

// decided to merge this into this file. This components could not be used separately
customElements.define('product-gallery-expand-zoom', class extends Core {
    render() {
        if(MediaQueries.MOBILE.matches) {
            return;
        }
        this.active = false;
        this._mover = this._handleMouseMove.bind(this);

        this.$({
            click: this._handleClick
        });


        // didn't find a better way 
        // to handle out of view (slide change/modal close)
        // zoom disabling
        this.obs = new IntersectionObserver(([entry]) => {
            if(!entry.isIntersecting) {
                this._disableZoom();
            }
        })
    }

    _handleClick() {
        this.active
            ? this._disableZoom()
            : this._enableZoom();
    }

    _disableZoom() {
        this.active = false;
        this.classList.remove(ACTIVE_CLASSNAME);
        this.removeEventListener('mousemove', this._mover);
        this.obs.unobserve(this);
        // position clean up
        this.style.removeProperty('--object-position');
    }

    _enableZoom() {
        this._initSizes();
        this.active = true;
        this.classList.add(ACTIVE_CLASSNAME);
        this.addEventListener('mousemove', this._mover)
        this.obs.observe(this);
    }

    _initSizes() {
        // might not be available on render
        if(!this.width || !this.height) {
            this.width = this.offsetWidth;
            this.height = this.offsetHeight;
        }
    }
    
    _handleMouseMove(e) {
        let x = e.offsetX * 100 / this.width;
        let y = e.offsetY * 100 / this.height;
        this.style.setProperty('--object-position', `${x}% ${y}%`);
    }
})