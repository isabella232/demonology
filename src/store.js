import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import throttle from 'lodash/throttle'
import uniq from 'lodash/uniq'

import {DEFAULT_VALUES, getValueGetter} from './game'

function inc (state, {name, value}) {
  state.current[name] += value
  state.awakening[name] += value
  state.harvest[name] += value
  state.total[name] += value
}

export function getDefaultState () {
  return {
    time: {
      gameStart: (new Date()).getTime(),
      awakeningStart: (new Date()).getTime(),
      harvestStart: (new Date()).getTime(),
      lastTick: (new Date()).getTime(),
    },
    current: {
      ...DEFAULT_VALUES
    },
    awakening: {
      ...DEFAULT_VALUES
    },
    harvest: {
      ...DEFAULT_VALUES
    },
    total: {
      ...DEFAULT_VALUES
    },
    settings: {
      notation: "default",
      debug: process.env.NODE_ENV === 'development',
    }
  }
}

export const mutations = {
  increment (state, {name, value}) {
    inc(state, {name, value})
  },
  gatherSouls (state, {hunts = 0, power, pain = 0}) {
    let available = state.current.preys
    let gathered = Math.min(power, available)
    let ratio = gathered / power

    if (gathered <= 0) {
      console.log("No more preys to gather")
      return
    }
    inc(state, {name: 'souls', value: gathered})
    if (hunts > 0) {
      inc(state, {name: 'hunts', value: hunts})
      inc(state, {name: 'hunted', value: gathered})
    }
    if (pain > 0) {
      inc(state, {name: 'pain', value: pain * ratio})
    }
    
    state.current.preys -= gathered
  },
  lastTick (state, time) {
    state.time.lastTick = time
  },
  reset (state) {
    state.current = {...DEFAULT_VALUES}
    state.awakening = {...DEFAULT_VALUES}
    state.harvest = {...DEFAULT_VALUES}
    state.total = {...DEFAULT_VALUES}
  },
  hardReset (state) {
    Object.assign(state, getDefaultState())
  },
  setting (state, {name, value}) {
    state.settings[name] = value
  },
  purchase (state, {name, quantity, cost}) {
    let available = state.current[cost.unit]
    if (available < cost.value) {
      console.warn(`Cannot purchase ${quantity} ${name} for ${cost}: only ${available} available`);
      return
    }
    state.current[cost.unit] -= cost.value
    inc(state, {name, value: quantity})
  },
  purchaseUpgrade (state, {id, cost}) {
    if (state.current.upgrades.indexOf(id) > -1) {
      console.warn(`Upgrade ${id} already purchased`)
      return
    }
    let available = state.current.souls
    if (available < cost) {
      console.warn(`Cannot purchase upgrade ${id} for ${cost}: only ${available} available`);
      return
    }
    state.current.souls -= cost 
    state.current.upgrades = uniq([...state.current.upgrades, id])
    state.awakening.upgrades = uniq([...state.awakening.upgrades, id])
    state.harvest.upgrades = uniq([...state.harvest.upgrades, id])
    state.total.upgrades = uniq([...state.total.upgrades, id])
  },
  setFromDebug (state, {namespace, name, value}) {
    state[namespace][name] = value
  },
  sleep (state) {
    state.current = {...DEFAULT_VALUES}
    state.awakening = {...DEFAULT_VALUES}
    state.total.awakenings += 1
  },
  name (state, value) {
    state.current.name = value
  }
}

export const actions = {
  tick ({state, commit, getters}, to) {
    let elapsed = to - state.time.lastTick
    let ticks = elapsed / getters.values('tick.duration')
    if (ticks > 0) {
      if (getters.values('occultists.soulsPerTick') > 0) {
        let power = getters.values('occultists.soulsPerTick') * ticks
        let pain = getters.values('occultists.painPerTick') * ticks
        commit('gatherSouls', {power, pain})
      }
    }
    commit('lastTick', to)
  }
}

const STORE = createStore({
  state: {
    ...getDefaultState()
  },
  mutations,
  actions,
  getters: {
    values () {
      return (key) => {return GET(key)}
    },
  },
  plugins: [
    new VuexPersistence({
      reducer: (state) => ({
        current: state.current,
        awakening: state.awakening,
        total: state.total,
        settings: state.settings,
        time: state.time,
      }),
      saveState: throttle(
        (key, state, storage) => {
          storage[key] = JSON.stringify(state)
        }, 3000)
    }).plugin
  ]
})

const GET = getValueGetter(STORE.state)

export default STORE
