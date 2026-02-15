const { Core, Utils, Events } = Global;
const { $fetch, parseHTML } = Utils;


customElements.define('cart-provider', class extends Core {
    liveSections = new Set();
    notificationsEnabled = false;

    render() {
        this.sub(Events.CART_REGISTER, this._registerSection, { global: true });
        this.sub(Events.CART_NOTIFICATIONS_ENABLING, this._enableNotifications, { global: true });
        this.sub(Events.CART_ADD, this._addToCart, { global: true });
        this.sub(Events.CART_CHANGE, this._updateCart, { global: true });
        this.sub(Events.CART_REPLACE, this._replaceCartItem, { global: true });
        this.sub(Events.PRODUCT_FORM_SUBMIT, this._formSubmitHandler, { global: true });

        this._setExternalAPI();
    }

    _registerSection(section) {
        this.liveSections.add(section);
    }
    
    _enableNotifications() {
        this.notificationsEnabled = true;
    }

    async _formSubmitHandler({ formData }) {
        this.notificationsEnabled && formData.append("attributes[notification_items_variant_ids]", formData.get('id'));
        formData.append("sections", Array.from(this.liveSections).join(','));

        const config = {
            method: 'POST',
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "application/javascript"
            },
            body: formData
        }
        
        try {
            const res = await fetch(`${window.dynamicURLs['cartAdd']}.js`, config);
            
            const cartData = await res.json();

            if(!res.ok) {
                this.pub(Events.TOAST_NOTIFICATION, {
                    type: 'error',
                    msg: cartData.description,
                    title: cartData.message
                });
                throw new Error(cartData.description);
            }
            this.pub(Events.CART_UPDATE, {
                sections: cartData.sections,
                req: "cartAdd"
            })
        } catch (error) {
            console.error(error);
            this.pub(Events.CART_ERROR, error);
        } finally {
            this.notificationsEnabled && this._cleanCartAttributes();
        }
    }
    
    async _addToCart({ items }) {
        await this._requestCart('cartAdd', {
            items,
            ...(this.notificationsEnabled && { attributes: {
                notification_items_variant_ids: items.map(({id}) => id).join(',')
            }})
        }, items.map(item => item.id));
        this._cleanCartAttributes();
    }

    _cleanCartAttributes() {
        this._fetchCart('cartUpdate', { attributes: { notification_items_variant_ids: null }});
    }

    _fetchCart(route, body) {
        return fetch(`${window.dynamicURLs[route]}.js`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(
                body
            )
        })
    }

    async _updateCart({ quantity, line }) {
        // NOTE: Terrible, but forced to use line (index) because of unexpected shopify cart API behavior.    
        // TODO: Deprecate line usage    
        await this._requestCart('cartChange', {
            line,
            quantity
        });
    }

    async _replaceCartItem({line, newItem, quantity}) {
        await this._fetchCart('cartChange', {
            line, quantity: 0
        });
        this._addToCart({items: [{ id: newItem, quantity }]});
    }

    async _requestCart(route, body) {
        try {
            const res = await this._fetchCart(route, {
                ...body,
                sections: Array.from(this.liveSections).join(','),
            });
            
            const cartData = await res.json();

            if(!res.ok) {
                this.pub(Events.TOAST_NOTIFICATION, {
                    type: 'error',
                    msg: cartData.description,
                    title: cartData.message
                });
                throw new Error(cartData.description);
            }

            this.pub(Events.CART_UPDATE, {
                sections: cartData.sections,
                req: route
            })

        } catch (error) {
            console.error(error);
            this.pub(Events.CART_ERROR, error);
        }
    }

    _setExternalAPI() {
        document.addEventListener('cart:refresh', this._cartRefresh.bind(this));
    }

    async _cartRefresh() {
        const cartSectionsReqURL = `${window.dynamicURLs['root']}?sections=${Array.from(this.liveSections).join(',')}`;

        try {
            const data = await fetch(cartSectionsReqURL);
            const sections = await data.json();

            this.pub(Events.CART_UPDATE, {
                sections
            });
        } catch (err) {
            console.error(err);
        }
    }
})

customElements.define('cart-qty', class extends Core {
    propTypes = {
        value: Number,
        key: String,
        input: Boolean,
        'prevent-default': Boolean,
        line: Number
    }

    render() {
        this.$({
            [this.evt]: this._handleEvent
        })
    }

    _handleEvent(e) {
        this.prop('prevent-default') && e.preventDefault();
        this.pub(Events.CART_CHANGE, {
            key: this.prop('key'),
            line: this.prop('line'),
            quantity: this._getValue(e)
        })
    }

    _getValue(e) {
        return this.evt === 'change'
            ? this._getValidatedValue(e)
            : this.prop('value'); 
    }

    _getValidatedValue(e) {
        const maxValue = e.target.hasAttribute('max') && +e.target.getAttribute('max');
        if (maxValue && e.target.value > maxValue) {
            e.target.value = maxValue
            return maxValue
        }
        return e.target.value
    }

    get evt() {
        return this.prop('input') 
            ? 'change' 
            : 'click';
    }
});

customElements.define('cart-live-region', class extends Core {
    propTypes = {
        'target-section': String,
        'target-element': String
    }

    render() {
        this.targetSection = this.prop('target-section') || this.sectionId;
        this.targetSelector = this.prop('target-element') || `#${this.id}`;

        customElements.whenDefined('cart-provider').then(() => {
            this.pub(Events.CART_REGISTER, this.targetSection)
        })

        this.sub(Events.CART_UPDATE, this._updateContent, { global: true })
    }
    
    _updateContent({ sections }) {
        const targetSection = sections && sections[this.targetSection];
        if(!targetSection) {
            console.error(`target section ${targetSection} do not exists`);
            return;
        }

        const doc = Utils.parseHTML(targetSection);
        Utils.$replaceContent(this, doc.querySelector(this.targetSelector));
    }
})