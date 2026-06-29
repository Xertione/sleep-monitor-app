<script>
	import { db } from './utils/db.js'
	import config from './utils/config.js'

	export default {
		globalData: {
			highHrCounter: 0,
			sleepState: 'awake', // awake | sleep
			sleepStartTime: null
		},
		onLaunch: function() {
			console.log('App Launch')
			// 初始化本地数据库
			db.init();
			
			// 开启后台监听（模拟定时拉取硬件数据 / 或者替换成 Websocket/MQTT 监听）
			this.timer = setInterval(() => {
				this.fetchDataFromHardware();
			}, 5000);
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			fetchDataFromHardware() {
				// 获取本地设置的阈值
				const userProfile = uni.getStorageSync('userProfile') || {};
				const hrThreshold = userProfile.hrThreshold || 100;
				
				uni.request({
					url: `${config.BASE_URL}/api/health/latest`, // 统一使用 /latest 接口
					method: 'GET',
					success: (res) => {
						if (res.data && res.data.code === 200) {
							const currentData = res.data.data;
							
							// 存入本地数据库
							db.insertSensorData(currentData);
							
							// 【报警判定引擎】
							this.checkAlertEngine(currentData.heart_rate, hrThreshold);
							
							// 【临时功能：自动检测状态机 (简单示例)】
							this.checkAutoSleepDetect(currentData.heart_rate);
							
							// 通知各个需要渲染的页面更新（通过全局事件总线）
							uni.$emit('onSensorDataUpdate', currentData);
						}
					},
					fail: (err) => {
						// 后端未连接时静默失败，不打印日志
					}
				});
			},
			
			// 报警判定引擎
			checkAlertEngine(heartRate, hrThreshold) {
				if (heartRate > hrThreshold) {
					// 持续高心率，计数器累加
					this.$options.globalData.highHrCounter += 5; // 每次间隔5秒
					
					// 如果持续超过 15 秒高心率
					if (this.$options.globalData.highHrCounter >= 15) {
						uni.vibrateLong();
						uni.showModal({
							title: '🚨 健康预警！',
							content: `检测到您的心率持续超过 ${hrThreshold} bpm，当前心率 ${heartRate} bpm，请注意身体状况！`,
							showCancel: false,
							confirmColor: '#ff0000'
						});
						// 触发后清零或进入冷却期，避免一直弹
						this.$options.globalData.highHrCounter = -30; // 给 30 秒冷却时间防止连续夺命狂呼
					}
				} else {
					// 恢复正常但如果还在冷却期就慢慢恢复到0，如果大于0则直接清零
					if(this.$options.globalData.highHrCounter > 0) {
						this.$options.globalData.highHrCounter = 0;
					} else if (this.$options.globalData.highHrCounter < 0) {
						this.$options.globalData.highHrCounter += 5;
					}
				}
			},
			
			// 自动睡眠检测状态机 (简化版)
			checkAutoSleepDetect(heartRate) {
				let state = this.$options.globalData.sleepState;
				// 这里只是做个例子，假设心率小于80即判断为入睡
				if (state === 'awake') {
					if (heartRate < 80) {
						// 真实场景需要记录一个 10 分钟连续的 flag，这里缩短流程
						this.$options.globalData.sleepState = 'sleep';
						this.$options.globalData.sleepStartTime = Date.now();
						console.log("【状态机】检测到心率降低，已进入睡眠状态");
					}
				} else if (state === 'sleep') {
					if (heartRate > 85) {
						// 醒来
						let endTime = Date.now();
						let duration = endTime - this.$options.globalData.sleepStartTime;
						this.$options.globalData.sleepState = 'awake';
						
						// 存入入库记录
						if (duration > 60000) { // 大于1分钟才算有效的睡眠记录
							db.insertSleepRecord({
								startTime: this.$options.globalData.sleepStartTime,
								endTime: endTime,
								durationLabel: this.formatDuration(duration)
							});
							console.log("【状态机】已醒来！睡眠记录已存储：", this.formatDuration(duration));
						}
					}
				}
			},
			
			formatDuration(ms) {
				let minutes = Math.floor(ms / 60000);
				let hours = Math.floor(minutes / 60);
				minutes = minutes % 60;
				return `${hours}小时${minutes}分钟`;
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
