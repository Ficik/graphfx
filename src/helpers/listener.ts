type Listener<V> = ((val: V) => void);

export class Subject<V> {

  __listeners: Listener<V>[]

  constructor() {
    this.__listeners = [];
  }

  next(val:V) {
    for (let listener of this.__listeners) {
      listener(val);
    }
  }

  once():Promise<V> {
    return new Promise((resolve) => {
      const done = (val) => {
        resolve(val);
        this.off(done);
      };
      this.on(done);
    })
  }

  on(fn:Listener<V>) {
    this.__listeners.push(fn);
  }

  off(fn:Listener<V>) {
    this.__listeners = this.__listeners.filter((listener) => listener !== fn);
  }

  destroy() {
    this.__listeners = [];
  }
}

export class MultiSubject {
  __subjects: {
    [name: string]: Subject<any>
  }

  constructor(types: string[]) {
    this.__subjects = {};
    for (let type of types) {
      this.__subjects[type] = new Subject();
    }
  }

  next(type, val) {
    this.__subjects[type].next(val);
  }

  once(type) {
    return this.__subjects[type].once();
  }

  on(type, fn) {
    return this.__subjects[type].on(fn);
  }

  off(type, fn) {
    this.__subjects[type].off(fn);
  }

  destroy() {
    for (let type of Object.keys(this.__subjects)) {
      this.__subjects[type].destroy();
    }
  }
}

