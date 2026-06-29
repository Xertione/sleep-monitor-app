import { createStore } from 'vuex'

const store = createStore({
	state: {
		theme: uni.getStorageSync('app_theme') || 'light',
		userProfile: uni.getStorageSync('userProfile') || {
			age: 25,
			gender: '男',
			height: 170,
			weight: 65,
			hrThreshold: 100
		}
	},
	mutations: {
		setTheme(state, newTheme) {
			state.theme = newTheme;
			uni.setStorageSync('app_theme', newTheme);
		},
		setUserProfile(state, profile) {
			state.userProfile = { ...profile };
			uni.setStorageSync('userProfile', { ...profile });
		}
	},
	actions: {
		toggleTheme({ commit, state }) {
			const newTheme = state.theme === 'light' ? 'dark' : 'light';
			commit('setTheme', newTheme);
		}
	}
})

export default store
