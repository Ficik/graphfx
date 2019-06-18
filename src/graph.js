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

    static deserialize(nodes) {
        const graph = new Graph();
        graph.nodes = createNodes(nodes);
        for (let {node} of graph.nodes) {
          node.subject.on('running', (isRunning) => {
            graph.__nodesActive += isRunning ? 1 : -1;
            clearTimeout(graph.__nodesActiveDebounce);
            graph.__nodesActiveDebounce = setTimeout(() => {
              if (graph.__nodesActive > 0) {
                graph.subject.next('running');
              } else {
                graph.subject.next('stopped');
              }
            }, 16);
          });
        }
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
