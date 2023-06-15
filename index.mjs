/**
 * Fundamental object model for UI elements that supports templating, event
 * binding, and more.
 */

import handlebars from "handlebars";

/**
 * Base object of all TripletUI models.
 * 
 * @property {HTMLDivElement} subdom - DOM node used for grafting and population during rendering
 * @property {Array} eventInterfaces - Array of "specifications" for events that will be bound to the DOM
 * @property {Object} eventListeners - Map of tags to specific (external) subscribers
 * @property {Function} compiledTemplate - Compiled handlebars template to be consumed upon rendering
 */
class TripletUI {
    constructor(RAW_TEMPLATE) {
        this.subdom = window.document.createElement("div"); // "standing" dom node
        this.eventInterfaces = []; // "stack" of event pathways to bind upon rendering
        this.eventListeners = {}; // mapping of publication listeners
        this.compiledTemplate = handlebars.compile(RAW_TEMPLATE);
    }

    /**
     * Basic procedural property assignment for chaining.
     * 
     * @param {String} key - Name of property to assign
     * @param {*} value - Value of property to assign
     * @returns {TripletUI} - This instance, returned to support chaining
     */
    set(key, value) {
        this[key] = value;
        return this;
    }

    /**
     * Adds a specific (external) listener to a tag used to publish specific
     * events.
     * 
     * @param {String} tag - Tag used to identify a specific event unique to this UI element instance
     * @param {Function} listener - Function to be invoked when the given event is broadcast
     * @returns {TripletUI} - This instance, returned to support chaining
     */
    on(tag, listener) {
        if (!this.eventListeners.hasOwnProperty(tag)) {
            this.eventListeners[tag] = [];
        }
        this.eventListeners[tag].push(listener);
        return this;
    }

    /**
     * Internal method used to relay the publication of events to any listeners
     * assigned by the "on()" method.
     * 
     * @param {String} tag - Event "type" to broadcast, unique to this UI element instance
     * @param {Object} event - Object event model, typically (though not necessarily) extended from some underlying DOM event (such as onclick parameters)
     */
    publish(tag, event) {
        if (!this.eventListeners.hasOwnProperty(tag)) {
            this.eventListeners[tag] = [];
        }
        this.eventListeners[tag].forEach(listener => listener(event));
    }
    
    /**
     * Attaches subdom to a specific parent node after the contents have been
     * rendered and any specific DOM event interfaces have been resolved.
     * 
     * @param {HTMLElement} parent - Any element provided by the caller, to which the subdom will be attached
     * @returns {TripletUI} - This instance
     */
    render(parent) {
        this.subdom.innerHTML = this.compiledTemplate(this);
        parent.appendChild(this.subdom);
        this.eventInterfaces.forEach(eventBinding => {
            this.subdom.querySelectorAll(eventBinding[0]).forEach(domNode => {
                domNode.addEventListener(eventBinding[1], function (event) {
                    this.publish(eventBinding[2], event);
                }.bind(this));
            });
        });
        return this;
    }
}

export default Object.assign(TripletUI, {
    "__tests__": {
        "can be tested": () => {
            expect(true).toEqual(true);
        }
    }
});
