const { Core, Store, Utils, Events } = Global;
const { $fetch, $clone } = Utils;

const REQ_TEMPLATE_SELECTOR = '[data-req-content]';
const STORE_KEY = 'browsingHistory';

customElements.define('browsing-history-loader', class extends Core {
    propTypes = {
        'req-section': String,
        'limit': Number
    }

    items = []

    render() {
        
        this.urls = Store.get(STORE_KEY);

        // TODO: refactor to dynamic call
        // need to wait for the next iteration cycle right now

        // if(this.urls.length === 0 || !this.urls) {
        //     this.pub(Events.BROWSING_HISTORY_LOAD, {
        //         items: []
        //     })
        //     return;
        // }
        if (this.prop('limit') && this.urls.length > this.prop('limit')) {
            this.urls.length = this.prop('limit'); 
        }

        setTimeout(() => {
            this._handleLoad();
        }, 500);
    }

    _handleLoad() {
        Promise.allSettled(this.fetchUrls)
            .then(this._handleResults.bind(this))
            .catch(this._handleError.bind(this))
    }

    _handleResults(results) {
        results.map(({ status, value }) => {
            if(status === 'fulfilled') {
                this.items.push($clone(value).firstElementChild)
            }
        });
        this.pub(Events.BROWSING_HISTORY_LOAD, {
            items: this.items
        });
    }

    _handleError(error) {
        console.error(error);
        this.pub(Events.BROWSING_HISTORY_LOAD, {
            error
        });
    }

    get fetchUrls() {
        return this.urls.map(url => $fetch(url, {
            sectionId: this.prop('req-section'),
            select: REQ_TEMPLATE_SELECTOR
        }));
    }
})