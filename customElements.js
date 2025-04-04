class VerticalLine extends HTMLElement {
    connectedCallback() {
        // Get line length from attribute or set default value
        const lineLength = this.getAttribute('line-length') || 240;

        this.innerHTML = `
            <svg height="${parseInt(lineLength) + 10}" width="40" xmlns="http://www.w3.org/2000/svg">
                <!-- Marker definition(circle) -->
                <defs>
                <!--markerUnits="userSpaceOnUse needed to change line thickness without changing marker size-->
                    <marker id="circle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                        <circle cx="4" cy="4" r="4" fill="#86c6a7" />
                    </marker>
                </defs>
            
                <!-- Line with markers in the form of circles -->
                <!--use stroke-width:2px; to change line thickness-->
                <line x1="10" y1="5" x2="10" y2="${lineLength}" 
                      style="stroke:#86c6a7;stroke-width:1,5px;" 
                      marker-start="url(#circle)" marker-end="url(#circle)" />
            </svg>
        `;
    }

    // Update the line length if the attribute changes
    static get observedAttributes() {
        return ['line-length'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'line-length') {
            this.connectedCallback(); // Redraw the element with the new length
        }
    }
}

customElements.define('vertical-line-with-circle-marker', VerticalLine);  