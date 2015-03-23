# cytoscape.js-html-renderer

## API

Specify 'html' as renderer.name.

```js
  $(function(){
    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      renderer: {
        name: "html"
      }
      style: [
        {
          selector: 'node',
          css: {
            'html': 'data(html)',
            'width': '200px',
            'height': '200px'
          }
        }
      ],
      elements: {
        nodes: [
          { data: { id: '1', html: '<strong>Some HTML</strong>' } },
          { data: { id: '2', html: '<table><tbody><tr><td>Some HTML</td></tr></tbody></table>' } },
          { data: { id: '3', html: '<div style="width:200px;height:200px;background-color:green;'>Some HTML</div>' } }
        ],
        edges: [
          { data: { source: '1', target: '2' } },
          { data: { source: '2', target: '3' } },
          { data: { source: '3', target: '1' } }
        ]
      }
    });
  });
