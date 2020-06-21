
function createElement(type, classes = [], id = "") {
	const el = document.createElement(type)
	if (classes.length > 0)
		el.setAttribute("class", classes.join(" "))
	if (id.length != "")
		el.setAttribute("id", id)

	return el
}

// Component logic

const template = document.createElement("template")
template.innerHTML = `
<div id="main-div">
<style> @import "https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.0/css/bulma.min.css"; </style>
	<form class="block">
		<div class="field">
			<label class="label">Email</label>
			<input class="input" type="text" id="email">
		</div>
		<div class="field">
			<label class="label">Password</label>
			<input class="input" type="password" id="password">
		</div>
		<button type="button" class="button is-primary"">Login</button>
	</form>
</div>`

// Notice: Generates events named "login" which contain the user email address in 'details'
// Target server address is read from attribute named 'endpoint' (required)
class LoginComponent extends HTMLElement {
	constructor() { 
		super()

		// Sets up the shadow DOM
		this.attachShadow({ mode: "open" })
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		// Sets up element-related properties
		this.mainDiv = this.field("#main-div")
		this.emailField = this.field("#email")
		this.passwordField = this.field("#password")
		this.button = this.field("button")

		// Error block is not attached to the main DOM initially
		this.isShowingError = false
		this.errorBlock = createElement("div", ["block"])
		this.errorField = createElement("div", ["notification is-danger"])
		this.errorBlock.appendChild(this.errorField)

		this.buttonListener = () => this.onSubmitPressed()
		// this.shadowRoot.addEventListener("login", e => console.log("Login event: " + e))
	}

	get postAddress() {
		return this.getAttribute("endpoint")
	}

	get fields() {
		return [this.emailField, this.passwordField]
	}

	connectedCallback() {
		// Listens to click events in the button
		this.button.addEventListener("click", this.buttonListener)
	}

	disconnectedCallback() {
		// Stops listening for click events
		this.button.removeEventListener("click", this.buttonListener)
	}

	// A shorter syntax for finding elements inside the shadow dom
	field(selector) {
		return this.shadowRoot.querySelector(selector)
	}

	testField(field) { 
		const isOk = field.value != ""
		if (!isOk)
			field.classList.add("is-danger")
		return isOk
	}

	showError(errorMessage) { 
		this.errorField.textContent = errorMessage
		if (!this.isShowingError)
			this.mainDiv.appendChild(this.errorBlock)
	}

	clearError() {
		if (this.isShowingError)
			this.mainDiv.removeChild(this.errorBlock)
		this.fields.forEach(f => f.classList.remove("is-danger"))
	}

	postCredentials() {
		return fetch(this.postAddress, {
			method: "post", 
			headers: {
				"Accept": "*/*", 
				"Content-Type": "application/json"
			}, 
			body: JSON.stringify({ email: this.emailField.value, password: this.passwordField.value })
		})
	}

	// Sends an authorization request to the server and handles the result
	onSubmitPressed() { 
		// Checks the fields first
		if (this.fields.every(this.testField))
		{
			this.clearError()
			// Button is set to loading during the request
			this.button.classList.add("is-loading")
			const t = this
			this.postCredentials()
				.then(r => t.onResponseReceived(t, r))
				.catch(r => t.onRequestFailed(t, r))
				.then(u => t.button.classList.remove("is-loading"))
		}
		else
			this.showError("Please fill in the required fields")
	}

	onResponseReceived(t, response) {
		if (response.ok) { 
			// Emits a success event to the parent component
			t.shadowRoot.dispatchEvent(new CustomEvent("login", { detail: t.emailField.value }))
		}
		else
			t.onRequestFailed(t, response)
	} 

	// Called for failure responses
	onRequestFailed(t, response) {
		if (response.status == undefined || response.status == 0) {
			console.error("Request failed")
			console.error(response)
			t.showError("Failed to validate the credentials due to a network error")
		}
		else if (response.status == 401) {
			t.passwordField.value = ""
			t.showError("Incorrect email or password")
		}
		else {
			console.error(response.status)
			t.showError("Validation failed (error code " + response.status + ")")
		}
	}
}

// Registers this custom component
window.customElements.define("login-component", LoginComponent)