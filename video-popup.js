const { Core } = Global;

customElements.define('video-popup', class extends Core {
    elements = {
        'player': 'video-player'
    }
    propTypes = {
        'autoplay': Boolean
    }
    render() {
        this.$({
            'modal-open': this._handleModalOpen,
            'modal-close': this._handleModalClose
        })
    }

    _handleModalOpen() {
        if(this.prop('autoplay')) {
            this.$('player').play();
        }
    }

    _handleModalClose() {
        this.$('player').pause();
    }
});