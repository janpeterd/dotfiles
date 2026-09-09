# Requested behavior

`render_graph(nodes, edges)` returns one line per node in stable topological order. Each line contains the node identifier and its dependency rank. Unknown edge endpoints and cycles are rejected.
