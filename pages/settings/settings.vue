<template>
	<view :class="['container', themeClass]">
		<view class="header">
			<text class="title">⚙️ 设置与个人档案</text>
		</view>

		<view class="card">
			<text class="section-title">个人信息</text>

			<!-- 年龄 -->
			<picker :range="ageRange" :value="ageIndex" mode="selector" @change="onAgeChange">
				<view class="form-item">
					<text class="label">年龄</text>
					<view class="value-row">
						<text class="value">{{ profile.age }} 岁</text>
						<text class="arrow">›</text>
					</view>
				</view>
			</picker>

			<!-- 性别 -->
			<view class="form-item">
				<text class="label">性别</text>
				<picker :range="genderRange" :value="genderIndex" mode="selector" @change="onGenderChange">
					<view class="value-row">
						<text class="value">{{ profile.gender }}</text>
						<text class="arrow">›</text>
					</view>
				</picker>
			</view>

			<!-- 身高 -->
			<view class="form-item">
				<text class="label">身高</text>
				<picker :range="heightRange" :value="heightIndex" mode="selector" @change="onHeightChange">
					<view class="value-row">
						<text class="value">{{ profile.height }} cm</text>
						<text class="arrow">›</text>
					</view>
				</picker>
			</view>

			<!-- 体重 -->
			<view class="form-item">
				<text class="label">体重</text>
				<picker :range="weightRange" :value="weightIndex" mode="selector" @change="onWeightChange">
					<view class="value-row">
						<text class="value">{{ profile.weight }} kg</text>
						<text class="arrow">›</text>
					</view>
				</picker>
			</view>

			<!-- 心率报警阈值 -->
			<view class="form-item">
				<text class="label">心率报警阈值</text>
				<picker :range="hrRange" :value="hrIndex" mode="selector" @change="onHrChange">
					<view class="value-row">
						<text class="value">{{ profile.hrThreshold }} bpm</text>
						<text class="arrow">›</text>
					</view>
				</picker>
			</view>

			<button class="save-btn" @click="saveProfile">保存档案</button>
		</view>

		<!-- 深色模式切换 -->
		<view class="card theme-card">
			<text class="label">深色模式</text>
			<switch :checked="appTheme === 'dark'" @change="toggleTheme" color="#764ba2" />
		</view>
	</view>
</template>

<script>
export default {
	data() {
		const ageRange = Array.from({ length: 80 }, (_, i) => `${i + 10}`);
		const heightRange = Array.from({ length: 81 }, (_, i) => `${i + 140}`);
		const weightRange = Array.from({ length: 121 }, (_, i) => `${i + 30}`);
		const hrRange = [80, 85, 90, 95, 100, 105, 110, 115, 120].map(v => `${v}`);
		const genderRange = ['男', '女'];

		return {
			ageRange,
			heightRange,
			weightRange,
			hrRange,
			genderRange,
			profile: {
				age: 25,
				gender: '男',
				height: 170,
				weight: 65,
				hrThreshold: 100
			}
		}
	},
	computed: {
		ageIndex() { return this.ageRange.indexOf(String(this.profile.age)) },
		heightIndex() { return this.heightRange.indexOf(String(this.profile.height)) },
		weightIndex() { return this.weightRange.indexOf(String(this.profile.weight)) },
		hrIndex() { return this.hrRange.indexOf(String(this.profile.hrThreshold)) },
		genderIndex() { return this.genderRange.indexOf(this.profile.gender) },
	},
	onLoad() {
		const storedProfile = this.$store.state.userProfile;
		if (storedProfile) {
			this.profile = { ...storedProfile };
		}
	},
	methods: {
		onAgeChange(e) { this.profile.age = parseInt(this.ageRange[e.detail.value]); },
		onGenderChange(e) { this.profile.gender = this.genderRange[e.detail.value]; },
		onHeightChange(e) { this.profile.height = parseInt(this.heightRange[e.detail.value]); },
		onWeightChange(e) { this.profile.weight = parseInt(this.weightRange[e.detail.value]); },
		onHrChange(e) { this.profile.hrThreshold = parseInt(this.hrRange[e.detail.value]); },
		saveProfile() {
			this.$store.commit('setUserProfile', this.profile);
			uni.showToast({ title: '档案保存成功', icon: 'success' });
		},
		toggleTheme() {
			this.$store.dispatch('toggleTheme');
		}
	}
}
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;
	min-height: 100vh;
	box-sizing: border-box;
	transition: background-color 0.3s;
}
.theme-light { background-color: #F4F5F6; color: #333; }
.theme-dark { background-color: #1a1a1a; color: #eee; }

.header { margin-bottom: 20px; width: 100%; text-align: left; }
.title { font-size: 22px; font-weight: bold; }

.card {
	width: 100%;
	background-color: #fff;
	border-radius: 12px;
	padding: 20px;
	box-shadow: 0 4px 12px rgba(0,0,0,0.05);
	margin-bottom: 20px;
	box-sizing: border-box;
}
.theme-dark .card { background-color: #2c2c2c; }

.section-title {
	display: block;
	font-size: 13px;
	color: #999;
	margin-bottom: 10px;
	text-transform: uppercase;
	letter-spacing: 1px;
}

.form-item {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #f0f0f0;
	padding: 15px 0;
}
.theme-dark .form-item { border-bottom-color: #3a3a3a; }

.label { font-size: 16px; font-weight: 500; }
.theme-dark .label { color: #eee; }

.value-row { display: flex; align-items: center; }
.value { font-size: 16px; color: #764ba2; }
.theme-dark .value { color: #9d50ff; }
.arrow { font-size: 20px; color: #ccc; margin-left: 8px; }

.save-btn {
	margin-top: 25px;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border-radius: 25px;
	font-size: 16px;
	border: none;
}
.save-btn::after { border: none; }

.theme-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
