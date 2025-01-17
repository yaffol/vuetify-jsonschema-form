import Vue from 'vue'
import Vuetify from 'vuetify'
import Draggable from 'vuedraggable'
import { createLocalVue, mount } from '@vue/test-utils'
import VJsf from '../lib/VJsfNoDeps.js'
import ExampleForm from './example-form.vue'
import { defaultTemplate } from '../doc/examples'

const Ajv = require('ajv')

Vue.use(Vuetify)
const localVue = createLocalVue()
localVue.component('v-jsf', VJsf)
localVue.component('draggable', Draggable)

exports.getExampleWrapper = (example) => {
  const vuetify = new Vuetify({ mocks: { $vuetify: { theme: { themes: {} } } } })

  // localVue.use(Vuetify)

  // const wrapper = mount(VJsf, { vuetify, propsData: example })
  // Vue.options.components.VForm.$options.components = Vue.options.components
  // const wrapper = mount(localVue.options.components.VForm, {
  const template = (example.template || defaultTemplate)
    .replace('"model"', '"props.modelWrapper.model"')
    .replace('"schema"', '"props.schema"')
    .replace('"options"', '"props.options"')
    .replace('logEvent', 'props.logEvent')

  if (template.includes('slot-scope')) {
    // TODO: investigate
    console.log('No test for example with scoped slots')
    return
  }

  const options = {
    ...example.options,
    ajv: Ajv(),
    httpLib: {
      get: (url) => {
        const result = example.httpMocks[url]
        if (!result) {
          console.warn(`in example ${example.id}, missing mock for url ${url}`)
          return new Promise(resolve => resolve({ data: {} }))
        }
        return new Promise(resolve => resolve({ data: result }))
      }
    }
  }

  return mount(ExampleForm, {
    localVue,
    vuetify,
    scopedSlots: {
      default: template
    },
    propsData: {
      modelWrapper: { model: example.model || {} },
      schema: example.schema,
      options
    },
    provide: {
      theme: {}
    }
  })
}
