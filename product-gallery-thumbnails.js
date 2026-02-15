const { Core, Events } = Global;

const BORDER_COMPENSATION = 4;
const OFFSET_STYLE_PROP = '--offset-scroll-y';

function isElementValueEquals(value) {
    return (el) => el.value === value.toString();
}

customElements.define('product-gallery-thumbnails', class extends Core {

    propTypes = {
        'auto-scroll': Boolean
    }

    elements = {
        $: [['input']]
    }

    render() {
        this.sub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, this._changeThumb);
        this.$({ change: this._handleChange });
    }

    _handleChange({ target }) {
        this.pub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, +target.value);
        this._scrollToTarget(target);
    }

    _scrollToTarget(target) {
        if(!this.prop('auto-scroll')) {
            return;
        }
        const label = target.labels[0];
        if(label) {
            this.style.setProperty(OFFSET_STYLE_PROP, `${this._calcOffset(label)}px`);
        }
    }

    _calcOffset(el) {

        // calculating all values once
        if(!this.height || !this.parentHeight || !this.halfParentHeight) {
            this.height = this.offsetHeight;
            this.parentHeight = this.parentNode.offsetHeight;

            // check if parent height is not calculated properly (styles are not loaded)
            if(this.parentHeight > window.innerHeight) {
                this.parentHeight = null;
                return 0;
            }

            if(this.parentHeight >= this.height) {
                return 0;
            }

            this.halfParentHeight = this.parentHeight / 2;
        }

        return Math.max(
            Math.min((el.offsetTop * -1) + this.halfParentHeight, 0),
            this.parentHeight - this.height - BORDER_COMPENSATION
        );
    }
    
    _changeThumb(index) {
        const currentThumb = this.$('input').find(isElementValueEquals(index));
        if(currentThumb) {
            currentThumb.checked = true;
            this._scrollToTarget(currentThumb);
        }
    }
});