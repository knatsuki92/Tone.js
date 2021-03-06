define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class  Base class for all Signals
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.SignalBase = function(){

	};

	Tone.extend(Tone.SignalBase);

	/**
	 *  When signals connect to other signals or AudioParams, 
	 *  they take over the output value of that signal or AudioParam. 
	 *  For all other nodes, the behavior is the same as a normal `connect`. 
	 *
	 *  @override
	 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node 
	 *  @param {number} [outputNumber=0] 
	 *  @param {number} [inputNumber=0] 
	 *  @returns {Tone.SignalBase} `this`
	 */
	Tone.SignalBase.prototype.connect = function(node, outputNumber, inputNumber){
		//zero it out so that the signal can have full control
		if (node.constructor === Tone.Signal){
			//cancel changes
			node._value.cancelScheduledValues(0);
			//reset the value
			node._value.value = 0;
		} else if (node instanceof AudioParam){
			node.cancelScheduledValues(0);
			node.value = 0;
		} 
		Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
		return this;
	};

	return Tone.SignalBase;
});