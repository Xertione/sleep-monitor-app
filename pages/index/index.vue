<template>
	<view :class="['container', themeClass]">

		<!-- 顶部标题 + 连接状态 -->
		<view class="top-section">
			<view>
				<text class="greeting">{{ greeting }}</text>
				<text class="subtitle">您的睡眠健康助理</text>
			</view>
			<view :class="['status-dot', isConnected ? 'online' : 'offline']"></view>
		</view>

		<!-- 四项实时核心数据卡片 -->
		<view class="metrics-grid">
			<view class="metric-card">
				<view class="metric-icon-wrap hr-bg">
					<text class="metric-icon">❤️</text>
				</view>
				<text class="metric-label">心率</text>
				<view class="metric-val-row">
					<text class="metric-val hr-color">{{ metrics.hr }}</text>
					<text class="metric-unit">bpm</text>
				</view>
			</view>
			<view class="metric-card">
				<view class="metric-icon-wrap temp-bg">
					<text class="metric-icon">🌡️</text>
				</view>
				<text class="metric-label">体温</text>
				<view class="metric-val-row">
					<text class="metric-val temp-color">{{ metrics.temp }}</text>
					<text class="metric-unit">℃</text>
				</view>
			</view>
			<view class="metric-card">
				<view class="metric-icon-wrap resp-bg">
					<text class="metric-icon">🌬️</text>
				</view>
				<text class="metric-label">呼吸</text>
				<view class="metric-val-row">
					<text class="metric-val resp-color">{{ metrics.resp }}</text>
					<text class="metric-unit">次/分</text>
				</view>
			</view>
			<view class="metric-card">
				<view class="metric-icon-wrap move-bg">
					<text class="metric-icon">🏃</text>
				</view>
				<text class="metric-label">体动</text>
				<view class="metric-val-row">
					<text class="metric-val move-color">{{ metrics.movement }}</text>
					<text class="metric-unit">级</text>
				</view>
			</view>
		</view>

		<!-- 今晚睡眠时长 + 设备在线 Banner -->
		<view class="sleep-banner">
			<view class="banner-col">
				<text class="banner-icon">🌙</text>
				<text class="banner-label">今晚累计睡眠</text>
				<text class="banner-val">{{ metrics.sleepTime }} <text class="banner-unit">分钟</text></text>
			</view>
			<view class="banner-divider"></view>
			<view class="banner-col">
				<text class="banner-icon">🔌</text>
				<text class="banner-label">设备运行时长</text>
				<text class="banner-val">{{ metrics.runTime }} <text class="banner-unit">分钟</text></text>
			</view>
		</view>

		<!-- 快捷入口 -->
		<view class="shortcut-row">
			<view class="shortcut-card" @click="goToData">
				<text class="shortcut-icon">📊</text>
				<text class="shortcut-text">详细数据图表</text>
				<text class="shortcut-arrow">›</text>
			</view>
			<view class="shortcut-card" @click="goToReport">
				<text class="shortcut-icon">📄</text>
				<text class="shortcut-text">睡眠诊断报告</text>
				<text class="shortcut-arrow">›</text>
			</view>
		</view>

		<!-- AI 健康分析 -->
		<view class="ai-card">
			<view class="ai-header">
				<text class="ai-title">🤖 智谱 AI 睡眠分析</text>
			</view>
			<button class="ai-btn" @click="getAiDiagnosis" :disabled="isAnalyzing">
				{{ isAnalyzing ? 'AI 深度思考中...' : '生成专属睡眠建议' }}
			</button>
			<view class="ai-content" v-if="aiAdvice">
				<text class="ai-text" user-select>{{ aiAdvice }}</text>
			</view>
		</view>

	</view>
</template>

<script>
import config from '@/utils/config.js';

export default {
	data() {
		return {
			isConnected: false,
			metrics: { hr: '--', temp: '--', resp: '--', movement: '--', sleepTime: '--', runTime: '--' },
			timer: null,
			aiAdvice: '',
			isAnalyzing: false
		}
	},
	computed: {
		greeting() {
			const h = new Date().getHours();
			if (h < 6)  return '🌙 深夜好';
			if (h < 12) return '☀️ 早上好';
			if (h < 18) return '🌤 下午好';
			return '🌆 晚上好';
		}
	},
	onLoad() {
		this.fetchLatest();
	},
	onShow() {
		if (this.timer) clearInterval(this.timer);
		// 每 10 秒刷新实时数值（首页只拉最新一条，很快）
		this.timer = setInterval(() => this.fetchLatest(), 10000);
	},
	onHide() {
		if (this.timer) clearInterval(this.timer);
	},
	onUnload() {
		if (this.timer) clearInterval(this.timer);
	},
	methods: {
		fetchLatest() {
			uni.request({
				url: `${config.BASE_URL}/api/health/latest`,
				method: 'GET',
				success: (res) => {
					if (res.data && res.data.code === 200) {
						this.isConnected = true;
						const d = res.data.data;
						this.metrics = {
							hr:        d.heart_rate        ?? '--',
							temp:      d.temperature       ?? '--',
							resp:      d.respiratory_rate  ?? '--',
							movement:  d.body_movement      ?? '--',
							sleepTime: d.sleep_duration    ?? '--',
							runTime:   d.system_run_time   ?? '--'
						};
					}
				},
				fail: () => {
					this.isConnected = false;
				}
			});
		},
		goToData() {
			uni.switchTab({ url: '/pages/data/data' });
		},
		goToReport() {
			uni.switchTab({ url: '/pages/report/report' });
		},
		getAiDiagnosis() {
			this.isAnalyzing = true;
			this.aiAdvice = '';
			uni.request({
				url: `${config.BASE_URL}/api/health/analyze`,
				method: 'GET',
				success: (res) => {
					if (res.data && res.data.code === 200) {
						this.aiAdvice = res.data.advice || res.data.data;
						// 保存历史
						const raw = uni.getStorageSync('ai_analysis') || [];
						raw.push({ time: new Date().toLocaleString(), advice: this.aiAdvice });
						uni.setStorageSync('ai_analysis', raw);
					} else {
						this.aiAdvice = '数据不足，请稍后再试。';
					}
				},
				fail: () => {
					this.aiAdvice = '网络请求失败，请检查后端服务器是否运行。';
				},
				complete: () => {
					this.isAnalyzing = false;
				}
			});
		}
	}
}
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	padding: 18px 15px;
	min-height: 100vh;
	box-sizing: border-box;
}
.theme-light { background-color: #F0F2F5; color: #333; }
.theme-dark  { background-color: #141414; color: #eee; }

/* 顶部区 */
.top-section {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20px;
}
.greeting  { display: block; font-size: 22px; font-weight: bold; margin-bottom: 4px; }
.subtitle  { font-size: 13px; color: #aaa; }
.theme-dark .subtitle { color: #666; }

.status-dot {
	width: 10px; height: 10px;
	border-radius: 50%;
	margin-top: 8px;
	flex-shrink: 0;
}
.online  { background-color: #52c41a; box-shadow: 0 0 6px rgba(82,196,26,0.6); }
.offline { background-color: #ccc; }

/* 4卡网格 */
.metrics-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 14px;
}
.metric-card {
	width: 48%;
	background-color: #fff;
	border-radius: 14px;
	padding: 14px;
	margin-bottom: 12px;
	box-sizing: border-box;
	box-shadow: 0 2px 10px rgba(0,0,0,0.06);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.theme-dark .metric-card { background-color: #1e1e1e; }

.metric-icon-wrap {
	width: 36px; height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 10px;
}
.hr-bg   { background-color: #fff1f0; }
.temp-bg { background-color: #fff7e6; }
.resp-bg { background-color: #e6fffb; }
.move-bg { background-color: #f9f0ff; }

.metric-icon { font-size: 20px; }
.metric-label { font-size: 12px; color: #aaa; margin-bottom: 4px; }
.metric-val-row { display: flex; align-items: baseline; }
.metric-val { font-size: 28px; font-weight: bold; }
.metric-unit { font-size: 12px; color: #aaa; margin-left: 3px; }

.hr-color   { color: #FF6B6B; }
.temp-color { color: #FFA940; }
.resp-color { color: #36CFC9; }
.move-color { color: #9254DE; }

/* 睡眠 Banner */
.sleep-banner {
	background: linear-gradient(135deg, #2c2c54 0%, #764ba2 100%);
	border-radius: 16px;
	padding: 18px 20px;
	display: flex;
	align-items: center;
	justify-content: space-around;
	margin-bottom: 14px;
}
.banner-col {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.banner-icon  { font-size: 22px; margin-bottom: 5px; }
.banner-label { font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 4px; }
.banner-val   { font-size: 22px; font-weight: bold; color: #fff; }
.banner-unit  { font-size: 12px; font-weight: normal; color: rgba(255,255,255,0.7); }
.banner-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

/* 快捷入口 */
.shortcut-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 14px;
}
.shortcut-card {
	width: 48%;
	background-color: #fff;
	border-radius: 12px;
	padding: 14px;
	display: flex;
	align-items: center;
	box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	box-sizing: border-box;
}
.theme-dark .shortcut-card { background-color: #1e1e1e; }
.shortcut-icon { font-size: 20px; margin-right: 8px; }
.shortcut-text { font-size: 13px; flex: 1; font-weight: 500; }
.shortcut-arrow { font-size: 20px; color: #ccc; }

/* AI 卡片 */
.ai-card {
	background-color: #fff;
	border-radius: 16px;
	padding: 20px;
	box-shadow: 0 3px 14px rgba(0,0,0,0.06);
	box-sizing: border-box;
}
.theme-dark .ai-card { background-color: #1e1e1e; }
.ai-header { margin-bottom: 14px; text-align: center; }
.ai-title  { font-size: 17px; font-weight: bold; color: #4b0082; }
.theme-dark .ai-title { color: #9d50ff; }

.ai-btn {
	background: linear-gradient(90deg, #667eea, #764ba2);
	color: #fff;
	border-radius: 25px;
	font-size: 15px;
	font-weight: bold;
	border: none;
}
.ai-btn::after { border: none; }
.ai-btn[disabled] { background: #ddd; color: #aaa; }
.theme-dark .ai-btn[disabled] { background: #444; color: #888; }

.ai-content {
	margin-top: 18px;
	padding: 14px;
	background-color: #f8f9fa;
	border-radius: 10px;
	border-left: 4px solid #764ba2;
}
.theme-dark .ai-content { background-color: #2a2a2a; border-left-color: #9d50ff; }
.ai-text { font-size: 14px; line-height: 1.8; color: #444; }
.theme-dark .ai-text { color: #ddd; }
</style>