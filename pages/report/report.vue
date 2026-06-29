<template>
	<view :class="['container', themeClass]">
		<view class="header">
			<text class="title">📊 睡眠诊断报告</text>
		</view>
		<view class="content">
			<!-- 睡眠评分卡 -->
			<view class="score-card">
				<text class="score-label">昨晚睡眠评分</text>
				<view class="score-circle">
					<text class="score-num">{{ sleepScore }}</text>
					<text class="score-unit">分</text>
				</view>
				<text class="score-desc">{{ scoreDesc }}</text>
			</view>

			<!-- 最新 AI 建议 -->
			<view class="summary-box">
				<text class="summary-title">🤖 AI 综合评价</text>
				<text class="summary-text">{{ latestAdvice || '请先在首页进行一次 AI 诊断' }}</text>
			</view>

			<!-- 分享按钮 -->
			<button class="share-btn" @click="shareReport">📤 分享报告给好友</button>
		</view>
	</view>
</template>

<script>
import config from '@/utils/config.js';

export default {
	data() {
		return {
			latestAdvice: '',
			sleepScore: '--',
			scoreDesc: '数据加载中...'
		}
	},
	onShow() {
		this.fetchData();
	},
	methods: {
		fetchData() {
			// 1. 获取最新 AI 建议
			try {
				const raw = uni.getStorageSync('ai_analysis') || [];
				if (raw.length > 0) {
					this.latestAdvice = raw[raw.length - 1].advice;
				}
			} catch(e) {}

			// 2. 从后端拉取实际睡眠数据（图表+评分计算）
			uni.request({
				url: `${config.BASE_URL}/api/health/data`,
				method: 'GET',
				success: (res) => {
					if (res.data && res.data.code === 200 && res.data.data.length > 0) {
						this.calculateSleepReport(res.data.data);
					} else {
						this.useMockFallback('暂无足够数据');
					}
				},
				fail: () => {
					this.useMockFallback('未连接到后端');
				}
			});
		},
		calculateSleepReport(dataList) {
			let scoreMetrics = { deepCount: 0, awakeCount: 0 };
			let totalHr = 0;

			dataList.forEach(item => {
				let hr = item.heart_rate || 70;
				let move = item.body_movement || 0;
				totalHr += hr;

				if (hr > 85 || move > 4) {
					scoreMetrics.awakeCount++;
				} else if (hr < 65 && move <= 1) {
					scoreMetrics.deepCount++;
				}
			});

			// 计算睡眠评分 (满分100)
			let baseScore = 85; 
			// 扣分项：清醒次数过多
			baseScore -= (scoreMetrics.awakeCount * 2); 
			// 加分项：深睡时长充足
			baseScore += (scoreMetrics.deepCount * 1.5);
			// 边界收敛
			baseScore = Math.max(0, Math.min(100, Math.round(baseScore)));
			
			this.sleepScore = baseScore;
			if (baseScore >= 85) this.scoreDesc = '优秀！睡眠质量非常棒 🌟';
			else if (baseScore >= 70) this.scoreDesc = '良好，可以进一步优化 👍';
			else this.scoreDesc = '需要关注，建议调整作息 ⚠️';
		},
		useMockFallback(reason) {
			this.sleepScore = '--';
			this.scoreDesc = reason + '，暂无评分';
		},
		shareReport() {
			uni.showLoading({ title: '正在生成...' });
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({ title: '分享功能需在真机调试', icon: 'none' });
			}, 1000);
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
.content { width: 100%; display: flex; flex-direction: column; align-items: center; }

/* 评分卡 */
.score-card {
	width: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16px;
	padding: 25px 20px;
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	box-sizing: border-box;
}
.score-label { font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 12px; }
.score-circle {
	display: flex;
	align-items: baseline;
	margin-bottom: 10px;
}
.score-num { font-size: 56px; font-weight: bold; color: #fff; line-height: 1; }
.score-unit { font-size: 20px; color: rgba(255,255,255,0.8); margin-left: 5px; }
.score-desc { font-size: 14px; color: rgba(255,255,255,0.9); }

/* 综合评价 */
.summary-box {
	width: 100%;
	background-color: #fff;
	border-radius: 12px;
	padding: 20px;
	box-shadow: 0 3px 10px rgba(0,0,0,0.05);
	margin-bottom: 25px;
	box-sizing: border-box;
}
.theme-dark .summary-box { background-color: #2c2c2c; }
.summary-title { font-size: 16px; font-weight: bold; color: #764ba2; margin-bottom: 12px; display: block; }
.theme-dark .summary-title { color: #9d50ff; }
.summary-text { font-size: 15px; line-height: 1.8; color: #444; }
.theme-dark .summary-text { color: #ddd; }

/* 分享按钮 */
.share-btn {
	width: 80%;
	background: #09C05F;
	color: #fff;
	border-radius: 25px;
	font-size: 16px;
	font-weight: bold;
	border: none;
	padding: 5px 0;
	box-shadow: 0 4px 12px rgba(9, 192, 95, 0.35);
}
.share-btn::after { border: none; }
</style>
