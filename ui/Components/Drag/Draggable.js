import interact from 'interactjs';

export default {
  abstract: true,
  render() {
    try {
      return this.$slots.default[0];
    } catch (e) {
      throw new Error('Exactly one child component needed.');
    }
    return null;
  },
  mounted () {
    const el = this.$slots.default[0].elm;
    this.$nextTick(() => {
      interact(el)
      .draggable({
        onmove: (event) => {
          this.$emit('move', event);
        }
      })
    })
  }
}