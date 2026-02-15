const { Core, MediaQueries } = Global;

customElements.define('product-gallery-image-zoomer', class extends Core {
    render() {
        if(MediaQueries.MOBILE.matches) {
            return;
        }

        this._mouseMove = this._handleMouseMove.bind(this);
        this.$({
            mouseover: this._handleMouseIn,
            mouseleave: this._hanldeMouseOut
        })
    }

    _handleMouseIn() {
        this._initSize();
        // there is no 'native' way to clean up an event
        // I have to declare it vanilla style
        this.addEventListener('mousemove', this._mouseMove);
    }

    _hanldeMouseOut() {
        this.removeEventListener('mousemove', this._mouseMove);
    }

    _initSize() {
        // might not be available on render
        if(!this.width || !this.height) {
            this.width = this.offsetWidth;
            this.height = this.offsetHeight;
        }
    }

    _handleMouseMove(e) {
        let x = e.offsetX * 100 / this.width;
        let y = e.offsetY * 100 / this.height;
        this.style.setProperty('--x', x);
        this.style.setProperty('--y', y);
    }
})