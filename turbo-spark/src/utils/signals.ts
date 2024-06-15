let sub: Function | null = null

export function ref<T>(value?: T) {
	const subs = new Set()

	return {
		get value() {
			if (sub) {
				subs.add(sub)
			}
			return value
		},
		set value(updated) {
			value = updated
			subs.forEach((fn: any) => fn())
		},
	}
}

export function effect(fn: () => void | any) {
	sub = fn
	fn()
	sub = null
}

export function computed<T>(fn: () => T | void | any) {
	const c = ref<T>()
	effect(() => {
		c.value = fn()
	})
	return c
}