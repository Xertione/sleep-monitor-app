<template>
	<view :class="['container', themeClass]">

		<!-- 顶部 KPI 卡片区 -->
		<view class="kpi-row">
			<view class="kpi-card sleep-card">
				<text class="kpi-icon">🌙</text>
				<view class="kpi-info">
					<text class="kpi-label">今晚睡眠时长</text>
					<view class="kpi-value-row">
						<text class="kpi-value">{{ latestSleepTime }}</text>
						<text class="kpi-unit">分钟</text>
					</view>
				</view>
			</view>
			<view class="kpi-card run-card">
				<text class="kpi-icon">⏱</text>
				<view class="kpi-info">
					<text class="kpi-label">设备运行时间</text>
					<view class="kpi-value-row">
						<text class="kpi-value">{{ latestRunTime }}</text>
						<text class="kpi-unit">分钟</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 实时最新值瞬时概览 -->
		<view class="mini-board">
			<view class="mini-item">
				<text class="mini-label">心率</text>
				<text class="mini-value hr-color">{{ latest.hr }}<text class="mini-unit"> bpm</text></text>
			</view>
			<view class="mini-divider"></view>
			<view class="mini-item">
				<text class="mini-label">体温</text>
				<text class="mini-value temp-color">{{ latest.temp }}<text class="mini-unit"> ℃</text></text>
			</view>
			<view class="mini-divider"></view>
			<view class="mini-item">
				<text class="mini-label">呼吸</text>
				<text class="mini-value resp-color">{{ latest.resp }}<text class="mini-unit"> bpm</text></text>
			</view>
			<view class="mini-divider"></view>
			<view class="mini-item">
				<text class="mini-label">体动</text>
				<text class="mini-value move-color">{{ latest.movement }}<text class="mini-unit"> 级</text></text>
			</view>
		</view>

		<!-- 心率曲线 -->
		<view class="chart-card">
			<view class="chart-header">
				<view class="chart-dot hr-dot"></view>
				<text class="chart-title">心率 Heart Rate</text>
				<text class="chart-subtitle">目标: 60-100 bpm</text>
			</view>
			<view class="chart-area">
				<qiun-data-charts v-if="hrChart.categories.length > 0" type="area" :opts="hrOpts" :chartData="hrChart"/>
				<view v-else class="empty-chart"><text class="empty-text">等待后台数据...</text></view>
			</view>
		</view>

		<!-- 体温曲线 -->
		<view class="chart-card">
			<view class="chart-header">
				<view class="chart-dot temp-dot"></view>
				<text class="chart-title">体温 Temperature</text>
				<text class="chart-subtitle">正常: 36.1-37.2 ℃</text>
			</view>
			<view class="chart-area">
				<qiun-data-charts v-if="tempChart.categories.length > 0" type="area" :opts="tempOpts" :chartData="tempChart"/>
				<view v-else class="empty-chart"><text class="empty-text">等待后台数据...</text></view>
			</view>
		</view>

		<!-- 呼吸频率曲线 -->
		<view class="chart-card">
			<view class="chart-header">
				<view class="chart-dot resp-dot"></view>
				<text class="chart-title">呼吸频率 Breath Rate</text>
				<text class="chart-subtitle">正常: 12-20 次/分</text>
			</view>
			<view class="chart-area">
				<qiun-data-charts v-if="respChart.categories.length > 0" type="area" :opts="respOpts" :chartData="respChart"/>
				<view v-else class="empty-chart"><text class="empty-text">等待后台数据...</text></view>
			</view>
		</view>

		<!-- 体动强度柱状图 -->
		<view class="chart-card">
			<view class="chart-header">
				<view class="chart-dot move-dot"></view>
				<text class="chart-title">体动强度 Body Movement</text>
				<text class="chart-subtitle">值越高代表体动越剧烈</text>
			</view>
			<view class="chart-area">
				<qiun-data-charts v-if="moveChart.categories.length > 0" type="column" :opts="moveOpts" :chartData="moveChart"/>
				<view v-else class="empty-chart"><text class="empty-text">等待后台数据...</text></view>
			</view>
		</view>

		<!-- 连接状态 -->
		<view class="status-bar">
			<text class="status-text">{{ connectStatus }}</text>
		</view>

	</view>
</template>

<script>
import config from '@/utils/config.js';

const HR_COLOR = '#FF6B6B';
const TEMP_COLOR = '#FFA940';
const RESP_COLOR = '#36CFC9';
const MOVE_COLOR = '#9254DE';

function buildAreaOpts(color, yMin, yMax) {
	return {
		color: [color],
		padding: [15, 15, 30, 15],
		enableScroll: true,
		legend: { show: false },
		xAxis: { disableGrid: true, itemCount: 6, fontSize: 11 },
		yAxis: { gridType: 'dash', dashLength: 2, min: yMin, max: yMax },
		extra: {
			area: { type: 'curve', opacity: 0.15, addLine: true, width: 2, gradient: true },
			tooltip: { showBox: true }
		}
	};
}

function buildColumnOpts(color) {
	return {
		color: [color],
		padding: [15, 15, 30, 15],
		enableScroll: true,
		legend: { show: false },
		xAxis: { disableGrid: true, itemCount: 6, fontSize: 11 },
		yAxis: { gridType: 'dash', dashLength: 2, min: 0 },
		extra: {
			column: { width: 10, barBorderRadius: [4, 4, 0, 0] },
			tooltip: { showBox: true }
		}
	};
}

export default {
	data() {
		return {
			connectStatus: '正在连接...',
			latestSleepTime: '--',
			latestRunTime: '--',
			latest: { hr: '--', temp: '--', resp: '--', movement: '--' },

			hrChart:   { categories: [], series: [] },
			tempChart: { categories: [], series: [] },
			respChart: { categories: [], series: [] },
			moveChart: { categories: [], series: [] },

			hrOpts:   buildAreaOpts(HR_COLOR,   40, 160),
			tempOpts: buildAreaOpts(TEMP_COLOR,  35, 40),
			respOpts: buildAreaOpts(RESP_COLOR,  8,  30),
			moveOpts: buildColumnOpts(MOVE_COLOR),

			timer: null
		}
	},
	onLoad() {
		this.fetchData();
	},
	onShow() {
		if (this.timer) clearInterval(this.timer);
		this.timer = setInterval(() => this.fetchData(), 30000);
	},
	onHide() {
		if (this.timer) clearInterval(this.timer);
	},
	onUnload() {
		if (this.timer) clearInterval(this.timer);
	},
	methods: {
		fetchData() {
			uni.request({
				url: `${config.BASE_URL}/api/health/data`,
				method: 'GET',
				success: (res) => {
					if (res.data && res.data.code === 200) {
						this.connectStatus = '✅ 数据同步正常';
						this.processData(res.data.data);
					}
				},
				fail: () => {
					this.connectStatus = '❌ 无法连接到后端服务器';
				}
			});
		},

		processData(dataList) {
			if (!dataList || dataList.length === 0) return;

			// 取最新一条数据更新 KPI 和实时值
			const latest = dataList[dataList.length - 1];
			this.latest.hr       = latest.heart_rate       ?? '--';
			this.latest.temp     = latest.temperature      ?? '--';
			this.latest.resp     = latest.respiratory_rate ?? '--';
			this.latest.movement = latest.body_movement    ?? '--';
			this.latestSleepTime = latest.sleep_duration   ?? '--';
			this.latestRunTime   = latest.system_run_time  ?? '--';

			// 构建各图表数据
			const cats = dataList.map(d => d.time);

			this.hrChart   = this.buildChart(cats, dataList.map(d => d.heart_rate),       '心率');
			this.tempChart = this.buildChart(cats, dataList.map(d => d.temperature),      '体温');
			this.respChart = this.buildChart(cats, dataList.map(d => d.respiratory_rate), '呼吸');
			this.moveChart = this.buildChart(cats, dataList.map(d => d.body_movement),    '体动');
		},

		buildChart(categories, values, name) {
			return JSON.parse(JSON.stringify({
				categories,
				series: [{ name, data: values }]
			}));
		}
	}
}
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	padding: 15px;
	min-height: 100vh;
	box-sizing: border-box;
}
.theme-light { background-color: #F0F2F5; color: #333; }
.theme-dark  { background-color: #141414; color: #eee; }

/* KPI 行 */
.kpi-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 14px;
}
.kpi-card {
	width: 48%;
	border-radius: 14px;
	padding: 14px 16px;
	display: flex;
	flex-direction: row;
	align-items: center;
	box-sizing: border-box;
}
.sleep-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.run-card   { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

.kpi-icon { font-size: 28px; margin-right: 12px; }
.kpi-info { display: flex; flex-direction: column; }
.kpi-label { font-size: 12px; color: rgba(255,255,255,0.8); margin-bottom: 4px; }
.kpi-value-row { display: flex; align-items: baseline; }
.kpi-value { font-size: 26px; font-weight: bold; color: #fff; }
.kpi-unit  { font-size: 12px; color: rgba(255,255,255,0.8); margin-left: 4px; }

/* 实时数据小看板 */
.mini-board {
	display: flex;
	background-color: #fff;
	border-radius: 14px;
	padding: 14px 8px;
	margin-bottom: 14px;
	box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.theme-dark .mini-board { background-color: #1e1e1e; }

.mini-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.mini-divider {
	width: 1px;
	background-color: #f0f0f0;
	margin: 0 4px;
}
.theme-dark .mini-divider { background-color: #333; }

.mini-label { font-size: 11px; color: #aaa; margin-bottom: 6px; }
.mini-value { font-size: 22px; font-weight: bold; }
.mini-unit  { font-size: 11px; font-weight: normal; color: #aaa; }

.hr-color   { color: #FF6B6B; }
.temp-color { color: #FFA940; }
.resp-color { color: #36CFC9; }
.move-color { color: #9254DE; }

/* 图表卡片 */
.chart-card {
	background-color: #fff;
	border-radius: 14px;
	padding: 15px;
	margin-bottom: 14px;
	box-shadow: 0 2px 12px rgba(0,0,0,0.06);
	box-sizing: border-box;
}
.theme-dark .chart-card { background-color: #1e1e1e; }

.chart-header {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
}
.chart-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	margin-right: 8px;
	flex-shrink: 0;
}
.hr-dot   { background-color: #FF6B6B; }
.temp-dot { background-color: #FFA940; }
.resp-dot { background-color: #36CFC9; }
.move-dot { background-color: #9254DE; }

.chart-title    { font-size: 15px; font-weight: bold; flex: 1; }
.chart-subtitle { font-size: 11px; color: #aaa; }
.theme-dark .chart-subtitle { color: #666; }

.chart-area { height: 200px; }

/* 空状态 */
.empty-chart {
	height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.empty-text { font-size: 14px; color: #aaa; }

/* 状态栏 */
.status-bar { padding: 8px 0 20px; display: flex; justify-content: center; }
.status-text { font-size: 12px; color: #aaa; }
</style>
