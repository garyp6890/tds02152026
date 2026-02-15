const { Core, Utils } = Global;
const { $active } = Utils;

const SPOT_SEL = '[data-spot]'

customElements.define('hot-spots', class extends Core {
    elements = {
        $: [['mobile-label'], ['trigger'], 'stage']
    }

    render() {
        // This event will be trigger only on mobile, because 'mobile-label' unclickable on desktop
        this.$('mobile-label', {
            click: this._handleMobileLabelClick 
        })

        this.$('trigger', {
            change: this._handleChange
        });

        this.$('stage', {
            click: this._handleImageClick
        });
    }

    _handleMobileLabelClick({ currentTarget }) {
        if (currentTarget.closest(SPOT_SEL) === this.activeSpot) {
            $active(this.activeSpot, false);
            this.activeSpot = false;
            return;
        };

        this.activeSpot && $active(this.activeSpot, false);
        this.activeSpot = currentTarget.closest(SPOT_SEL);
        $active(this.activeSpot);
    }

    _handleChange({ currentTarget }) {
        this._setActiveCard(currentTarget);
    }

    _setActiveCard(current) {
        if (current === this.activeTrigger) return;

        if (this.activeTrigger) this.activeTrigger.checked = false; 
        this.activeTrigger = current;
    }

    _handleImageClick() {
        if (!this.activeTrigger) return;

        this.activeTrigger.checked = false;
        this.activeTrigger = false;
        this.activeSpot && $active(this.activeSpot, false);
        this.activeSpot = false;
    }
})