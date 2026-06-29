export default {
	computed: {
		appTheme() {
			return this.$store.state.theme;
		},
		themeClass() {
			return `theme-${this.appTheme}`;
		}
	}
}
