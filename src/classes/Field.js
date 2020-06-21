
// Mutable class that holds a field value and state
export class Field {
	// Initial field value + whether field must contain a value when tested
	constructor(initialVal, isRequired) {
		// This field is not intended to be edited from outside
		this._value = initialVal;
		this.isRequired = isRequired;
		this.isMissing = false;
	}

	// Current value of this field
	get value() {
		return this._value
	}
	set value(newVal) { 
		this._value = newVal
		if (this.isMissing && newVal != "" && newVal != null)
			this.isMissing = false
	}

	// Empties this field
	clear() {
		this.value = ""
	}

	// Marks this field as missing if necessary
	test() {
		this.isMissing = this.isRequired && this.value == null || this.value == "";
		return !this.isMissing;
	}
}