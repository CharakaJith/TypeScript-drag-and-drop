export function autobind(target: any, methodName: string, descreptor: PropertyDescriptor) {
  const originalMethod = descreptor.value;

  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);

      return boundFunction;
    },
  };

  return adjDescriptor;
}
