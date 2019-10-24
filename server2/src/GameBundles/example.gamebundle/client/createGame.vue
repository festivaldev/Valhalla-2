<template>
	<fragment>
		<div class="col col-12 col-md-6" style="flex: 1">
			<MetroToggleSwitch
				header="Beispiel-Eigenschaft"
				v-model="gameOptions.exampleProperty"
			/>
			<p>{{gameOptions}}</p>
		</div>
		<div class="col col-12 col-md-6" style="flex-basis: 100%;">
			<MetroTextBlock class="mb-3" text-style="sub-title">SubTitle</MetroTextBlock>
			<MetroCheckBox v-for="(_, index) in ['1234567890','0987654321']" :name="_" :key="index" :content="`Item ${index}`" @input="mapItemChanged($event)" />
		</div>
	</fragment>
</template>

<script>
module.exports = {
	name: "ExampleCreateGame",
	data: () => ({
		test: new Map()
	}),
	methods: {
		mapItemChanged(e) {
			console.log(e.target.name);
			this.test.set(e.target.name, e.target.checked)
			console.log([...this.test.entries()].filter(([k, v]) => Boolean(v)).map(([k, v]) => k));
		}
	},
	computed: {
		gameOptions() {
			return this.$parent.gameOptions;
		},
	}
}
</script>