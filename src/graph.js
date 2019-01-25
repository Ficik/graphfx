import * as nodes from './nodes';


export default class Graph {

    constructor() {
        this.nodes = [];
    }

    serialize() {
        return this.nodes.map(({node, x, y}) => ({
            node: node.serialize(),
            x, y,
        }));
    }

    static deserialize(nodes) {
        const graph = new Graph();
        graph.nodes = createNodes(nodes);
        return graph;
    }

    findIOByLabel(label) {
        const results = [];
        const isMatch = label instanceof RegExp ? (val) => label.test(val) : (val) => val === label;
        for (let {node} of this.nodes) {
            for (let name of Object.keys(node.in.variables)) {
                if (isMatch(node.in[name].label)) {
                    results.push(node.in[name])
                }
            }
            for (let name of Object.keys(node.out.variables)) {
                if (isMatch(node.out[name].label)) {
                    results.push(node.out[name])
                }
            }
        }
        return results;
    }

    destroy() {
        for(let {node} of this.nodes) {
            node.destroy();
        }
    }

}



export const createNode = ({name, options, id}) => {
    try {
        const node = new nodes[name](options);
        node.deserialize({id, options});
        return node;
    } catch (err) {
        console.error('Failed to create node', name, err)
    }
  }

  export const createNodes = (nodes) => {
    nodes = nodes.map(({node, x, y}) => {
      const nodeInstance = createNode(node);
      return ({
        node: nodeInstance,
        x, y,
        connect(outputs) {
          try {
            nodeInstance.reconnect(node, outputs);
          } catch(err) {
            console.error('Can\'t recoonect', nodeInstance, err);
          }
        }
      });
    }).filter(({node}) => node);

    const outputsById = nodes
      .map(({node}) => Object.values(node.out.__values))
      .reduce((acc, nxt) => acc.concat(nxt), [])
      .reduce((acc, nxt) => {
        acc[nxt.id] = nxt;
        return acc;
      }, {});

    return nodes.map(({node, x, y, connect}) => {
      connect(outputsById);
      return {node,x,y};
    })
  }
