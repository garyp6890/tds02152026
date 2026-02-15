const { Core, Utils } = Global;
const { $state } = Utils;

const TICK = 1000;
const TIME_STEP = 60;

const _zeroPadding = (n) => {
    return (n < 10 ? "0" + n : n);
}

const _splitFloat = (f) => {
    const integer = Math.trunc(f);
    const remainder = f - integer
    return { integer, remainder };
}

customElements.define('countdown-timer', class extends Core {
    elements = {
        $: ['days', 'hours', 'minutes', 'seconds']
    }

    propTypes = {
        'time-left': Number
    }

    render() {
        this.timeLeft = this.prop('time-left');
        if(this.timeLeft > 0) {
            this._initTimer();
            this._countdown();
        }
    }

    _countdown() {
        this._start();
        this._tickInterval = setInterval(this._tick.bind(this), TICK);
    }

    _start() {
        $state(this, 'start');
    }

    _updateTimerEntry(name, value) {
        this.timer[name].value = value;
        this.timer[name].el.innerText = _zeroPadding(value);
    }

    _tick() {
        if (this.timeLeft <= 0) {
            this._complete();
            return
        }

        Object.entries(this.timer).reverse().reduce((next, [name, props]) => {
            if(next) {
                let updatedValue = props.value - 1;
                if(updatedValue >= 0) {
                    next = false;
                } else {
                    updatedValue += TIME_STEP;
                }
                this._updateTimerEntry(name, updatedValue);
            }
            return next;
        }, true);

        this.timeLeft -= TICK;
    }

    _complete() {
        this._tickInterval && clearInterval(this._tickInterval);
    }

    _initTimer() {
        this.timer = {
            days: {
                value: 0,
                unit: 86400000,
                el: this.$('days')
            },
            hours: {
                value: 0,
                unit: 3600000,
                el: this.$('hours')
            },
            minutes: {
                value: 0,
                unit: 60000,
                el: this.$('minutes')
            },
            seconds: {
                value: 0,
                unit: 1000,
                el: this.$('seconds')
            }
        };

        this._initDigits();
    }

    _initDigits() {
        Object.entries(this.timer).reduce((left, [ name, props ]) => {
            const { integer, remainder } = _splitFloat(left/props.unit);
            left = remainder * props.unit;
            if(props.value !== integer) {
                this._updateTimerEntry(name, integer);
            }
            return left;
        }, this.timeLeft);
    }

    destroy() {
        clearInterval(this._tickInterval);
        this.setProp('time-left', this.timeLeft)
    }
})