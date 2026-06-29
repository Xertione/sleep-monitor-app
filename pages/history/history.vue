<template>
	<view :class="['container', themeClass]">
		<view class="header">
			<text class="title">📅 AI 诊断历史</text>
		</view>
		<view class="content">
			<block v-if="historyList.length > 0">
				<view class="history-card" v-for="(item, index) in historyList" :key="index">
					<view class="card-header">
						<text class="time-badge">{{ item.time }}</text>
						<text class="index-badge">#{{ historyList.length - index }}</text>
					</view>
					<text class="advice-text">{{ item.advice }}</text>
				</view>
			</block>
			<view class="empty-state" v-else>
				<text class="empty-icon">🤖</text>
				<text class="empty-text">暂无 AI 诊断记录</text>
				<text class="empty-hint">前往首页，点击「生成专属睡眠建议」开始分析吧！</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			historyList: []
		}
	},
	onShow() {
		this.fetchHistory();
	},
	methods: {
		fetchHistory() {
			try {
				const raw = uni.getStorageSync('ai_analysis') || [];
				this.historyList = Array.isArray(raw) ? raw.reverse() : [];
			} catch(e) {
				this.historyList = [];
			}
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
}
.theme-light { background-color: #F4F5F6; color: #333; }
.theme-dark  { background-color: #1a1a1a; color: #eee; }

.header { margin-bottom: 20px; width: 100%; text-align: left; }
.title  { font-size: 22px; font-weight: bold; }

.content { width: 100%; display: flex; flex-direction: column; }

.history-card {
	width: 100%;
	background-color: #fff;
	border-radius: 12px;
	padding: 18px;
	box-shadow: 0 3px 10px rgba(0,0,0,0.06);
	margin-bottom: 14px;
	box-sizing: border-box;
	border-left: 4px solid #764ba2;
}
.theme-dark .history-card { background-color: #2c2c2c; border-left-color: #9d50ff; }

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.time-badge {
	font-size: 12px;
	color: #764ba2;
	font-weight: bold;
	background-color: #f0eaff;
	padding: 3px 8px;
	border-radius: 10px;
}
.theme-dark .time-badge { color: #9d50ff; background-color: #3a3050; }

.index-badge { font-size: 12px; color: #999; }

.advice-text { font-size: 15px; line-height: 1.8; color: #444; }
.theme-dark .advice-text { color: #ddd; }

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 80px;
}
.empty-icon { font-size: 48px; margin-bottom: 15px; }
.empty-text { font-size: 18px; font-weight: bold; color: #999; margin-bottom: 10px; }
.empty-hint { font-size: 14px; color: #bbb; text-align: center; }
.theme-dark .empty-hint { color: #666; }
</style>
