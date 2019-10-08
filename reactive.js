// 存放代理后的对象
const toProxy = new WeakMap()
// 存放原始的对象
const toRaw = new WeakMap()

// 假设这是视图更新方法
let trigger = function() {}

function setTrigger(t) {
  trigger = t
}

function isObject(target) {
  return typeof target === 'object' && target !== null
}

// 将传入对象定义成响应式
function reactive(target) {
  if (!isObject(target)) {
    return target
  }

  // 传入的对象被代理过了
  if (toProxy.has(target)) {
    return toProxy.get(target)
  }

  // 传入的是个代理过的对象
  if (toRaw.has(target)) {
    return target
  }

  const handlers = {
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      if (target.hasOwnProperty(key)) {
        trigger()
      }
      return res
    },
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      if (isObject(target[key])) {
        return reactive(res)
      }
      return res
    }, 
    deleteProperty(target, key) {
      return Reflect.deleteProperty(target, key)
    },
  }
  const observed = new Proxy(target, handlers)

  toProxy.set(target, observed)
  toRaw.set(observed, target)

  return observed
}

