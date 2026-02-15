const { Core, Events } = Global;

customElements.define('product-gallery-video', class extends Core {
    propTypes = {
        expand: Boolean,
        autoplay: Boolean
    }

    isCurrent = false;
    active = false;
    
    elements = {
        video: 'video-player'
    }

    render() {
        this.sub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, this._handleSlideChange);
        if(this.prop('expand')) {
            this.sub(Events.PRODUCT_GALLERY_EXPAND_CHANGE, this._handleExpandChange);
        } else {
            this.active = true;
        }
    }

    _handleExpandChange(opened) {
        this.active = opened;

        if(!this.active) {
            this.player.pause();
            return;
        }

        this._handleAutoplay();
    }

    _handleSlideChange(index) {
        this.isCurrent = index === this.index; 

        if(!this.isCurrent) {
            this.player.pause();
            return;
        }

        this._handleAutoplay();
    }

    _handleAutoplay() {
        if(this.prop('autoplay') && this.active && this.isCurrent) {
            this.player.play();
        }
    }

    get player() {
        return this.$('video').player;
    }
   
    get index() {
        return +this.dataset.index;
    }
});