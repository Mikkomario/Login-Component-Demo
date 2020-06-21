<template>
	<div>
		<form class="block">
			<div class="field">
				<label class="label">Email</label>
				<input class="input" type="text" v-model="emailField.value" :class="{ 'is-danger': emailField.isMissing }">
			</div>
			<div class="field">
				<label class="label">Password</label>
				<input class="input" type="password" v-model="passwordField.value" :class="{ 'is-danger': passwordField.isMissing }">
			</div>
			<button class="button is-primary" @click.prevent="onSubmitPressed()" :class="{ 'is-loading': isLoading }">Login</button>
		</form>
		<transition name="slide">
			<div class="block" v-if="isErrorActive">
				<div class="notification is-danger">{{ errorMessage }}</div>
			</div>
		</transition>
	</div>
</template>

<script type="text/javascript">
	import { Field } from "../classes/Field"

	export default { 
		props: {
			// Target server address used in the post request
			serverUri: 
			{
				type: String, 
				required: true
			}
		}, 
		data() {
			return {
				emailField: new Field("", true), 
				passwordField: new Field("", true), 
				// Currently displayed error message. Empty when there is no error
				errorMessage: "", 
				// True when processing asynchronous request
				isLoading: false
			}
		}, 
		computed: { 
			// All input fields
			fields() {
				return [this.emailField, this.passwordField]
			}, 
			// Whether to show error at the moment
			isErrorActive() {
				return this.errorMessage != ""
			}
		}, 
		methods: { 
			// Clears error message
			clearError() {
				this.errorMessage = ""
			}, 

			// Sends an authorization request to the server and handles the result
			onSubmitPressed() {  
				if (this.fields.every(f => f.test())) { 
					this.clearError()
					// Sets the loading flag to true during the request
					this.isLoading = true
					const postBody = { email: this.emailField.value, password: this.passwordField.value }
					const config = { timeout: 10000 }
					this.$http.post(this.serverUri, postBody, config).then(this.onResponseReceived).catch(this.onRequestFailed).then(a => this.isLoading = false)
				}
				else
					this.errorMessage = "Please fill in the required fields"
			}, 

			// Called when (successful) response is received
			onResponseReceived(response) {
				if (response.ok) { 
					// Emits a success event to the parent component
					this.$emit("login", this.emailField.value)
					// TODO (Optional): Display successful login status here
				}
				else
					this.onRequestFailed(response)
			}, 

			// Called for failure responses
			onRequestFailed(response) {
				if (response.status == undefined || response.status == 0) {
					console.error("Request failed")
					console.error(response)
					this.errorMessage = "Failed to validate the credentials due to a network error"
				}
				else if (response.status == 401) {
					this.passwordField.clear()
					this.errorMessage = "Incorrect email or password"
				}
				else {
					console.error(response.status)
					this.errorMessage = "Validation failed (error code " + response.status + ")"
				}
			}
		}
	}
</script>

<style scoped type="text/css">
	.slide-enter {
		opacity: 0;
	}

	.slide-enter-active {
		animation: slide-in 0.25s ease-out forwards;
		transition: opacity 0.25s ease-out;
	}

	.slide-leave {

	}

	.slide-leave-active {
		animation: slide-out 0.25s ease-out forwards;
		transition: opacity 0.25s ease-out;
		opacity: 0;
		position: absolute;
	}

	@keyframes slide-in {
		from {
			transform: translateY(5px);
		}
		to {
			transform: translateX(0px);
		}
	}

	@keyframes slide-out {
		from {
			transform: translateX(0px);
		}
		to {
			transform: translateY(5px);
		}
	}
</style>