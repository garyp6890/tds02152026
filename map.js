const { Core, Utils } = Global;
const { $JSON } = Utils;

const MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 384 512"><path fill="" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>`;
const REG_FILL = /fill=".*?"/;
const DEFAULT_ZOOM_VALUE = 12;

customElements.define('x-map', class extends Core {
    elements = {
        $: ['map-stage', 'style-json']
    }

    propTypes = {
        'interactive': Boolean,
        'marker-color': String,
        'zoom': Number,
        'address': String,
        'api-key': String
    }

    render() {
        if (!window.GoogleMap) return;
        this.GoogleMap = window.GoogleMap;
        this._renderMap();
    }

    async _renderMap() {
        await this._initGmAPI();
        await this._findLatLng();
        this._loadMap();
        this._setMarker();
    }

    async _initGmAPI() {
        this.gmAPI = await this.mapLoader.initMap({ apiKey: this.prop('api-key') })
    }

    async _findLatLng() {
        try {
            const { results } = await this.geocoder.geocode({ address: this.prop('address') });
            this.latLng = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    _loadMap() {
        const interactiveOptions = this.prop('interactive') ? {
            draggable: true,
            zoomControl: true,
            scaleControl: true
        } : {};
        const options = {
            center: this.latLng,
            disableDefaultUI: true,
            zoom: this.prop('zoom') || DEFAULT_ZOOM_VALUE,
            styles: this.mapStyles,
            ...interactiveOptions
        };
        this.map = new this.gmAPI.Map(
            this.$('map-stage'), options
        )
        this.gmAPI.event.addListenerOnce(this.map, 'idle', () => {
            this.setAttribute('loaded', '');
        });
    }

    _setMarker() {
        new this.gmAPI.Marker({
            position: this.map.getCenter(),
            map: this.map,
            icon: {
                url: this.svgDataUri,
                scaledSize: new this.gmAPI.Size(30, 30)
            }
        });
    }

    get mapLoader() {
        return new this.GoogleMap();
    }

    get geocoder() {
        return new this.gmAPI.Geocoder();
    }

    get markerSvg() {
        return MARKER_SVG.replace(REG_FILL, `fill="${this.prop('marker-color')}"`);
    }
    
    get svgDataUri() {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(this.markerSvg)}`
    }

    get mapStyles() {
        return this.$('style-json') ? $JSON(this.$('style-json')) : ''
    }
});