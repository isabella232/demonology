<template>
  <div>
    <template v-if="$store.state.harvest.awakenings > 0 && !$store.state.current.name">
      <section class="narrow text--center">
        <h2>Choose your path</h2>
        <p>Evil can take many forms. Choose wisely.</p>
        <div class="stackable row">
          <div v-for="name in $store.getters['values']('names.available')" :key="name.id">
            <h3>{{ name.name }}, {{ name.title }}</h3>
            <ul class="pl-0">
              <li v-for="(perk, idx) in name.perks" :key="idx">{{ perk }}</li>
            </ul>
            <button @click.prevent="$store.commit('name', name.id)">
              I am {{ name.name }}
            </button>
          </div>
        </div>
        
      </section>
    </template>
    <template v-else>
      <section
        class="narrow transparent px-0 pt-0 my-1 align-items--center justify-content--center text--center"
      >
        <div class="mt-2 mx-1">
          <button
            class="py-2 px-4 text--unselectable"
            @click.prevent="hunt"
            @touchstart="startHunting"
            @touchend="stopHunting"
            :disabled="$store.state.current.prey === 0"
          >
            <div class="text--1">Hunt <hotkey-hint>(h)</hotkey-hint></div>
            <number-badge
              unit="souls"
              :value="$store.getters['values']('hunt.power')"
              prefix="+"
            > Souls</number-badge>
            <template v-if="$store.getters['values']('pain.enabled')">
              <number-badge
                class="ml-4"
                unit="pain"
                :value="$store.getters['values']('hunt.pain')"
                prefix="+"
                
              > Pain</number-badge>
            </template>

          </button>
        </div>
        <div class="mt-2 mx-1" v-if="$store.state.harvest.awakenings > 0">
          <button
            class="py-2"  
            @click.prevent="showSleep = !showSleep"
          >
            Go dormant
          </button>

        </div>
        <div class="mt-2 mx-1" v-if="$store.getters['values']('evil.enabled')">
          <button
            class="py-2"   
            @click.prevent="showHarvest = !showHarvest"
            :disabled="$store.state.total.harvests === 0 && $store.getters['values']('evil.buyMaxGetter')() === 0"
          >
            Harvest
            <number-badge
              unit="evil"
              :value="$store.getters['values']('evil.buyMaxGetter')()"
            > Evil</number-badge>
          </button>
        </div>
      </section>  
      <section
        class="narrow my-3"
        v-if="showHarvest"
      >
        <h2>Reap what you sow</h2>
        <p v-if="$store.getters['values']('evil.buyMaxGetter')() < $store.state.total.evil">
          <i>Warning: harvesting now won't yield many evil points. You may want to get more pain first.</i>
        </p>
        <p>
          The pain of your prey shimmer in the crimson skies.
        </p>
        <p>
          You could feed on it, grow in power and take over another realm. Or you could wait.
        </p>
        <p>
          If you harvest now, you will:
        </p>
        <ul>
          <li>
            Lose
            <number-badge
              unit="pain"
              :value="$store.state.harvest.pain"
            >
              Pain
            </number-badge>
          </li>
          <li>
            Gain
            <number-badge
              unit="evil"
              :value="$store.getters['values']('evil.buyMaxGetter')()"
            > Evil</number-badge>
          </li>
          <li>
            Lose your souls, legion and upgrades
          </li>
          <li>
            Forget your path
          </li>
          <li>
            Start again in another realm
          </li>
        </ul>
        <p>
          Each Evil point increase your Hunt power, Minions power
          and the initial size of the flock by
          {{ formatNumber($store.getters['values']('evil.basePower') + 1, '%') }}
        </p>
        <div class="stackable row">
          <button @click.prevent="$store.commit('harvest', {evil: $store.getters['values']('evil.buyMaxGetter')()}); showHarvest = false">
            Start the harvest
          </button>
          <button @click.prevent="showHarvest = false">
            I am not done with this world
          </button>
        </div>
      </section>
      <section v-if="showSleep" class="narrow my-3">
        <h2>Everyone must rest</h2>
        <p>
          Maybe it's time for you to change paths and find new ways to play with your prey? 
        </p>
        <ul>
          <li>Devour your legion and souls</li>
          <li>Lose your upgrades</li>
          <li>Take a new path</li>
          <li>Wake up to a world full of prey</li>
        </ul>
        <div class="stackable row">
          <button @click.prevent="showSleep = false; $store.commit('sleep')">
            Go dormant for a while
          </button>
          <button @click.prevent="showSleep = false">
            Stay awake
          </button>
        </div>
      </section>
      <section v-if="$store.state.current.prey === 0" class="narrow my-3">
        <h2>The world is empty</h2>
        <p>
          You have consumed all life in your world. Your legion wanders aimlessly.
          It is time for you to go dormant until the world heals and you can hunt again.
        </p>
        <ul>
          <li>Devour your legion and souls</li>
          <li>Lose your upgrades</li>
          <li>Take a new path</li>
          <li>Wake up to a world full of prey</li>
        </ul>
        <button @click.prevent="showSleep = false; $store.commit('sleep')">
          Go dormant for a while
        </button>
      </section>
      <div class="stackable row">
        <section v-if="$store.state.harvest.souls > 0" class="narrow">
          <div class="justify-content--space-between">
            <h2 class="mb-0">Legion</h2>
            <div>
              <span>
                <tooltip id="tooltip-hunt-power">
                  <p>
                    Your hunt power determines how much souls you gather with each hunt.
                  </p>
                  <value-detail :source="$store.getters['values']('hunt.power.detail')"></value-detail>
                </tooltip>
                <number-badge
                  unit="power"
                  :value="$store.getters['values']('hunt.power')"
                  v-tooltip="'tooltip-hunt-power'"
                > Hunt power</number-badge>
              </span>
              <span v-if="$store.state.harvest.minions > 0">
                <tooltip id="tooltip-minions">
                  <p>
                    Your minions assist you during your hunt.
                    <template v-if="$store.state.current.occultists > 0">
                      They also gather souls passively through your occultists.
                    </template>
                  </p>
                  <value-detail :source="$store.getters['values']('minions.power.detail')"></value-detail>
                </tooltip>
                <number-badge
                  unit="minions"
                  class="ml-4"
                  :value="$store.state.current.minions"
                  v-tooltip="'tooltip-minions'"
                > Minions</number-badge>
              </span>
              <span v-if="$store.state.harvest.occultists > 0">
                <tooltip id="tooltip-occultists">
                  <p>
                    Your occultists channel your legion's power into the mortal realm,
                    granting you souls passively, each second.
                  </p>
                  <value-detail :source="$store.getters['values']('occultists.soulsPerTick.detail')"></value-detail>
                </tooltip>
                <number-badge
                  unit="occultists"
                  class="ml-4"
                  :value="$store.state.current.occultists"
                  v-tooltip="'tooltip-occultists'"
                > Occultists</number-badge>
              </span>
            </div>
          </div>
          <hr>
          <div class="row">
            <div v-if="$store.getters['values']('minions.enabled')" class="mt-1">
              <div
                class="checkbox field mb-2 float--right"
                v-if="$store.getters['values']('upgrades.has')('minions.autoBuy')"
                title="Recruit new minions automatically"
              >
                <input
                  id="auto-minions"
                  name="auto-minions"
                  type="checkbox"
                  @change="$store.commit('setting', {name: 'autoBuyMinions', value: $event.target.checked})"
                  :checked="$store.state.settings.autoBuyMinions">
                <label for="auto-minions">Auto</label>
              </div>
              <h3 class="mt-0">
                Recruit Minions 
              </h3>
              <purchase-button
                class="mb-1 fluid"
                v-for="quantity in [1, 10, 100]"
                :key="quantity"
                :quantity="quantity"
                :cost-getter="$store.getters['values']('minions.costGetter')"
                @purchase="$store.commit('purchase', {name: 'minions', quantity: $event.quantity, cost: $event.cost })"
              ></purchase-button>
              <purchase-button
                class="mb-1 fluid"
                :quantity="'max'"
                :cost-getter="$store.getters['values']('minions.costGetter')"
                :max-quantity-getter="$store.getters['values']('minions.buyMaxGetter')"
                @purchase="$store.commit('purchase', {name: 'minions', quantity: $event.quantity, cost: $event.cost })"
              ></purchase-button>
            </div>
            <div v-if="$store.getters['values']('occultists.enabled')" class="mt-1">
              <div
                class="checkbox field mb-2 float--right"
                v-if="$store.getters['values']('upgrades.has')('occultists.autoBuy')"
                title="Raise new occultists automatically"
              >
                <input
                  id="auto-occultists"
                  name="auto-occultists"
                  type="checkbox"
                  @change="$store.commit('setting', {name: 'autoBuyOccultists', value: $event.target.checked})"
                  :checked="$store.state.settings.autoBuyOccultists">
                <label for="auto-occultists">Auto</label>
              </div>
              <h3 class="mt-0">
                Raise occultists
              </h3>
              <purchase-button
                class="mb-1 fluid"
                v-for="quantity in [1, 10, 100]"
                :key="quantity"
                :quantity="quantity"
                :cost-getter="$store.getters['values']('occultists.costGetter')"
                @purchase="$store.commit('purchase', {name: 'occultists', quantity: $event.quantity, cost: $event.cost })"
              ></purchase-button>
              <purchase-button
                class="mb-1 fluid"
                :quantity="'max'"
                :cost-getter="$store.getters['values']('occultists.costGetter')"
                :max-quantity-getter="$store.getters['values']('occultists.buyMaxGetter')"
                @purchase="$store.commit('purchase', {name: 'occultists', quantity: $event.quantity, cost: $event.cost })"
              ></purchase-button>
            </div>
          </div>
        </section>
        <section class="narrow" v-if="$store.getters['values']('upgrades.enabled')">
          <button
            class="float--right ml-2"
            @click.prevent="buyMaxUpgrades"
            v-if="$store.state.total.upgrades.length >= 3"
            :disabled="!canBuyMaxUpgrades"
          >
            Buy all <hotkey-hint>(u)</hotkey-hint>
          </button>
          <h2 class="mt-0 mb-1">Upgrades</h2>
          <a
            href=""
            v-if="shownUpgrades === 'upgrades.available'"
            @click.prevent="shownUpgrades = 'upgrades.active'">
            Show active upgrades
          </a>
          <a
            href=""
            v-else
            @click.prevent="shownUpgrades = 'upgrades.available'">
            Show available upgrades
          </a>
          <hr>
          <template v-if="$store.getters['values'](shownUpgrades).length > 0">
            <div v-for="upgrade in $store.getters['values'](shownUpgrades)" :key="upgrade.key">
              <div class="mt-4">
                <button
                  v-if="shownUpgrades === 'upgrades.available'"
                  class="float--right"
                  :disabled="$store.state.current.souls < upgrade.cost"
                  @click.prevent="$store.commit('purchaseUpgrade', {id: upgrade.id, cost: upgrade.cost })"
                >
                  Purchase for
                  <number-badge
                    :value="upgrade.cost"
                    unit="souls"
                  ></number-badge>
                </button>
                <strong>{{ upgrade.group }} · {{ upgrade.name }}</strong>
              </div>
              <p class="mt-1">
                {{ 
                  upgrade.description.replace(
                    '${value}',
                    formatNumber(getComputedValue(upgrade.value || 1, $store.getters['values']), upgrade.valueFormat))
                }}
              </p>
            </div>
          </template>
          <template v-else>
            <p v-if="shownUpgrades === 'upgrades.available'">No available upgrades. Try to get more souls or expand your legion to unlock new upgrades.</p>
            <p v-else>You haven't purchased any upgrade yet.</p>
          </template>
        </section>
      </div>
    </template>
  </div>
</template>

<script>
import throttle from 'lodash/throttle'
import {bind, unbind} from '@/hotkeys'
import {formatNumber} from '@/utils'
import {getComputedValue, getBuyableUpgrades} from '@/game'

import HotkeyHint from '@/components/HotkeyHint'
import Tooltip from '@/components/Tooltip'
import ValueDetail from '@/components/ValueDetail'
import NumberBadge from '@/components/NumberBadge'
import PurchaseButton from '@/components/PurchaseButton'

function purchase({store, unit, costGetter, quantity}) {
  let cost = costGetter(quantity)
  store.commit(
    'purchase',
    {name: unit, quantity: quantity, cost}
  )
}

export default {
  components: {
    HotkeyHint,
    NumberBadge,
    PurchaseButton,
    Tooltip,
    ValueDetail,
  },
  data () {
    return {
      formatNumber,
      getComputedValue,
      showHarvest: false,
      showSleep: false,
      huntStarted: false,
      huntInterval: null,
      shownUpgrades: 'upgrades.available',
      hotkeys: [
        {key: 'h', handler: () => { this.hunt()}},
        {key: 'u', handler: () => { this.buyMaxUpgrades()}},
        {key: 'm', handler: () => {
          purchase({
            store: this.$store,
            unit: 'minions',
            quantity: 1,
            costGetter: this.$store.getters['values']('minions.costGetter')
          })
        }},
        {key: 'ctrl+m', handler: () => {
          purchase({
            store: this.$store,
            unit: 'minions',
            quantity: 10,
            costGetter: this.$store.getters['values']('minions.costGetter')
          })
        }},
        {key: 'shift+m', handler: () => {
          purchase({
            store: this.$store,
            unit: 'minions',
            quantity: 100,
            costGetter: this.$store.getters['values']('minions.costGetter')
          })
        }},
        {key: 'ctrl+shift+m', handler: () => {
          let buyable = this.$store.getters['values']('minions.buyMaxGetter')()
          purchase({
            store: this.$store,
            unit: 'minions',
            quantity: buyable,
            costGetter: this.$store.getters['values']('minions.costGetter')
          })
        }},
        {key: 'o', handler: () => {
          purchase({
            store: this.$store,
            unit: 'occultists',
            quantity: 1,
            costGetter: this.$store.getters['values']('occultists.costGetter')
          })
        }},
        {key: 'ctrl+o', handler: () => {
          purchase({
            store: this.$store,
            unit: 'occultists',
            quantity: 10,
            costGetter: this.$store.getters['values']('occultists.costGetter')
          })
        }},
        {key: 'shift+o', handler: () => {
          purchase({
            store: this.$store,
            unit: 'occultists',
            quantity: 100,
            costGetter: this.$store.getters['values']('occultists.costGetter')
          })
        }},
        {key: 'ctrl+shift+o', handler: () => {
          let buyable = this.$store.getters['values']('occultists.buyMaxGetter')()
          purchase({
            store: this.$store,
            unit: 'occultists',
            quantity: buyable,
            costGetter: this.$store.getters['values']('occultists.costGetter')
          })
        }},
      ]
    }
  },
  mounted () {
    bind(this.hotkeys)
  },
  unmounted () {
    unbind(this.hotkeys)
    if (this.huntInterval) {
      window.clearInterval(this.huntInterval)
    }
  },
  computed: {
    canBuyMaxUpgrades () {
      let available = this.$store.state.current.souls
      return (
        this.$store.getters['values']('upgrades.available').length > 0
        && this.$store.getters['values']('upgrades.available')[0].cost <= available
      )
    }
  },
  methods: {
    startHunting () {
      this.huntStarted = true
      if (this.huntInterval) {
        window.clearInterval(this.huntInterval)
      }
      window.setTimeout(() => {
        if (this.huntStarted) {
          this.huntInterval = window.setInterval(() => {
            this.hunt()
          })
        }
      }, 25)
    },
    stopHunting () {
      if (this.huntInterval) {
        window.clearInterval(this.huntInterval)
      }
      this.huntStarted = false
    },
    hunt: throttle(function() {
      this.$store.commit(
        'gatherSouls',
        {
          hunts: 1,
          power: this.$store.getters['values']('hunt.power'),
          pain: this.$store.getters['values']('pain.enabled') ? this.$store.getters['values']('hunt.pain') : 0,
        }
      )
    }, 50),
    buyMaxUpgrades () {
      let buyable = getBuyableUpgrades(
        this.$store.getters['values']('upgrades.available'),
        this.$store.state.current.souls
      )
      for (const upgrade of buyable) {
        this.$store.commit('purchaseUpgrade', {id: upgrade.id, cost: upgrade.cost })
      }
    }
  }
}
</script>
