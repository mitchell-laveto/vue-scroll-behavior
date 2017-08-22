/**
  * vue-scroll-behavior v0.1.6
  * (c) 2017 jeneser
  * @license MIT
  */

import { setOption, isIgnoreRoute, getScrollPosition, setScrollPosition,
  cleanHistoryList } from './utils/helpers'

const vueScrollBehavior = {
  _maxLength: 50,
  _ignore: []
}

/**
 * Plugin API
 * vsbHistoryList [property]
 * vueScrollBehavior [function]
 */
vueScrollBehavior.install = function (Vue, options) {

  // Init options
  setOption(options)

  // Global property
  Vue.vsbHistoryList = []

  // Global method
  Vue.vueScrollBehavior = function (router) {

    if (typeof router === 'object' && typeof router.beforeEach === 'function') {
      // Router beforeEach
      router.beforeEach((to, from, next) => {

        // Ignore route
        if (isIgnoreRoute(from)) {

          next()

        } else {

          let _historyList = this.vsbHistoryList
          let position = getScrollPosition()
          let currentPathIndex = _historyList.findIndex(e => {
            return e.path === from.fullPath
          })

          // Cleaning historyList
          if (_historyList.length >= vueScrollBehavior._maxLength) {
            cleanHistoryList(_historyList)
          }

          if (currentPathIndex !== -1) {
            _historyList[currentPathIndex].position = position
          } else {
            _historyList.push({
              path: from.fullPath,
              position: position
            })
          }

          next()
        }

      })

      function setScrollPositionWithCallback (route, position = {x: 0, y: 0}) {
          console.log('set scroll to', position)
          setScrollPosition(Vue, options.callback ? options.callback(route, position) : position)
      }

      // Router afterEach
      router.afterEach(route => {

        if (isIgnoreRoute(route)) {
          setScrollPositionWithCallback(route)
        } else {

          let savedPosition = this.vsbHistoryList.find(e => {
            return e.path === route.fullPath
          })

          if (typeof savedPosition !== 'undefined') {
            setScrollPositionWithCallback(route, savedPosition.position)
          } else {
            setScrollPositionWithCallback(route)
          }
        }

      })

    } else {
      console.warn('Vue-scroll-behavior dependent on vue-router! ' +
        'Please create the router instance.')
    }
  }

  Vue.vueScrollBehavior(options.router)
}

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(vueScrollBehavior)
}

export default vueScrollBehavior
