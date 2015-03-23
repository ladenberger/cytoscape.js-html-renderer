;
(function () {
    'use strict';

    var register = function ($$) {

        if (!$$) { return; }

        var CanvasRenderer = $$.extension('renderer', 'canvas');

        function HtmlRenderer(options) {
            CanvasRenderer.call(this, options);
            this.data.htmlContainer = document.createElement('div');
            this.data.htmlContainer.className = "htmlContainer";
            this.data.htmlContainer.style = $$.util.extend(this.data.htmlContainer.style, {
                postion: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            });
            this.data.container.appendChild(this.data.htmlContainer);
        }

        HtmlRenderer.prototype = Object.create(CanvasRenderer.prototype);
        HtmlRenderer.prototype.constructor = HtmlRenderer;
        $$.util.extend(HtmlRenderer, CanvasRenderer);

        HtmlRenderer.prototype.drawNode = function (context, node, drawOverlayInstead) {

            var position = node._private.position;
            var zoom = node.cy().zoom();
            var pan = node.cy().pan();
            var style = node._private.style;

            var r = this;
            var nodeWidth, nodeHeight;
            var style = node._private.style;
            var rs = node._private.rscratch;

            var usePaths = CanvasRenderer.usePaths();
            var canvasContext = context;
            var path;
            var pathCacheHit = false;

            var overlayPadding = style['overlay-padding'].pxValue;
            var overlayOpacity = style['overlay-opacity'].value;
            var overlayColor = style['overlay-color'].value;

            if (drawOverlayInstead && overlayOpacity === 0) { // exit early if drawing overlay but none to draw
                return;
            }

            var parentOpacity = node.effectiveOpacity();
            if (parentOpacity === 0) {
                return;
            }

            nodeWidth = this.getNodeWidth(node);
            nodeHeight = this.getNodeHeight(node);

            context.lineWidth = style['border-width'].pxValue;

            if (drawOverlayInstead === undefined || !drawOverlayInstead) {

                // Node color & opacity
                var borderColor = style['border-color'].value;
                var borderStyle = style['border-style'].value;

                this.strokeStyle(context, borderColor[0], borderColor[1], borderColor[2], style['border-opacity'].value * style['opacity'].value * parentOpacity);

                context.lineJoin = 'miter'; // so borders are square with the node shape

                if (context.setLineDash) { // for very outofdate browsers
                    switch (borderStyle) {
                        case 'dotted':
                            context.setLineDash([1, 1]);
                            break;

                        case 'dashed':
                            context.setLineDash([4, 2]);
                            break;

                        case 'solid':
                        case 'double':
                            context.setLineDash([]);
                            break;
                    }
                }

                var styleShape = style['shape'].strValue;

                var pos = node._private.position;

                if (usePaths) {
                    var pathCacheKey = styleShape + '$' + nodeWidth + '$' + nodeHeight;

                    context.translate(pos.x, pos.y);

                    if (rs.pathCacheKey === pathCacheKey) {
                        path = context = rs.pathCache;
                        pathCacheHit = true;
                    } else {
                        path = context = new Path2D();
                        rs.pathCacheKey = pathCacheKey;
                        rs.pathCache = path;
                    }
                }

                if (!pathCacheHit) {

                    var npos = pos;

                    if (usePaths) {
                        npos = {
                            x: 0,
                            y: 0
                        };
                    }

                    CanvasRenderer.nodeShapes[this.getNodeShape(node)].drawPath(
                        context,
                        npos.x,
                        npos.y,
                        nodeWidth,
                        nodeHeight);
                }

                context = canvasContext;

                var borderWidth = style['border-width'].pxValue;

                // Border width, draw border
                if (borderWidth > 0) {

                    if (usePaths) {
                        context.stroke(path);
                    } else {
                        context.stroke();
                    }

                    if (borderStyle === 'double') {
                        context.lineWidth = style['border-width'].pxValue / 3;

                        var gco = context.globalCompositeOperation;
                        context.globalCompositeOperation = 'destination-out';

                        if (usePaths) {
                            context.stroke(path);
                        } else {
                            context.stroke();
                        }

                        context.globalCompositeOperation = gco;
                    }

                }

                if (usePaths) {
                    context.translate(-pos.x, -pos.y);
                }

                // reset in case we changed the border style
                if (context.setLineDash) { // for very outofdate browsers
                    context.setLineDash([]);
                }

                // draw the overlay
            } else {

                if (overlayOpacity > 0) {
                    this.fillStyle(context, overlayColor[0], overlayColor[1], overlayColor[2], overlayOpacity);

                    CanvasRenderer.nodeShapes['roundrectangle'].drawPath(
                        context,
                        node._private.position.x,
                        node._private.position.y,
                        nodeWidth + overlayPadding * 2,
                        nodeHeight + overlayPadding * 2
                    );

                    context.fill();
                }
            }

            var html_object = node._private.htmlObject;
            if (!html_object) {
                var html_object = document.createElement('div');
                node._private.htmlObject = html_object;
                html_object.innerHTML = node._private.data.html || "";
                html_object.style = $$.util.extend(html_object.style, {
                    position: "absolute",
                    width: (nodeWidth - 4) + "px",
                    height: (nodeHeight - 4) + "px",
                    overflow: "hidden"
                });
                this.data.htmlContainer.appendChild(html_object);
            }
            var transform = "translate(" + (zoom * position.x + 2 + pan.x - nodeWidth / 2) + "px," + (zoom * position.y + 2 + pan.y - nodeHeight / 2) + "px) scale(" + zoom + ", " + zoom + ")";
            html_object.style.marginBottom = Math.random();
            html_object.style.transform = transform;
            html_object.style.msTransform = transform;
            html_object.style.WebkitTransform = transform;

        };

        $$('renderer', 'html', HtmlRenderer);

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape-html', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape);
    }

})();
