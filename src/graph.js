import * as nodes from './nodes';
import {MultiSubject} from './helpers/listener';


export default class Graph {

    constructor() {
        this.nodes = [];
        this.__nodesActive = 0;
        this.__nodesActiveDebounce = null;
        this.subject = new MultiSubject(['running', 'stopped']);
    }

    serialize() {
        return this.nodes.map(({node, x, y}) => ({
            node: node.serialize(),
            x, y,
        }));
    }

    static async deserialize(nodes) {
        const graph = new Graph();
        const isRunningSet = new WeakSet();
        graph.nodes = await createUnconnectedNodes(nodes);
        for (const {node} of graph.nodes) {
          node.subject.on('running', (isRunning) => {
            if (!isRunning && isRunningSet.has(node)) {
              isRunningSet.delete(node);
              graph.__nodesActive -= 1;
            } else if (isRunning && !isRunningSet.has(node)) {
              isRunningSet.add(node);
              graph.__nodesActive += 1;
            }
            if (graph.__nodesActive > 0) {
              graph.subject.next('running');
            } else {
              console.info('[Graphfx] graph stopped');
              graph.subject.next('stopped');
            }
          });
        }
        graph.nodes = await reconnectNodes(graph.nodes);
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



export const createNode = async ({name, options, id}) => {
    try {
        const node = new nodes[name](options);
        await node.deserialize({id, options});
        return node;
    } catch (err) {
        console.error('Failed to create node', name, err)
    }
  }

export const createUnconnectedNodes = async (nodes) => {
  return (await Promise.all(nodes.map(async ({node, x, y}) => {
    const nodeInstance = await createNode(node);
    return ({
      node: nodeInstance,
      x, y,
      async connect(outputs) {
        try {
          await nodeInstance.reconnect(node, outputs);
        } catch(err) {
          console.error('Can\'t recoonect', nodeInstance, err);
        }
      }
    });
  }))).filter(({node}) => node);
}

export const reconnectNodes = async (nodes) => {
  const outputsById = nodes
    .map(({node}) => Object.values(node.out.__values))
    .reduce((acc, nxt) => acc.concat(nxt), [])
    .reduce((acc, nxt) => {
      acc[nxt.id] = nxt;
      return acc;
    }, {});

  return await Promise.all(nodes.map(async ({node, x, y, connect}) => {
    await connect(outputsById);
    return {node,x,y};
  }))
}

export const createNodes = async (nodes) => {
  nodes = await createUnconnectedNodes(nodes);
  return reconnectNodes(nodes);
}
