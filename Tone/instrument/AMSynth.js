define(["Tone/core/Tone", "Tone/instrument/MonoSynth", "Tone/signal/Signal", "Tone/signal/Multiply", 
	"Tone/instrument/Monophonic", "Tone/signal/AudioToGain"], 
function(Tone){

	"use strict";

	/**
	 *  @class  the AMSynth is an amplitude modulation synthesizer
	 *          composed of two MonoSynths where one MonoSynth is the 
	 *          carrier and the second is the modulator.
	 *
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 *  @param {Object} options the options available for the synth 
	 *                          see defaults below
	 *  @example
	 *  var synth = new Tone.AMSynth();
	 */
	Tone.AMSynth = function(options){

		options = this.defaultArg(options, Tone.AMSynth.defaults);
		Tone.Monophonic.call(this, options);

		/**
		 *  the first voice
		 *  @type {Tone.MonoSynth}
		 */
		this.carrier = new Tone.MonoSynth(options.carrier);
		this.carrier.volume.value = -10;

		/**
		 *  the second voice
		 *  @type {Tone.MonoSynth}
		 */
		this.modulator = new Tone.MonoSynth(options.modulator);
		this.modulator.volume.value = -10;

		/**
		 *  the frequency control
		 *  @type {Tone.Signal}
		 */
		this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

		/**
		 *  the ratio between the two voices
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._harmonicity = new Tone.Multiply(options.harmonicity);

		/**
		 *  convert the -1,1 output to 0,1
		 *  @type {Tone.AudioToGain}
		 *  @private
		 */
		this._modulationScale = new Tone.AudioToGain();

		/**
		 *  the node where the modulation happens
		 *  @type {GainNode}
		 *  @private
		 */
		this._modulationNode = this.context.createGain();

		//control the two voices frequency
		this.frequency.connect(this.carrier.frequency);
		this.frequency.chain(this._harmonicity, this.modulator.frequency);
		this.modulator.chain(this._modulationScale, this._modulationNode.gain);
		this.carrier.chain(this._modulationNode, this.output);
	};

	Tone.extend(Tone.AMSynth, Tone.Monophonic);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.AMSynth.defaults = {
		"harmonicity" : 3,
		"carrier" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "sine"
			},
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.01,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 0.01,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5,
				"min" : 20000,
				"max" : 20000
			}
		},
		"modulator" : {
			"volume" : -10,
			"portamento" : 0,
			"oscillator" : {
				"type" : "square"
			},
			"envelope" : {
				"attack" : 2,
				"decay" : 0.0,
				"sustain" : 1,
				"release" : 0.5
			},
			"filterEnvelope" : {
				"attack" : 4,
				"decay" : 0.2,
				"sustain" : 0.5,
				"release" : 0.5,
				"min" : 20,
				"max" : 1500
			}
		}
	};

	/**
	 *  trigger the attack portion of the note
	 *  
	 *  @param  {Tone.Time} [time=now] the time the note will occur
	 *  @param {number} [velocity=1] the velocity of the note
	 *  @returns {Tone.AMSynth} `this`
	 */
	Tone.AMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
		//the port glide
		time = this.toSeconds(time);
		//the envelopes
		this.carrier.envelope.triggerAttack(time, velocity);
		this.modulator.envelope.triggerAttack(time);
		this.carrier.filterEnvelope.triggerAttack(time);
		this.modulator.filterEnvelope.triggerAttack(time);
		return this;
	};

	/**
	 *  trigger the release portion of the note
	 *  
	 *  @param  {Tone.Time} [time=now] the time the note will release
	 *  @returns {Tone.AMSynth} `this`
	 */
	Tone.AMSynth.prototype.triggerEnvelopeRelease = function(time){
		this.carrier.triggerRelease(time);
		this.modulator.triggerRelease(time);
		return this;
	};

	/**
	 * The ratio between the two carrier and the modulator. 
	 * @memberOf Tone.AMSynth#
	 * @type {number}
	 * @name harmonicity
	 */
	Object.defineProperty(Tone.AMSynth.prototype, "harmonicity", {
		get : function(){
			return this._harmonicity.value;
		},
		set : function(harm){
			this._harmonicity.value = harm;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.AMSynth} `this`
	 */
	Tone.AMSynth.prototype.dispose = function(){
		Tone.Monophonic.prototype.dispose.call(this);
		this.carrier.dispose();
		this.carrier = null;
		this.modulator.dispose();
		this.modulator = null;
		this.frequency.dispose();
		this.frequency = null;
		this._harmonicity.dispose();
		this._harmonicity = null;
		this._modulationScale.dispose();
		this._modulationScale = null;
		this._modulationNode.disconnect();
		this._modulationNode = null;
		return this;
	};

	return Tone.AMSynth;
});