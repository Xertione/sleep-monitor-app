// 模拟的 SQLite 功能，如果跑微信小程序则使用本地缓存
export const db = {
	init() {
		// 初始化数据表（本地缓存）如果不存在则赋初始值
		if (!uni.getStorageSync('sensor_data')) {
			uni.setStorageSync('sensor_data', []);
		}
		if (!uni.getStorageSync('sleep_records')) {
			uni.setStorageSync('sleep_records', []);
		}
		if (!uni.getStorageSync('ai_analysis')) {
			uni.setStorageSync('ai_analysis', []);
		}
	},
	
	// 插入单条实时体征数据
	insertSensorData(data) {
		let table = uni.getStorageSync('sensor_data') || [];
		// 限制容量，只保存最近的 1000 条数据防止撑爆内存
		if (table.length >= 1000) {
			table.shift();
		}
		table.push(data);
		uni.setStorageSync('sensor_data', table);
	},
	
	// 获取所有可用的体征数据（用于渲染图表）
	getSensorData() {
		return uni.getStorageSync('sensor_data') || [];
	},
	
	// 插入一次完整的睡眠记录
	insertSleepRecord(record) {
		let table = uni.getStorageSync('sleep_records') || [];
		table.unshift(record); // 最新记录放前面
		uni.setStorageSync('sleep_records', table);
	},
	
	// 插入 AI 诊断历史
	insertAiAnalysis(record) {
		let table = uni.getStorageSync('ai_analysis') || [];
		table.unshift(record);
		uni.setStorageSync('ai_analysis', table);
	},

	// 获取所有的 AI 诊断历史
	getAiAnalysis() {
		return uni.getStorageSync('ai_analysis') || [];
	},

	// 【新增】聚合计算睡眠期间的宏观特征
	aggregateNightlyData() {
		let dataList = this.getSensorData();
		if(!dataList || dataList.length === 0) return null;
		
		let totalHr = 0;
		let maxHr = 0;
		let hrOver100Count = 0;
		
		dataList.forEach(item => {
			let hr = item.heart_rate;
			totalHr += hr;
			if(hr > maxHr) maxHr = hr;
			if(hr > 100) hrOver100Count++;
		});
		
		let avgHr = Math.round(totalHr / dataList.length);
		
		return {
			avgHr,
			maxHr,
			hrOver100Count,
			dataCount: dataList.length
		};
	}
}
